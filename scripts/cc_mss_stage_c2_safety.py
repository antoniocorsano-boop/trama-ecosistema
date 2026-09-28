import json,re,zlib
class SafetyError(RuntimeError):pass
FORBIDDEN_WRITE={'contents:write','pull_requests:write','actions:write','issues:write','administration:write','deployments:write'}
SENSITIVE_KEYS={'authorization','cookie','set-cookie','access_token','token','password','secret','api_key','apikey'}
def permission_attestation(observed,required_reads):
 if not isinstance(observed,dict) or any(x not in observed for x in required_reads):status='UNKNOWN'
 elif any(observed.get(x) is True for x in FORBIDDEN_WRITE):status='WRITE_PRESENT'
 elif all(observed.get(x) is True for x in required_reads):status='VERIFIED_READ_ONLY'
 else:status='UNKNOWN'
 return {'observedPermissions':observed,'requiredReadSet':sorted(required_reads),'forbiddenWriteSet':sorted(FORBIDDEN_WRITE),'attestationStatus':status}
class BudgetLedger:
 def __init__(self,maximum,reserved_close=1):self.maximum=maximum;self.reserved_close=reserved_close;self.used=0;self.closed=False
 def consume(self,n=1,dependent=False):
  if self.used+n>self.maximum:raise SafetyError('REQUEST_BUDGET_EXHAUSTED')
  if dependent and self.maximum-(self.used+n)<self.reserved_close:raise SafetyError('REQUEST_BUDGET_INSUFFICIENT')
  self.used+=n
 def close(self):
  if self.closed:return
  if self.used+1>self.maximum:raise SafetyError('REQUEST_BUDGET_EXHAUSTED')
  self.used+=1;self.closed=True
class BoundedInflater:
 def __init__(self,max_compressed,max_decompressed):self.mc=max_compressed;self.md=max_decompressed
 def inflate(self,data):
  if len(data)>self.mc:raise SafetyError('SOURCE_RESOURCE_LIMIT_EXCEEDED')
  o=zlib.decompressobj();out=bytearray()
  for i in range(0,len(data),64):
   chunk=o.decompress(data[i:i+64],max(0,self.md+1-len(out)));out.extend(chunk)
   if len(out)>self.md or o.unconsumed_tail:raise SafetyError('SOURCE_RESOURCE_LIMIT_EXCEEDED')
  out.extend(o.flush(max(0,self.md+1-len(out))))
  if len(out)>self.md:raise SafetyError('SOURCE_RESOURCE_LIMIT_EXCEEDED')
  return bytes(out)
class EphemeralSink:
 def __init__(self):self.items=[]
 def put(self,evidence):self.items.append(evidence)
 def remote_put(self,*a,**k):raise SafetyError('REMOTE_PERSISTENCE_FORBIDDEN')
def redact(v,key=''):
 if str(key).lower() in SENSITIVE_KEYS:return '[REDACTED]'
 if isinstance(v,dict):return {k:redact(x,k) for k,x in v.items()}
 if isinstance(v,list):return [redact(x) for x in v]
 if isinstance(v,str):
  v=re.sub(r'(?i)(authorization\s*[:=]\s*)([^\s,;]+(?:\s+[^\s,;]+)?)',r'\1[REDACTED]',v)
  v=re.sub(r'(?i)(bearer\s+)[A-Za-z0-9._~+/=-]+',r'\1[REDACTED]',v)
  v=re.sub(r'(?i)((?:access_?token|api_?key|password|secret)=)[^&\s]+',r'\1[REDACTED]',v)
 return v
def safe_log(payload):return json.dumps(redact(payload),sort_keys=True,separators=(',',':'))
