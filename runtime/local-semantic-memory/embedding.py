from __future__ import annotations
from dataclasses import dataclass
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
import json, math, socket
from contracts import EmbeddingError

LOOPBACK_HOSTS={'127.0.0.1','localhost','::1'}

@dataclass(frozen=True)
class EmbeddingResult:
    vector: tuple[float, ...]
    model_id: str
    dimensions: int

class LocalEmbeddingClient:
    def __init__(self, base_url: str, model_id: str, timeout: float=15.0):
        p=urlparse(base_url)
        if p.scheme != 'http' or p.hostname not in LOOPBACK_HOSTS:
            raise EmbeddingError('embedding endpoint must be http loopback')
        if not model_id: raise EmbeddingError('model id required')
        self.base_url=base_url.rstrip('/'); self.model_id=model_id; self.timeout=float(timeout)
        if self.timeout <= 0: raise EmbeddingError('timeout must be positive')
    def embed(self, text: str) -> EmbeddingResult:
        payload=json.dumps({'model':self.model_id,'input':text},separators=(',',':')).encode()
        req=Request(self.base_url+'/v1/embeddings',data=payload,headers={'Content-Type':'application/json'},method='POST')
        try:
            with urlopen(req, timeout=self.timeout) as resp:
                raw=resp.read()
        except (HTTPError, URLError, socket.timeout, TimeoutError, OSError) as exc:
            raise EmbeddingError('local embedding request failed') from exc
        try:
            obj=json.loads(raw)
            vec=obj['data'][0]['embedding']
        except Exception as exc:
            raise EmbeddingError('invalid embedding response') from exc
        if not isinstance(vec,list) or not vec:
            raise EmbeddingError('embedding vector must be non-empty array')
        cleaned=[]
        for x in vec:
            if isinstance(x,bool) or not isinstance(x,(int,float)) or not math.isfinite(float(x)):
                raise EmbeddingError('embedding vector contains invalid value')
            cleaned.append(float(x))
        model=obj.get('model') or self.model_id
        if not isinstance(model,str) or not model:
            raise EmbeddingError('embedding model id invalid')
        return EmbeddingResult(tuple(cleaned),model,len(cleaned))
