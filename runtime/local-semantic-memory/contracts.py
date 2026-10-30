from __future__ import annotations
import hashlib, json, math

ALLOWED_DATA_CLASSES = {
    'PUBLIC_APP','TEACHER_PROFESSIONAL','CURRICOLO','AGGREGATED_NON_IDENTIFIABLE'
}

class ValidationError(ValueError): pass
class RevisionConflictError(RuntimeError): pass
class RebuildRequiredError(RuntimeError): pass
class EmbeddingError(RuntimeError): pass
class StorageError(RuntimeError): pass


def _need_str(obj, key, *, allow_empty=False):
    v = obj.get(key)
    if not isinstance(v, str) or (not allow_empty and not v.strip()):
        raise ValidationError(f'{key} must be a non-empty string')
    return v

def validate_projection(p):
    if not isinstance(p, dict) or p.get('schema') != 'trama.semantic-memory-projection/v1':
        raise ValidationError('invalid projection schema')
    for k in ('sourceAppId','sourceType','sourceId','revision','namespace','text','canonicalRef','updatedAt'):
        _need_str(p, k, allow_empty=(k == 'text'))
    dc = _need_str(p, 'dataClass')
    if dc not in ALLOWED_DATA_CLASSES:
        raise ValidationError('data class not allowed')
    title = p.get('title')
    if title is not None and not isinstance(title, str): raise ValidationError('title must be string')
    meta = p.get('metadata') or {}
    if not isinstance(meta, dict): raise ValidationError('metadata must be object')
    clean = {}
    for k,v in meta.items():
        if not isinstance(k, str) or not isinstance(v, str):
            raise ValidationError('metadata must be string-to-string')
        clean[k] = v
    out = dict(p); out['metadata'] = clean
    return out

def validate_upsert_request(r):
    if not isinstance(r, dict) or r.get('schema') != 'trama.semantic-memory-upsert-request/v1':
        raise ValidationError('invalid upsert schema')
    p = validate_projection(r.get('projection'))
    exp = r.get('expectedRevision')
    if exp is not None and not isinstance(exp, str): raise ValidationError('expectedRevision must be string or null')
    return {'schema':r['schema'],'projection':p,'expectedRevision':exp}

def validate_remove_request(r):
    if not isinstance(r, dict) or r.get('schema') != 'trama.semantic-memory-remove-request/v1':
        raise ValidationError('invalid remove schema')
    out = {'schema':r['schema']}
    for k in ('sourceAppId','sourceType','sourceId'): out[k] = _need_str(r,k)
    exp = r.get('expectedRevision')
    if exp is not None and not isinstance(exp, str): raise ValidationError('expectedRevision must be string or null')
    out['expectedRevision'] = exp
    return out

def projection_identity(p):
    return (p['sourceAppId'], p['sourceType'], p['sourceId'])

def semantic_content_hash(p):
    body = {k:p.get(k) for k in ('sourceAppId','sourceType','sourceId','revision','namespace','title','text','dataClass','canonicalRef','updatedAt','metadata')}
    raw = json.dumps(body, ensure_ascii=False, sort_keys=True, separators=(',',':')).encode('utf-8')
    return hashlib.sha256(raw).hexdigest()
