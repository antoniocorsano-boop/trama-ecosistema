"""CC-MSS-01 — governed read-only credential source boundary.

This module defines the production-facing capability boundary only.
It does NOT contain a GitHub secret, mint an installation token, read .env,
invoke subprocesses, or authorize network execution.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import Protocol

class ReadOnlyCredentialError(RuntimeError):
    pass

def die(code: str):
    raise ReadOnlyCredentialError(code)

FORBIDDEN_WRITE_PERMISSIONS={"admin","maintain","push","contents:write","metadata:write","pull_requests:write","actions:write"}

@dataclass(frozen=True)
class PrincipalDescriptor:
    provider: str
    principal_ref: str
    repository: str
    permissions: tuple[str,...]
    provenance: str

    def validate(self):
        if self.provider!="github":
            die("PROVIDER_NOT_GITHUB")
        if not self.principal_ref or not self.repository or not self.provenance:
            die("PRINCIPAL_DESCRIPTOR_INCOMPLETE")
        p=set(self.permissions)
        if not p or "contents:read" not in p:
            die("READ_PERMISSION_MISSING")
        if p & FORBIDDEN_WRITE_PERMISSIONS or any(x.endswith(":write") for x in p):
            die("WRITE_CAPABILITY_PRESENT")
        return self

class SecretContext(Protocol):
    @property
    def principal(self)->PrincipalDescriptor: ...
    def authorization_header(self)->str: ...
    def invalidate(self)->None: ...

class ManagedReadOnlyCredentialBackend(Protocol):
    """Separately configured provider-managed backend, e.g. a read-only GitHub App installation."""
    def materialize(self, credential_ref:str, repository:str)->SecretContext: ...

class GovernedReadOnlyCredentialSource:
    def __init__(self, backend:ManagedReadOnlyCredentialBackend, enrollment:dict):
        self._backend=backend
        self._allowed={x["repository"]:x for x in enrollment.get("repositories",[]) if x.get("state")=="ENROLLED"}

    def materialize(self, credential_ref:str, repository:str)->SecretContext:
        if repository not in self._allowed:
            die("REPOSITORY_NOT_ENROLLED")
        if not isinstance(credential_ref,str) or not credential_ref.startswith("github-app-installation:"):
            die("CREDENTIAL_REF_NOT_GOVERNED")
        ctx=self._backend.materialize(credential_ref,repository)
        try:
            descriptor=ctx.principal.validate()
            if descriptor.repository!=repository:
                die("PRINCIPAL_REPOSITORY_MISMATCH")
            return ctx
        except BaseException:
            ctx.invalidate()
            raise

def permission_attestation(ctx:SecretContext, repository:str)->dict:
    descriptor=ctx.principal.validate()
    if descriptor.repository!=repository:
        die("PRINCIPAL_REPOSITORY_MISMATCH")
    return {
        "repository":repository,
        "principalRef":descriptor.principal_ref,
        "permissions":descriptor.permissions,
        "provenance":descriptor.provenance,
    }
