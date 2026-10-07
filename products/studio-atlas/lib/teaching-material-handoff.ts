export const TEACHING_CONTEXT_SCHEMA = "docente-os.teaching-context/v0.1" as const;
export const MATERIAL_BUNDLE_SCHEMA = "studio-atlas.material-bundle/v0.1" as const;

export type MaterialType = "presentation" | "worksheet" | "guide" | "rubric";

export type TeachingContextSnapshot = {
  schema: typeof TEACHING_CONTEXT_SCHEMA;
  source: "docente-os";
  udaId: string;
  udaTitle: string;
  grade: "prima" | "seconda" | "terza";
  sectionId?: string;
  sectionLabel?: string;
  discipline: string;
  blockId?: string;
  packId?: string;
  period?: string;
  returnUrl: string;
};

export type MaterialBundleItem = {
  materialId: string;
  type: MaterialType;
  title: string;
  description: string;
  previewRef?: string;
  origin: "atlas";
};

export type MaterialBundle = {
  schema: typeof MATERIAL_BUNDLE_SCHEMA;
  source: "studio-atlas";
  bundleId: string;
  sourceUdaId: string;
  generatedAt: string;
  items: MaterialBundleItem[];
};

const MATERIAL_TYPES = new Set<MaterialType>(["presentation", "worksheet", "guide", "rubric"]);
const GRADES = new Set(["prima", "seconda", "terza"]);

export function parseTeachingContext(value: unknown, allowedReturnOrigins: string[]): TeachingContextSnapshot {
  const input = asRecord(value, "teaching context");
  if (input.schema !== TEACHING_CONTEXT_SCHEMA || input.source !== "docente-os") throw new Error("Unsupported teaching context schema");
  const returnUrl = requiredString(input.returnUrl, "returnUrl");
  const parsedReturnUrl = new URL(returnUrl);
  if (!allowedReturnOrigins.includes(parsedReturnUrl.origin)) throw new Error("Untrusted Docente OS return origin");
  const grade = requiredString(input.grade, "grade");
  if (!GRADES.has(grade)) throw new Error("Unsupported grade");

  return compact({
    schema: TEACHING_CONTEXT_SCHEMA,
    source: "docente-os" as const,
    udaId: requiredString(input.udaId, "udaId"),
    udaTitle: requiredString(input.udaTitle, "udaTitle"),
    grade: grade as TeachingContextSnapshot["grade"],
    sectionId: optionalString(input.sectionId),
    sectionLabel: optionalString(input.sectionLabel),
    discipline: requiredString(input.discipline, "discipline"),
    blockId: optionalString(input.blockId),
    packId: optionalString(input.packId),
    period: optionalString(input.period),
    returnUrl,
  }) as TeachingContextSnapshot;
}

export function encodeTeachingContext(value: TeachingContextSnapshot): string {
  return encodeEnvelope(value);
}

export function decodeTeachingContext(encoded: string, allowedReturnOrigins: string[]): TeachingContextSnapshot {
  return parseTeachingContext(decodeEnvelope(encoded), allowedReturnOrigins);
}

export function parseMaterialBundle(value: unknown): MaterialBundle {
  const input = asRecord(value, "material bundle");
  if (input.schema !== MATERIAL_BUNDLE_SCHEMA || input.source !== "studio-atlas") throw new Error("Unsupported material bundle schema");
  if (!Array.isArray(input.items) || input.items.length === 0) throw new Error("Material bundle must contain at least one item");
  const items = input.items.map((raw) => {
    const item = asRecord(raw, "material item");
    const type = requiredString(item.type, "type");
    if (!MATERIAL_TYPES.has(type as MaterialType)) throw new Error(`Unsupported material type: ${type}`);
    if (item.origin !== "atlas") throw new Error("Invalid material origin");
    return compact({
      materialId: requiredString(item.materialId, "materialId"),
      type: type as MaterialType,
      title: requiredString(item.title, "title"),
      description: requiredString(item.description, "description"),
      previewRef: optionalString(item.previewRef),
      origin: "atlas" as const,
    }) as MaterialBundleItem;
  });

  return {
    schema: MATERIAL_BUNDLE_SCHEMA,
    source: "studio-atlas",
    bundleId: requiredString(input.bundleId, "bundleId"),
    sourceUdaId: requiredString(input.sourceUdaId, "sourceUdaId"),
    generatedAt: requiredString(input.generatedAt, "generatedAt"),
    items,
  };
}

export function encodeMaterialBundle(value: MaterialBundle): string {
  return encodeEnvelope(parseMaterialBundle(value));
}

export function decodeMaterialBundle(encoded: string): MaterialBundle {
  return parseMaterialBundle(decodeEnvelope(encoded));
}

function encodeEnvelope(value: unknown) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeEnvelope(value: string): unknown {
  if (!value || value.length > 16_384) throw new Error("Invalid handoff envelope");
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    throw new Error("Malformed handoff envelope");
  }
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid ${label}`);
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing ${label}`);
  return value.trim();
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function compact<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}
