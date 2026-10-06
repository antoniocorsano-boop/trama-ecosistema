import { createHash } from "node:crypto";

const HEX_64 = /^[0-9a-f]{64}$/;

export function assertVisualReferenceBytesMatchDigest(
  bytes: Uint8Array,
  expectedDigest: string,
): void {
  if (!HEX_64.test(expectedDigest)) {
    throw new Error("VISUAL_REFERENCE_CONTENT_DIGEST_INVALID");
  }
  const actualDigest = createHash("sha256").update(bytes).digest("hex");
  if (actualDigest !== expectedDigest) {
    throw new Error("VISUAL_REFERENCE_CONTENT_DIGEST_MISMATCH");
  }
}
