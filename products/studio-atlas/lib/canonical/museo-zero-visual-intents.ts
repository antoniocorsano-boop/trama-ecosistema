import type { VisualIntentSpec } from "../visual-preflight";

const TEMPLATE_DIGEST = "0".repeat(64);
const PATHWAY_ID = "pw-strategy-selection-01-museo-zero";
const ART_DIRECTION = "museo-zero-art-direction/v0.4";

const COMMON_NEGATIVE = [
  "dashboard aesthetic",
  "generic SaaS cards",
  "floating avatar heads",
  "chibi or mascot treatment",
  "generic cyberpunk neon default",
  "technical diagram as dominant scene",
  "large educational captions",
  "decorative AI clutter",
  "readable text, pseudo-text, labels, captions, signage, or watermarks",
  "charts, graphs, dashboards, detached UI panels, or screen-wall interfaces",
  "partial, cropped, headless, duplicate, or malformed human figures",
  "computer monitor interfaces, source-code screens, or software windows",
  "illuminated displays, monitor content, interface text, control-screen graphics, or wall placards",
  "clothing logos, brand marks, badges, embroidered lettering, or printed lettering",
];

const FORBIDDEN_TEXT = [
  "pseudo-text",
  "interface labels",
  "educational captions",
  "room-name signage",
  "watermarks",
];

function baseSpec(
  specId: string,
  purpose: VisualIntentSpec["purpose"],
  subjectRefs: string[],
): Pick<
  VisualIntentSpec,
  | "schemaVersion"
  | "specId"
  | "pathwayId"
  | "packageDigest"
  | "purpose"
  | "subjectRefs"
  | "negativeConstraints"
  | "forbiddenTextPatterns"
  | "artDirectionVersion"
> {
  return {
    schemaVersion: "atlas.visual-intent-spec/v0.1",
    specId,
    pathwayId: PATHWAY_ID,
    packageDigest: TEMPLATE_DIGEST,
    purpose,
    subjectRefs,
    negativeConstraints: [...COMMON_NEGATIVE],
    forbiddenTextPatterns: [...FORBIDDEN_TEXT],
    artDirectionVersion: ART_DIRECTION,
  };
}

