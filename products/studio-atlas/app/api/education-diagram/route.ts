import {spawn} from "node:child_process";
import path from "node:path";

export const runtime = "nodejs";
const MAX_SOURCE = 8192;
const MAX_RESULT = 256 * 1024;
let rendering = false;

function respond(value: unknown, status = 200) {
  return Response.json(value, {status, headers: {"Cache-Control": "no-store"}});
}

async function readSource(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const {done, value} = await reader.read();
      if (done) return Buffer.concat(chunks, size);
      size += value.byteLength;
      if (size > MAX_SOURCE) {
        void reader.cancel().catch(() => {});
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
}

function render(source: Buffer, signal: AbortSignal): Promise<{error?: string; files?: Record<string, string>}> {
  const renderer = path.resolve(process.cwd(), "../../fixtures/visual-factory-diagram/render-profile-demonstrator.py");
  return new Promise((resolve, reject) => {
    const child = spawn("python3", ["-I", "-B", renderer, "--education-stdio"], {
      env: {PATH: process.env.PATH, NODE_ENV: process.env.NODE_ENV}, stdio: ["pipe", "pipe", "ignore"],
      timeout: 4000, killSignal: "SIGKILL", signal,
    });
    const chunks: Buffer[] = [];
    let size = 0;
    child.on("error", reject);
    child.stdin.on("error", reject);
    child.stdout.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_RESULT) child.kill("SIGKILL");
      else chunks.push(chunk);
    });
    child.on("close", code => {
      if (code !== 0 || size > MAX_RESULT) {
        reject(new Error("Diagram renderer failed"));
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (error) {
        reject(error);
      }
    });
    child.stdin.end(source);
  });
}

export async function POST(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json" || !request.body) {
    return respond({error: "Invia una fonte JSON."}, 415);
  }
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return respond({error: "Richiesta da un’altra origine."}, 403);
  }
  if (Number(request.headers.get("content-length")) > MAX_SOURCE) {
    return respond({error: "La fonte supera 8 KiB."}, 413);
  }
  try {
    const source = await readSource(request.body);
    if (!source) return respond({error: "La fonte supera 8 KiB."}, 413);
    if (rendering) return respond({error: "Generazione in corso. Riprova tra poco."}, 429);
    rendering = true;
    try {
      const result = await render(source, request.signal);
      return respond(result, result.error ? 422 : 200);
    } finally {
      rendering = false;
    }
  } catch {
    return respond({error: "Il generatore Python di Studio Atlas non è disponibile."}, 503);
  }
}
