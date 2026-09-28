"""CC-MSS-01 — governed read-only credential + authoritative permission boundary.

No secret, network client, environment lookup, subprocess or live authorization is implemented here.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Protocol

class ReadOnlyCredentialError(RuntimeError): pass
def die(code:str): raise ReadOnlyCredentialError(code)

ALLOWED_ATTESTATION_PROVENANCE={"github-app-installation-permissions-api/v1"}
FORBIDDEN_WRITE_PERMISSIONS={"admin","maintain","push","contents:write","metadata:write","pull_requests:write","actions:write"}

@dataclass(frozen=True)
class CredentialPrincipal:
    provider:str
    principal_ref:str
    repository:str
    credential_ref:str
    def validate(self):
        if self.provider!="github": die("PROVIDER_NOT_GITHUB")
        if not self.principal_ref or not self.repository or not self.credential_ref: die("PRINCIPAL_INCOMPLETE")
        return self

@dataclass(frozen=True)
class PermissionAttestation:
    repository:str
    credential_ref:str
    principal_ref:str
    permissions:tuple[str,...]
    provenance:str
    state:str
    def validate(self):
        if self.state!="VERIFIED": die("PERMISSION_STATE_UNKNOWN")
        if self.provenance not in ALLOWED_ATTESTATION_PROVENANCE: die("PERMISSION_PROVENANCE_UNTRUSTED")
        p=set(self.permissions)
        if not p or "contents:read" not in p: die("READ_PERMISSION_MISSING")
        if p & FORBIDDEN_WRITE_PERMISSIONS or any(x.endswith(":write") for x in p): die("WRITE_CAPABILITY_PRESENT")
        return self

class SecretContext(Protocol):
    @property
    def principal(self)->CredentialPrincipal: ...
    def authorization_header(self)->str: ...
    def invalidate(self)->None: ...

class ManagedCredentialBackend(Protocol):
    def materialize(self,credential_ref:str,repository:str)->SecretContext: ...

class AuthoritativePermissionSource(Protocol):
    def attest(self,repository:str,credential_ref:str,principal_ref:str)->PermissionAttestation: ...

class GovernedReadOnlyCredentialSource:
    def __init__(self,backend:ManagedCredentialBackend,permission_source:AuthoritativePermissionSource,enrollment:dict):
        self._backend=backend;self._permissions=permission_source
        self._allowed={x["repository"]:x for x in enrollment.get("repositories",[]) if x.get("state")=="ENROLLED"}

    def materialize(self,credential_ref:str,repository:str)->SecretContext:
        if repository not in self._allowed: die("REPOSITORY_NOT_ENROLLED")
        if not isinstance(credential_ref,str) or not credential_ref.startswith("github-app-installation:"): die("CREDENTIAL_REF_NOT_GOVERNED")
        ctx=self._backend.materialize(credential_ref,repository)
        try:
            p=ctx.principal.validate()
            if p.repository!=repository or p.credential_ref!=credential_ref: die("PRINCIPAL_BINDING_MISMATCH")
            a=self._permissions.attest(repository,credential_ref,p.principal_ref).validate()
            if a.repository!=repository or a.credential_ref!=credential_ref or a.principal_ref!=p.principal_ref: die("PERMISSION_BINDING_MISMATCH")
            return ctx
        except BaseException:
            ctx.invalidate();raise

    def attest(self,ctx:SecretContext,repository:str)->dict:
        p=ctx.principal.validate()
        a=self._permissions.attest(repository,p.credential_ref,p.principal_ref).validate()
        if a.repository!=repository or a.credential_ref!=p.credential_ref or a.principal_ref!=p.principal_ref: die("PERMISSION_BINDING_MISMATCH")
        return {"repository":a.repository,"credentialRef":a.credential_ref,"principalRef":a.principal_ref,"permissions":a.permissions,"provenance":a.provenance,"state":a.state}
