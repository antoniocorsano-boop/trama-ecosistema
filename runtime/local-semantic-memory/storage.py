from __future__ import annotations
from pathlib import Path
import json, sqlite3
from contextlib import contextmanager
from contracts import validate_upsert_request, validate_remove_request, projection_identity, semantic_content_hash, RevisionConflictError

class ProjectionStore:
    def __init__(self, path):
        self.path = Path(path); self.path.parent.mkdir(parents=True, exist_ok=True); self._init()
    def _connect(self):
        c = sqlite3.connect(self.path)
        c.row_factory = sqlite3.Row
        c.execute('PRAGMA foreign_keys=ON')
        return c
    @contextmanager
    def _connection(self):
        c=self._connect()
        try:
            with c:
                yield c
        finally:
            c.close()
    def _init(self):
        with self._connection() as c:
            c.executescript('''
            CREATE TABLE IF NOT EXISTS runtime_meta(key TEXT PRIMARY KEY, value TEXT NOT NULL);
            INSERT OR IGNORE INTO runtime_meta(key,value) VALUES('index_revision','0');
            CREATE TABLE IF NOT EXISTS projections(
              source_app_id TEXT NOT NULL, source_type TEXT NOT NULL, source_id TEXT NOT NULL,
              revision TEXT NOT NULL, namespace TEXT NOT NULL, title TEXT, text TEXT NOT NULL,
              data_class TEXT NOT NULL, canonical_ref TEXT NOT NULL, updated_at TEXT NOT NULL,
              metadata_json TEXT NOT NULL, content_hash TEXT NOT NULL,
              PRIMARY KEY(source_app_id,source_type,source_id));
            CREATE TABLE IF NOT EXISTS chunks(
              chunk_id TEXT PRIMARY KEY, source_app_id TEXT NOT NULL, source_type TEXT NOT NULL, source_id TEXT NOT NULL,
              ordinal INTEGER NOT NULL, text TEXT NOT NULL, text_hash TEXT NOT NULL,
              FOREIGN KEY(source_app_id,source_type,source_id) REFERENCES projections(source_app_id,source_type,source_id) ON DELETE CASCADE);
            CREATE TABLE IF NOT EXISTS vectors(
              chunk_id TEXT PRIMARY KEY, model_id TEXT NOT NULL, dimensions INTEGER NOT NULL, embedding BLOB NOT NULL,
              FOREIGN KEY(chunk_id) REFERENCES chunks(chunk_id) ON DELETE CASCADE);
            ''')
    def _current(self, c, ident):
        return c.execute('SELECT * FROM projections WHERE source_app_id=? AND source_type=? AND source_id=?', ident).fetchone()
    def _decision(self, current, p, expected):
        h = semantic_content_hash(p)
        if current is None:
            if expected is not None: raise RevisionConflictError('expected revision does not match absent source')
            return 'inserted', h
        if expected is None or expected != current['revision']:
            raise RevisionConflictError('revision conflict')
        if p['revision'] == current['revision']:
            if h == current['content_hash']: return 'unchanged', h
            raise RevisionConflictError('same revision with different semantic payload')
        return 'replaced', h
    def preflight_upsert(self, request):
        r=validate_upsert_request(request); p=r['projection']; ident=projection_identity(p)
        with self._connection() as c:
            current=self._current(c,ident); status,h=self._decision(current,p,r['expectedRevision'])
            return {'status':status,'content_hash':h,'projection':p}
    def _write_projection(self, c, p, h):
        c.execute('''INSERT INTO projections(source_app_id,source_type,source_id,revision,namespace,title,text,data_class,canonical_ref,updated_at,metadata_json,content_hash)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(source_app_id,source_type,source_id) DO UPDATE SET
        revision=excluded.revision,namespace=excluded.namespace,title=excluded.title,text=excluded.text,data_class=excluded.data_class,
        canonical_ref=excluded.canonical_ref,updated_at=excluded.updated_at,metadata_json=excluded.metadata_json,content_hash=excluded.content_hash''',
        (p['sourceAppId'],p['sourceType'],p['sourceId'],p['revision'],p['namespace'],p.get('title'),p['text'],p['dataClass'],p['canonicalRef'],p['updatedAt'],json.dumps(p.get('metadata',{}),ensure_ascii=False,sort_keys=True),h))
    def upsert(self, request):
        r = validate_upsert_request(request); p = r['projection']; ident = projection_identity(p)
        with self._connection() as c:
            c.execute('BEGIN IMMEDIATE'); current = self._current(c, ident); status,h = self._decision(current,p,r['expectedRevision'])
            if status != 'unchanged':
                self._write_projection(c,p,h); self._bump_index_revision(c)
            return self._upsert_receipt(status,p)
    def commit_indexed(self, request, chunks, vectors, *, model_id=None, dimensions=None, before_commit=None):
        r=validate_upsert_request(request); p=r['projection']; ident=projection_identity(p)
        with self._connection() as c:
            c.execute('BEGIN IMMEDIATE'); current=self._current(c,ident); status,h=self._decision(current,p,r['expectedRevision'])
            if status == 'unchanged': return {'status':'unchanged','revision':p['revision']}
            self._write_projection(c,p,h)
            c.execute('DELETE FROM chunks WHERE source_app_id=? AND source_type=? AND source_id=?', ident)
            for ch in chunks:
                c.execute('INSERT INTO chunks(chunk_id,source_app_id,source_type,source_id,ordinal,text,text_hash) VALUES(?,?,?,?,?,?,?)',
                          (ch['chunk_id'],*ident,ch['ordinal'],ch['text'],ch['text_hash']))
            for v in vectors:
                c.execute('INSERT INTO vectors(chunk_id,model_id,dimensions,embedding) VALUES(?,?,?,?)',
                          (v['chunk_id'],v['model_id'],v['dimensions'],v['embedding']))
            if model_id is not None:
                c.execute("INSERT INTO runtime_meta(key,value) VALUES('model_id',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",(str(model_id),))
            if dimensions is not None:
                c.execute("INSERT INTO runtime_meta(key,value) VALUES('dimensions',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",(str(dimensions),))
            if before_commit: before_commit(c)
            self._bump_index_revision(c)
            return self._upsert_receipt(status,p)
    def _source(self,p):
        return {'sourceAppId':p['sourceAppId'],'sourceType':p['sourceType'],'sourceId':p['sourceId']}
    def _upsert_receipt(self,status,p):
        return {'schema':'trama.semantic-memory-upsert-receipt/v1','status':status,'source':self._source(p),'revision':p['revision']}
    def _bump_index_revision(self,c):
        current=int(c.execute("SELECT value FROM runtime_meta WHERE key='index_revision'").fetchone()[0])
        c.execute("UPDATE runtime_meta SET value=? WHERE key='index_revision'",(str(current+1),))
    def remove(self, request):
        r=validate_remove_request(request); src=r['source']; ident=(src['sourceAppId'],src['sourceType'],src['sourceId'])
        with self._connection() as c:
            c.execute('BEGIN IMMEDIATE'); current=self._current(c,ident)
            if current is None:
                if r['expectedRevision'] is None: return {'schema':'trama.semantic-memory-remove-receipt/v1','status':'absent','source':src,'revision':None}
                raise RevisionConflictError('revision conflict')
            if r['expectedRevision'] != current['revision']: raise RevisionConflictError('revision conflict')
            c.execute('DELETE FROM projections WHERE source_app_id=? AND source_type=? AND source_id=?', ident)
            self._bump_index_revision(c)
            return {'schema':'trama.semantic-memory-remove-receipt/v1','status':'removed','source':src,'revision':current['revision']}
    def get_projection(self, identity):
        with self._connection() as c:
            r=self._current(c,identity)
            if not r: return None
            return {'sourceAppId':r['source_app_id'],'sourceType':r['source_type'],'sourceId':r['source_id'],'revision':r['revision'],'namespace':r['namespace'],'title':r['title'],'text':r['text'],'dataClass':r['data_class'],'canonicalRef':r['canonical_ref'],'updatedAt':r['updated_at'],'metadata':json.loads(r['metadata_json']),'contentHash':r['content_hash']}
    def list_indexable(self):
        with self._connection() as c:
            rows=c.execute('SELECT source_app_id,source_type,source_id,revision FROM projections ORDER BY source_app_id,source_type,source_id').fetchall()
            return [dict(r) for r in rows]
    def get_meta(self,key):
        with self._connection() as c:
            r=c.execute('SELECT value FROM runtime_meta WHERE key=?',(key,)).fetchone(); return r['value'] if r else None
    def set_meta(self,key,value):
        with self._connection() as c:
            c.execute('INSERT INTO runtime_meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',(key,str(value)))
    def delete_meta(self,key):
        with self._connection() as c: c.execute('DELETE FROM runtime_meta WHERE key=?',(key,))
    def index_signature(self):
        model=self.get_meta('model_id'); dims=self.get_meta('dimensions')
        return (model, int(dims)) if model and dims else None
    def index_revision(self):
        return self.get_meta('index_revision') or '0'
    def count_vectors(self):
        with self._connection() as c: return c.execute('SELECT COUNT(*) FROM vectors').fetchone()[0]
    def rows_for_search(self, namespaces, data_classes):
        if not namespaces or not data_classes: return []
        qn=','.join('?'*len(namespaces)); qd=','.join('?'*len(data_classes))
        sql=f'''SELECT p.*,c.chunk_id,c.text AS chunk_text,c.ordinal,v.model_id,v.dimensions,v.embedding
        FROM projections p JOIN chunks c USING(source_app_id,source_type,source_id) JOIN vectors v USING(chunk_id)
        WHERE p.namespace IN ({qn}) AND p.data_class IN ({qd})'''
        with self._connection() as c: return c.execute(sql,(*namespaces,*data_classes)).fetchall()