export const MUSEO_ZERO_REFERENCE_INTENTS: readonly VisualIntentSpec[] = [
  {
    ...baseSpec("museo-zero-reference-lia-v0.4", "CHARACTER_REFERENCE", ["lia"]),
    narrativeFunction: "Establish Lia as the persistent visitor-flow crew member before scene production.",
    requiredVisualFacts: [
      "single adult museum crew member age 30-40 actively placing clean blank visitor-flow markers along the accessible circulation route",
      "short dark wavy bob remains clearly visible",
      "burnt-orange overshirt over a charcoal base layer with a restrained technical crossbody bag",
      "hands clearly visible doing the task",
      "working task is not a posed portrait",
      "single subject with no other people or partial figures",
    ],
    worldAnchors: [
      "after-hours contemporary museum",
      "new accessible entrance circulation route",
      "blank walls with no wall plaques and no signage anywhere",
    ],
    identityAnchors: [
      "adult 30-40",
      "short dark wavy bob",
      "burnt-orange overshirt over charcoal base layer",
      "restrained technical crossbody bag",
      "calm focused presence",
      "visitor-flow task association",
      "single-subject working reference",
    ],
    composition: {
      dominantSubject: "Lia working as the visitor-flow crew member in the museum",
      foreground: ["clean blank route markers"],
      midground: ["Lia in a full-body working pose"],
      background: ["sparse blank-walled museum corridor"],
      spatialRelation: "Lia is physically grounded beside the accessible circulation route near the new entrance",
      focalActions: ["placing blank visitor-flow markers"],
      diegeticScene: true,
      dominantSurface: "physical museum corridor",
    },
    camera: {
      shotScale: "full-body working reference with secondary medium view",
      viewpoint: "eye-level",
      lensLanguage: "natural perspective with undistorted human proportions",
    },
    lightingMood: "restrained warm after-hours museum light",
    materialTextureLanguage: ["matte museum flooring", "painted blank walls", "burnt-orange overshirt textile", "charcoal base-layer fabric", "technical crossbody strap"],
    continuityRefs: [],
    qualityCriteria: [
      "Lia has a specific adult professional identity",
      "hair clothing and crossbody bag remain readable",
      "hands and task read clearly",
      "character belongs to the physical museum world",
    ],
    targetAspectRatio: "3:4",
  },
  {
    ...baseSpec("museo-zero-reference-omar-v0.4", "CHARACTER_REFERENCE", ["omar"]),
    narrativeFunction: "Establish Omar as the hands-on installation crew member and persistent participant.",
    requiredVisualFacts: [
      "single adult museum installer age 30-40 physically adjusting a compact sensor mount and installation hardware",
      "very short dark hair and short beard remain clearly visible",
      "olive/moss work jacket with small dark tool bag and no logos or lettering",
      "grounded practical installation posture with visible hands",
      "single subject with no other people or partial figures",
    ],
    worldAnchors: ["after-hours contemporary museum", "installation area near a sensor fixture"],
    identityAnchors: [
      "adult 30-40",
      "very short dark hair",
      "short beard",
      "olive/moss work jacket",
      "small dark tool bag",
      "practical installation posture",
      "sensor-mount or installation-hardware association",
      "single-subject working reference",
    ],
    composition: {
      dominantSubject: "Omar working as the hands-on museum installer at a sensor fixture",
      foreground: ["compact installation hardware"],
      midground: ["Omar in grounded practical posture"],
      background: ["restrained museum installation context"],
      spatialRelation: "Omar is physically beside and interacting with the sensor mount",
      focalActions: ["adjusting the sensor mount"],
      diegeticScene: true,
      dominantSurface: "physical installation area",
    },
    camera: {
      shotScale: "full-body working reference with secondary medium view",
      viewpoint: "eye-level",
      lensLanguage: "natural documentary perspective",
    },
    lightingMood: "restrained neutral-warm setup lighting",
    materialTextureLanguage: ["olive/moss work jacket textile", "dark tool-bag material", "metal mounting hardware", "museum wall finish"],
    continuityRefs: [],
    qualityCriteria: [
      "Omar reads as participant rather than teacher",
      "hair beard jacket and tool bag remain readable",
      "task and prop relation is unambiguous",
    ],
    targetAspectRatio: "3:4",
  },
  {
    ...baseSpec("museo-zero-reference-teo-v0.4", "CHARACTER_REFERENCE", ["teo"]),
    narrativeFunction: "Establish Teo as the AV rehearsal technician physically connected to the control booth and gallery.",
    requiredVisualFacts: [
      "single adult museum AV rehearsal technician age 30-40 with restrained observant body language",
      "short greying hair and thin metal glasses remain clearly visible",
      "slate-blue overshirt near analog controls and without logos or lettering",
      "physical console only with tactile buttons knobs and faders while the monitor remains off with no screen interface",
      "all booth displays stay dark with no illuminated display and no lettering anywhere",
    ],
    worldAnchors: [
      "small enclosed museum AV booth",
      "unlabeled observation window",
      "adjacent warm projection gallery",
    ],
    identityAnchors: [
      "adult 30-40",
      "short greying hair",
      "thin metal glasses",
      "slate-blue overshirt",
      "measured observant posture",
      "near analog controls",
      "not security staff",
      "monitor remains off",
    ],
    composition: {
      dominantSubject: "Teo beside the physical analog console inside the AV booth",
      foreground: ["analog tactile console"],
      midground: ["Teo in measured observant posture"],
      background: ["unlabeled observation window toward adjacent warm projection gallery"],
      spatialRelation: "Teo stands inside the booth with a direct physical sightline through the window to the adjacent gallery",
      focalActions: ["observing rehearsal state beside tactile controls"],
      diegeticScene: true,
      dominantSurface: "physical AV booth interior",
    },
    camera: {
      shotScale: "medium-full working reference",
      viewpoint: "eye-level inside the booth",
      lensLanguage: "natural interior perspective preserving booth-to-gallery relation",
    },
    lightingMood: "restrained booth light with warm projection spill from adjacent gallery",
    materialTextureLanguage: ["slate-blue overshirt textile", "thin metal glasses", "matte console hardware", "painted booth walls", "clear observation glazing"],
    continuityRefs: ["cabina-regia", "sala-zero"],
    qualityCriteria: [
      "Teo reads as AV technician rather than security",
      "hair glasses overshirt and analog controls remain readable",
      "physical console relation is clear",
      "adjacent gallery remains spatially legible",
    ],
    targetAspectRatio: "3:4",
  },
  {
    ...baseSpec("museo-zero-reference-sala-zero-v0.4", "ENVIRONMENT_REFERENCE", ["sala-zero"]),
    narrativeFunction: "Lock the principal gallery as a believable narrative space where entrance position and projection response can later be compared.",
    requiredVisualFacts: [
      "new accessible entrance threshold opens into a deep contemporary museum room",
      "subtle floor circulation route and integrated sensor near the threshold",
      "large projection wall shows abstract light in restrained warm tones with simple non-text motion",
      "blank walls and unlabeled doors with no signage",
      "no text and no interface content",
      "blank walls with no plaques and no lettering anywhere",
    ],
    worldAnchors: [
      "new accessible entrance threshold",
      "projection wall geometry",
      "subtle floor route",
      "integrated sensor position",
      "museum accent colour",
    ],
    identityAnchors: [],
    composition: {
      dominantSubject: "physical museum gallery viewed from the entrance threshold",
      foreground: ["accessible entrance threshold", "subtle floor route"],
      midground: ["integrated sensor and open circulation space"],
      background: ["large warm abstract projection wall"],
      spatialRelation: "the threshold, sensor, route and projection wall form one readable deep-space axis",
      focalActions: ["ambient projection response establishes the room"],
      diegeticScene: true,
      dominantSurface: "physical gallery architecture",
    },
    camera: {
      shotScale: "wide environment master",
      viewpoint: "from the accessible entrance threshold",
      lensLanguage: "believable architectural depth without exaggerated wide-angle distortion",
    },
    lightingMood: "after-hours museum darkness balanced by restrained warm projection light",
    materialTextureLanguage: ["matte wall finish", "museum flooring", "subtle integrated sensor hardware"],
    continuityRefs: [],
    qualityCriteria: [
      "room reads as physical narrative space",
      "threshold-to-projection spatial logic is clear",
      "architecture remains reusable across scenes",
    ],
    targetAspectRatio: "4:3",
  },
  {
    ...baseSpec("museo-zero-reference-cabina-regia-v0.4", "ENVIRONMENT_REFERENCE", ["cabina-regia"]),
    narrativeFunction: "Lock the adjacent booth as a physically connected backstage space for bounded mapping changes.",
    requiredVisualFacts: [
      "small enclosed museum AV booth uses an entirely analog control surface with tactile controls",
      "wide observation window visibly frames the adjacent warm projection gallery",
      "physical buttons knobs faders and unlit indicator lamps define the analog console",
      "interior viewpoint with camera inside the adjacent booth",
    ],
    worldAnchors: [
      "same material language as principal gallery",
      "physical adjacency",
      "observation window",
      "stable analog control surface geometry",
    ],
    identityAnchors: [],
    composition: {
      dominantSubject: "interior of the physically adjacent AV booth",
      foreground: ["analog tactile console with buttons knobs and faders"],
      midground: ["working-scale booth interior"],
      background: ["observation window framing adjacent warm abstract projection"],
      spatialRelation: "camera is inside the booth; console sits in front of the observation window and the adjacent gallery projection is visibly beyond it",
      focalActions: ["physical control surface establishes backstage causality"],
      diegeticScene: true,
      dominantSurface: "analog physical console and booth architecture",
    },
    camera: {
      shotScale: "wide interior environment master",
      viewpoint: "inside the booth looking across console toward observation window",
      lensLanguage: "working-scale interior perspective that preserves adjacency",
    },
    lightingMood: "restrained dark booth light with warm spill through observation window",
    materialTextureLanguage: ["analog control hardware", "matte booth surfaces", "observation glazing"],
    continuityRefs: ["sala-zero"],
    negativeConstraints: [
      ...COMMON_NEGATIVE,
      "no rectangular display panels or screen-like surfaces",
    ],
    qualityCriteria: [
      "booth is physically connected to gallery",
      "analog console geometry is stable",
      "window-to-projection relation is immediately legible",
    ],
    targetAspectRatio: "4:3",
  },
] as const;

