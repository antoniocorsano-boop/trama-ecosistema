// Closed internal production registry: no user-supplied executable templates,
// paths, network providers or arbitrary dependencies.
export const SIMULATION_LABS=Object.freeze({
  gear:Object.freeze({id:"gear",renderer:"three-r128",module:"inkworks-gear.ts",template:"vf-simulation-gear-template.html",placeholder:"__GEAR_MODULE__",objective:"Prevedere velocità e verso di due ruote dentate esterne.",question:"Come ruoterà il condotto?",sourceKind:"editable-teaching-model"}),
  "slider-crank":Object.freeze({id:"slider-crank",renderer:"native-svg",module:"simulation-slider-crank.ts",template:"vf-simulation-slider-crank-template.html",placeholder:"__MECHANISM_MODULE__",objective:"Collegare il raggio della manovella alla corsa del cursore.",question:"Quanto misura la corsa del cursore?",sourceKind:"editable-teaching-model"})
});
