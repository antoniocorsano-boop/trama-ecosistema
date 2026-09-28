"""CC-MSS-01 — PUBLIC_ANONYMOUS_READ_ONLY source boundary.

No secret, token, Authorization header, environment lookup, subprocess,
cookie, proxy inheritance or live authorization is implemented here.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Protocol

class AnonymousReadOnlyError(RuntimeError): pass
def die(code:str): raise AnonymousReadOnlyError(code)

PUBLIC_AUTHORITY="api.github.com"
ALLOWED_OPERATIONS={"repo.read","ref.read","commit.read"}

@dataclass(frozen=True)
class AnonymousPrincipal:
    provider:str
    principal_ref:str
    repository:str
    operation:str
    provenance:str
    def validate(self):
        if self.provider!="github-public-anonymous": die("PROVIDER_INVALID")
        if self.principal_ref!="PUBLIC_ANONYMOUS": die("PRINCIPAL_INVALID")
        if not self.repository or self.operation not in ALLOWED_OPERATIONS: die("ANONYMOUS_SCOPE_INVALID")
        if self.provenance!="github-public-api/v1": die("PROVENANCE_INVALID")
        return self

class PublicRepositoryVerifier(Protocol):
    def verify_public(self,repository:str)->bool: ...

class GovernedAnonymousReadOnlySource:
    def __init__(self,verifier:PublicRepositoryVerifier,enrollment:dict):
        self._verifier=verifier
        self._allowed={x["repository"]:x for x in enrollment.get("repositories",[]) if x.get("state")=="ENROLLED"}

    def authorize(self,repository:str,operation:str)->AnonymousPrincipal:
        if repository not in self._allowed: die("REPOSITORY_NOT_ENROLLED")
        if operation not in ALLOWED_OPERATIONS: die("OPERATION_NOT_ALLOWED")
        if not self._verifier.verify_public(repository): die("REPOSITORY_NOT_PUBLIC")
        return AnonymousPrincipal("github-public-anonymous","PUBLIC_ANONYMOUS",repository,operation,"github-public-api/v1").validate()

def request_descriptor(principal:AnonymousPrincipal,path:str)->dict:
    principal.validate()
    expected_prefix="/repos/"+principal.repository+"/"
    if not isinstance(path,str) or not path.startswith(expected_prefix): die("PATH_BINDING_MISMATCH")
    if "://" in path or any(x in path for x in ("\r","\n","#","?access_token=","?token=")): die("PATH_INVALID")
    return {
      "method":"GET",
      "scheme":"https",
      "host":PUBLIC_AUTHORITY,
      "path":path,
      "redirect":"DENY",
      "authorizationHeader":"ABSENT",
      "cookieHeader":"ABSENT",
      "proxyPolicy":"DISABLED",
      "principalRef":principal.principal_ref,
      "provenance":principal.provenance,
      "operation":principal.operation,
      "repository":principal.repository
    }
