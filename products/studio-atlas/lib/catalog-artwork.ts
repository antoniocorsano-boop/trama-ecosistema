import type { EnvironmentId, AuthoringToolId } from "./authoring-catalog";
import type { AuthoringComplexity } from "./model";
const root="/design/atelier/catalog/";
export const ENVIRONMENT_ART:Record<EnvironmentId,string>={
 MUSEUM:"/design/atelier/workflow/ambienti.webp",LAB:"/design/atelier/experiences/laboratorio.webp",
 INDUSTRY:root+"industry.svg",NATURE:root+"nature.svg",CITY:"/design/atelier/experiences/esplorazione.webp",
 HISTORY:root+"history.svg",CUSTOM:root+"custom.svg",
};
export const TOOL_ART:Record<AuthoringToolId,string>={
 STORY:root+"story.svg",WORLD:root+"world.svg",FORM:root+"form.svg",SCENES:root+"scenes.svg",
 CHOICES:root+"choices.svg",SIMULATION:root+"simulation.svg",HOTSPOTS:root+"hotspots.svg",
 VISUAL:root+"visual.svg",PREVIEW:root+"preview.svg",
};
export const PROFILE_ART:Record<AuthoringComplexity,string>={
 ESSENTIAL:root+"essential.svg",ARTICULATED:root+"articulated.svg",ADVANCED:root+"advanced.svg",
};
