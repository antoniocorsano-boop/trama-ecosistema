from __future__ import annotations
import hashlib, json

ALLOWED_DATA_CLASSES = {
    'PUBLIC_APP','TEACHER_PROFESSIONAL','CURRICOLO','AGGREGATED_NON_IDENTIFIABLE'
}

class ValidationError(ValueError): pass
class RevisionConflictError(RuntimeError): pass
class RebuildRequiredError(RuntimeError): pass
class EmbeddingError(RuntimeError): pass
class StorageError(RuntimeError): pass


def _record(value, label='input'):
    if type(value) is not dict:
        raise ValidationError(f'{label} must be an object')
    return value

def _nonblank(value, field):
    if not isinstance(value,str) or not value.strip():
        raise ValidationError(f'{field} must be a non-blank string')
    return value

def _string(value, field):
    if not isinstance(value,str): raise ValidationError(f'{field} must be a string')
    return value

def _allowed_class(value, field='dataClass'):
    v=_nonblank(value,field)
    if v not in ALLOWED_DATA_CLASSES: raise ValidationError(f'{field} is not allowed')
    return v

def _expected_revision(r):
    if 'expectedRevision' not in r: raise ValidationError('expectedRevision is required')
    value=r['expectedRevision']
    if value is None: return None
    return _nonblank(value,'expectedRevision')

def validate_source_ref(value):
    v=_record(value,'source')
    return {'sourceAppId':_nonblank(v.get('sourceAppId'),'sourceAppId'),
            'sourceType':_nonblank(v.get('sourceType'),'sourceType'),
            'sourceId':_nonblank(v.get('sourceId'),'sourceId')}

def validate_projection(p):
    p=_record(p)
    if p.get('schema') != 'trama.semantic-memory-projection/v1': raise ValidationError('invalid projection schema')
    out={'schema':p['schema'],
         'sourceAppId':_nonblank(p.get('sourceAppId'),'sourceAppId'),
         'sourceType':_nonblank(p.get('sourceType'),'sourceType'),
         'sourceId':_nonblank(p.get('sourceId'),'sourceId'),
         'revision':_nonblank(p.get('revision'),'revision'),
         'namespace':_nonblank(p.get('namespace'),'namespace')}
    if 'title' in p: out['title']=_nonblank(p.get('title'),'title')
    out.update({'text':_nonblank(p.get('text'),'text'),
                'dataClass':_allowed_class(p.get('dataClass')),
                'canonicalRef':_nonblank(p.get('canonicalRef'),'canonicalRef'),
                'updatedAt':_nonblank(p.get('updatedAt'),'updatedAt')})
    if 'metadata' in p:
        meta=_record(p['metadata'],'metadata'); clean={}
        for k,v in meta.items():
            if not isinstance(k,str) or not isinstance(v,str): raise ValidationError('metadata must be string-to-string')
            clean[k]=v
        out['metadata']=clean
    return out

def validate_upsert_request(r):
    r=_record(r)
    if r.get('schema') != 'trama.semantic-memory-upsert-request/v1': raise ValidationError('invalid upsert schema')
    return {'schema':r['schema'],'projection':validate_projection(r.get('projection')),'expectedRevision':_expected_revision(r)}

def validate_remove_request(r):
    r=_record(r)
    if r.get('schema') != 'trama.semantic-memory-remove-request/v1': raise ValidationError('invalid remove schema')
    return {'schema':r['schema'],'source':validate_source_ref(r.get('source')),'expectedRevision':_expected_revision(r)}

def projection_identity(p): return (p['sourceAppId'],p['sourceType'],p['sourceId'])

def semantic_content_hash(p):
    body={k:p.get(k) for k in ('sourceAppId','sourceType','sourceId','revision','namespace','title','text','dataClass','canonicalRef','updatedAt','metadata')}
    return hashlib.sha256(json.dumps(body,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()

def _unique_nonblank(values, field):
    if not isinstance(values,list) or not values: raise ValidationError(f'{field} must be a non-empty array')
    out=[]; seen=set()
    for item in values:
        v=_nonblank(item,field).strip()
        if v not in seen: seen.add(v); out.append(v)
    if not out: raise ValidationError(f'{field} must contain at least one value')
    return tuple(out)

def validate_search_request(r):
    r=_record(r)
    if r.get('schema') != 'trama.semantic-memory-search-request/v1': raise ValidationError('invalid search schema')
    query=_string(r.get('query'),'query').strip()
    namespaces=_unique_nonblank(r.get('namespaces'),'namespaces')
    raw_classes=_unique_nonblank(r.get('allowedDataClasses'),'allowedDataClasses')
    classes=tuple(_allowed_class(x,'allowedDataClasses') for x in raw_classes)
    limit=r.get('limit')
    if isinstance(limit,bool) or not isinstance(limit,int) or not 1 <= limit <= 20: raise ValidationError('limit must be 1..20')
    return {'schema':r['schema'],'query':query,'namespaces':namespaces,'allowedDataClasses':classes,'limit':limit}