function sceneSpec(
  shotId: string,
  sceneRef: string,
  subjectRefs: string[],
  narrativeFunction: string,
  requiredVisualFacts: string[],
  spatialRelation: string,
  focalAction: string,
  continuityFamily: string,
  interactionState?: string,
): VisualIntentSpec {
  return {
    ...baseSpec(`museo-zero-shot-${shotId.toLowerCase()}-v0.4`, "SCENE_FRAME", subjectRefs),
    sceneRef,
    shotId,
    narrativeFunction,
    requiredVisualFacts,
    worldAnchors: ["after-hours contemporary museum", "stable principal-gallery and booth geometry"],
    identityAnchors: [],
    composition: {
      dominantSubject: `narrative action for ${shotId}`,
      foreground: ["physical museum threshold or working prop as appropriate"],
      midground: subjectRefs,
      background: ["stable museum architecture"],
      spatialRelation,
      focalActions: [focalAction],
      diegeticScene: true,
      dominantSurface: "physical museum world",
    },
    camera: {
      shotScale: "medium-wide narrative frame",
      viewpoint: "eye-level within the museum world",
      lensLanguage: "consistent editorial realism with believable spatial depth",
      continuityFamily,
    },
    lightingMood: "restrained after-hours museum light with warm projection response where active",
    materialTextureLanguage: ["museum architecture", "practical crew clothing", "tactile installation hardware"],
    interactionState,
    continuityRefs: subjectRefs,
    qualityCriteria: [
      "one dominant action is readable",
      "visible consequence follows the intended causal state",
      "characters and spaces remain continuous",
    ],
    targetAspectRatio: "4:3",
  };
}

