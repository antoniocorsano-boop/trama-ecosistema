import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeTeachingContext,
  encodeMaterialBundle,
  encodeTeachingContext,
  parseMaterialBundle,
  parseTeachingContext,
} from "./teaching-material-handoff";

const context = {
  schema: "docente-os.teaching-context/v0.1" as const,
  source: "docente-os" as const,
  udaId: "2-01",
  udaTitle: "Agricoltura come sistema tecnologico",
  grade: "seconda" as const,
  sectionId: "section-2c",
  sectionLabel: "2C",
  discipline: "Tecnologia",
  blockId: "B11",
  packId: "CAN-PACK-2A",
  period: "Ottobre",
  returnUrl: "https://docente-os-2026-27-beta.onrender.com/progetta/atlas/ritorno",
};

test("TeachingContextSnapshot round-trips through base64url and keeps teacher context", () => {
  const encoded = encodeTeachingContext(context);
  assert.deepEqual(decodeTeachingContext(encoded, ["https://docente-os-2026-27-beta.onrender.com"]), context);
});

test("TeachingContextSnapshot decodes in a browser-like runtime without Node Buffer", { concurrency: false }, () => {
  const encoded = Buffer.from(JSON.stringify(context), "utf8").toString("base64url");
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "Buffer");
  try {
    Object.defineProperty(globalThis, "Buffer", { value: undefined, configurable: true });
    assert.deepEqual(decodeTeachingContext(encoded, ["https://docente-os-2026-27-beta.onrender.com"]), context);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "Buffer", descriptor);
  }
});

test("TeachingContextSnapshot fails closed for unknown callbacks and missing UDA identity", () => {
  assert.throws(() => parseTeachingContext({ ...context, returnUrl: "https://evil.example/return" }, ["https://docente-os-2026-27-beta.onrender.com"]));
  assert.throws(() => parseTeachingContext({ ...context, udaId: "" }, ["https://docente-os-2026-27-beta.onrender.com"]));
});

test("MaterialBundle only admits the four v0.1 material types", () => {
  const bundle = {
    schema: "studio-atlas.material-bundle/v0.1" as const,
    source: "studio-atlas" as const,
    bundleId: "bundle-2-01",
    sourceUdaId: "2-01",
    generatedAt: "2026-10-07T08:00:00.000Z",
    items: [
      { materialId: "slides", type: "presentation" as const, title: "Presentazione introduttiva", description: "Quadro iniziale", origin: "atlas" as const },
      { materialId: "sheet", type: "worksheet" as const, title: "Scheda di lavoro", description: "Attività guidata", origin: "atlas" as const },
      { materialId: "guide", type: "guide" as const, title: "Guida illustrata", description: "Supporto visuale", origin: "atlas" as const },
      { materialId: "rubric", type: "rubric" as const, title: "Rubrica di valutazione", description: "Criteri osservabili", origin: "atlas" as const },
    ],
  };
  assert.deepEqual(parseMaterialBundle(JSON.parse(Buffer.from(encodeMaterialBundle(bundle), "base64url").toString("utf8"))), bundle);
  assert.throws(() => parseMaterialBundle({ ...bundle, items: [{ ...bundle.items[0], type: "video" }] }));
});
