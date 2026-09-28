"""CC-MSS-01 C2 Adapter M0 — INERT. No network/credential implementation."""
import json,re,zlib
from dataclasses import dataclass
from typing import Protocol,Iterable
class M0Error(RuntimeError):pass
def die(c):raise M0Error(c)
OWNER_REPO=re.compile(r'^[A-Za-z0-9_.-]{1,100}$');SHA=re.compile(r'^[0-9a-fA-F]{40}$');REF=re.compile(r'^[A-Za-z0-9._/-]{1,200}$')
@dataclass(frozen=True)
class Descriptor:
 operation:str;method:str;scheme:str;host:str;path_template:str;schema:str;pagination:str;anchor_required:bool;resource_policy:str;redirect_policy:str='DENY'
OPS={
 'repo.read':Descriptor('repo.read','GET','https','api.github.com','/repos/{owner}/{repo}','repo-v1','NONE',True,'m0-default'),
 'ref.read':Descriptor('ref.read','GET','https','api.github.com','/repos/{owner}/{repo}/git/ref/heads/{ref}','ref-v1','NONE',True,'m0-default'),
 'commit.read':Descriptor('commit.read','GET','https','api.github.com','/repos/{owner}/{repo}/commits/{sha}','commit-v1','NONE',True,'m0-default')}
def clean(kind,value):
 if not isinstance(value,str) or any(c in value for c in '\r\n?#%\\') or '..' in value or '://' in value:die('PATH_INPUT_INVALID')
 rx={'owner':OWNER_REPO,'repo':OWNER_REPO,'ref':REF,'sha':SHA}[kind]
 if not rx.fullmatch(value) or value.startswith('/') or value.endswith('/'):die('PATH_INPUT_INVALID')
 return value
def request(operation,owner,repo,credential_ref,ref=None,sha=None):
 if operation not in OPS:die('UNKNOWN_OPERATION')
 d=OPS[operation]
 if d.method!='GET' or d.scheme!='https' or d.host!='api.github.com' or d.redirect_policy!='DENY':die('DESCRIPTOR_BOUNDARY_INVALID')
 vals={'owner':clean('owner',owner),'repo':clean('repo',repo)}
 if '{ref}' in d.path_template:vals['ref']=clean('ref',ref)
 if '{sha}' in d.path_template:vals['sha']=clean('sha',sha)
 if not credential_ref or credential_ref.startswith(('token:','ghp_','github_pat_')):die('CREDENTIAL_REF_INVALID')
 return {'operation':operation,'method':'GET','scheme':'https','host':'api.github.com','path':d.path_template.format(**vals),'schema':d.schema,'pagination':d.pagination,'redirect':'DENY','credentialRef':credential_ref,'resourcePolicy':d.resource_policy}
@dataclass(frozen=True)
class Limits:
 max_compressed:int=65536;max_decompressed:int=262144;max_session:int=524288;max_depth:int=32
class PermissionSource(Protocol):
 def observed_permissions(self,repository:str)->dict:...
class Transport(Protocol):
 def execute(self,validated_request:dict,limits:Limits)->Iterable[bytes]:...
def depth(x,n=0):
 if n>64:return n
 if isinstance(x,dict):return max([n]+[depth(v,n+1) for v in x.values()])
 if isinstance(x,list):return max([n]+[depth(v,n+1) for v in x])
 return n
def bounded_json(chunks,limits=Limits(),compressed=False):
 total=0;out=bytearray();dec=zlib.decompressobj() if compressed else None
 for chunk in chunks:
  if not isinstance(chunk,(bytes,bytearray)):die('RESPONSE_CHUNK_INVALID')
  total+=len(chunk)
  if total>limits.max_compressed:die('SOURCE_RESOURCE_LIMIT_EXCEEDED')
  part=dec.decompress(chunk,max(0,limits.max_decompressed+1-len(out))) if dec else chunk
  out.extend(part)
  if len(out)>limits.max_decompressed or (dec and dec.unconsumed_tail):die('SOURCE_RESOURCE_LIMIT_EXCEEDED')
 if dec:
  try:out.extend(dec.flush(max(0,limits.max_decompressed+1-len(out))))
  except zlib.error:die('MALFORMED_RESPONSE')
 if len(out)>limits.max_decompressed or len(out)>limits.max_session:die('SOURCE_RESOURCE_LIMIT_EXCEEDED')
 try:x=json.loads(out.decode('utf-8'))
 except (UnicodeDecodeError,json.JSONDecodeError):die('MALFORMED_RESPONSE')
 if depth(x)>limits.max_depth:die('SOURCE_RESOURCE_LIMIT_EXCEEDED')
 return x