export const MUSEO_ZERO_SHOT_INTENTS: readonly VisualIntentSpec[] = [
  sceneSpec(
    "F1",
    "MZ1_FAILED_REHEARSAL",
    ["lia", "omar", "teo", "sala-zero"],
    "Establish the final rehearsal just before the failure becomes visible.",
    [
      "Lia approaches the new accessible entrance in a burnt-orange overshirt with technical crossbody bag",
      "Omar works nearby in an olive/moss work jacket with small dark tool bag",
      "Teo remains measured near analog controls in a slate-blue overshirt",
      "projection has not yet become the explanatory focus",
    ],
    "Lia is outside the threshold while Omar and Teo occupy believable working positions deeper in the museum",
    "approaching the new accessible entrance",
    "museo-zero-threshold-establishing/v0.1",
  ),
  sceneSpec(
    "F2",
    "MZ1_FAILED_REHEARSAL",
    ["lia", "omar", "sala-zero"],
    "Make the failed causal timing visible without explanatory captions.",
    [
      "Lia has crossed the new threshold with short dark wavy bob and burnt-orange overshirt still readable",
      "projection wall remains dark",
      "Omar notices that the sensor has responded beside the mounting hardware",
    ],
    "Lia is just inside the threshold while the dark projection wall remains deeper in the same spatial axis",
    "crossing the threshold while the room fails to respond",
    "museo-zero-threshold-rehearsal/v0.1",
    "entrance crossed; sensor responds; projection remains dark",
  ),
  sceneSpec(
    "F3",
    "MZ1_FAILED_REHEARSAL",
    ["lia", "omar", "teo", "sala-zero"],
    "Show the projection response arriving visibly too late in the same failed rehearsal.",
    [
      "warm projection finally activates",
      "Lia is already deeper inside with burnt-orange overshirt and charcoal base layer still readable",
      "Omar and Teo react with restrained professional focus",
    ],
    "Lia is beyond the threshold position established in F2 when the projection finally activates behind the same spatial relationship",
    "late projection activates after Lia has moved deeper",
    "museo-zero-threshold-rehearsal/v0.1",
    "late projection response after threshold crossing",
  ),
  sceneSpec(
    "F4",
    "MZ4_TEST_MAPPING",
    ["teo", "cabina-regia"],
    "Reveal one bounded old-entrance mapping clue through the physical AV booth.",
    [
      "Teo stands beside the analog console with thin metal glasses and slate-blue overshirt readable",
      "one physical mapping relation still corresponds to the old entrance logic",
      "adjacent gallery remains visible through observation window",
    ],
    "Teo, physical console and observation window remain in one readable booth-to-gallery composition",
    "inspecting the old entrance mapping relation",
    "museo-zero-control-surface/v0.1",
    "old entrance mapping relation active",
  ),
  sceneSpec(
    "F5",
    "MZ4_TEST_MAPPING",
    ["teo", "cabina-regia"],
    "Show exactly one bounded mapping change while preserving the same booth composition.",
    [
      "same Teo with short greying hair, thin metal glasses and slate-blue overshirt as F4",
      "same analog console geometry as F4",
      "mapping now corresponds to the new entrance sensor",
      "change is quiet and physically believable",
    ],
    "same Teo-console-window geometry as F4, with only the bounded mapping state changed",
    "making one bounded mapping change",
    "museo-zero-control-surface/v0.1",
    "one bounded mapping change to the new entrance sensor",
  ),
  sceneSpec(
    "F6",
    "MZ6_FINAL_REHEARSAL",
    ["lia", "omar", "teo", "sala-zero"],
    "Close the causal arc by showing the corrected immediate response in the same threshold family.",
    [
      "Lia crosses the same new threshold with burnt-orange overshirt and technical crossbody bag readable",
      "warm projection response begins immediately",
      "Omar and Teo show restrained professional satisfaction",
    ],
    "the threshold, Lia position and projection wall match the F2/F3 spatial family while response timing is now immediate",
    "crossing the threshold as projection responds immediately",
    "museo-zero-threshold-rehearsal/v0.1",
    "correct immediate projection response at threshold crossing",
  ),
] as const;

export function getMuseoZeroReferenceIntent(subjectRef: string): VisualIntentSpec {
  const spec = MUSEO_ZERO_REFERENCE_INTENTS.find((item) => item.subjectRefs[0] === subjectRef);
  if (!spec) throw new Error("MUSEO_ZERO_VISUAL_INTENT_NOT_FOUND");
  return structuredClone(spec);
}

export function getMuseoZeroShotIntent(shotId: string): VisualIntentSpec {
  const spec = MUSEO_ZERO_SHOT_INTENTS.find((item) => item.shotId === shotId);
  if (!spec) throw new Error("MUSEO_ZERO_VISUAL_INTENT_NOT_FOUND");
  return structuredClone(spec);
}
