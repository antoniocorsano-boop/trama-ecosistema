create table professional_principal (
  principal_id uuid primary key default gen_random_uuid(),
  issuer text not null,
  subject text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'DISABLED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (issuer, subject)
);

create table principal_context (
  principal_id uuid primary key references professional_principal(principal_id) on delete cascade,
  context_type text not null check (context_type in ('PERSONAL', 'INSTITUTION')),
  institution_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (context_type = 'PERSONAL' and institution_ref is null)
    or (context_type = 'INSTITUTION' and institution_ref is not null)
  )
);

create table principal_entitlement (
  principal_id uuid not null references professional_principal(principal_id) on delete cascade,
  application text not null,
  entitlement text not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'REVOKED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (principal_id, application),
  check (
    (application, entitlement) in (
      ('DOCENTE_OS', 'USE'),
      ('CURRICOLO_ATLAS', 'READ'),
      ('STUDIO_ATLAS', 'AUTHOR'),
      ('ARENA', 'ENTER'),
      ('CONTROL_CENTER', 'GOVERNANCE_OPERATOR')
    )
  )
);

create table access_session (
  session_digest text primary key,
  principal_id uuid not null references professional_principal(principal_id) on delete cascade,
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (expires_at > issued_at)
);

alter table professional_principal enable row level security;
alter table principal_context enable row level security;
alter table principal_entitlement enable row level security;
alter table access_session enable row level security;

-- No client-facing policies are defined in Phase 2. Access is server-side only.
