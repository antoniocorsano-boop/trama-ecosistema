import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";

const url = process.env.PENPOT_MCP_URL;
if (!url) {
  console.error("PENPOT_MCP_URL is required");
  process.exit(2);
}

const client = new Client({
  name: "trama-penpot-p0-p1-probe",
  version: "1.0.0"
});

const transport = new StreamableHTTPClientTransport(new URL(url));

try {
  await client.connect(transport);

  const negotiated = client.getNegotiatedProtocolVersion?.() ?? "unknown";
  const tools = await client.listTools();

  const names = tools.tools.map((t) => t.name).sort();

  console.log(JSON.stringify({
    status: "PASS",
    phase: "P0_P1_READ_ONLY",
    negotiatedProtocolVersion: negotiated,
    toolCount: names.length,
    tools: names
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({
    status: "FAIL",
    phase: "P0_P1_READ_ONLY",
    error: error instanceof Error ? error.message : String(error)
  }, null, 2));
  process.exit(1);
} finally {
  try {
    await client.close();
  } catch {
    // no-op
  }
}
