# Penpot MCP operating notes

This directory documents how the TRAMA Penpot pilot connects to MCP. It must never contain credentials.

## Cloud Penpot path

For the Penpot SaaS pilot:

1. enable MCP under the Penpot account integrations;
2. generate the MCP key;
3. keep the generated key private;
4. connect the Penpot file through its MCP Server command;
5. configure a compatible MCP client with the Penpot-provided remote URL.

Never commit or paste the remote URL when it includes `userToken`.

## Repository-managed local Penpot

The self-host baseline in the parent directory includes the official `penpot-mcp` service and enables MCP.

The service is kept on the internal Docker network. It is not exposed as a standalone public port in the TRAMA baseline.

The local pilot entry point is the Penpot frontend at:

`http://localhost:9001`

The exact MCP connection flow must be validated against the running Penpot version before promoting the self-host path.

## Pilot phases

- P0: connectivity only;
- P1: read-only inspection;
- P2: controlled write in a pilot namespace;
- P3: screen composition;
- P4: design-to-code validation.

No MCP operation may:

- modify TRAMA runtime authority;
- close governance gates;
- promote evidence;
- write credentials to Git;
- treat a Penpot canvas as canonical project state.

## Credential handling

If a Penpot MCP key or URL containing `userToken` is exposed:

1. revoke/regenerate the key in Penpot;
2. remove it from any local shell history or client configuration that should not retain it;
3. do not attempt to "clean" a committed secret by only deleting it in a later commit—rotate it first.
