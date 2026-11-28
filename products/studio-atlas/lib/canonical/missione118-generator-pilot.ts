import type {EduTwinDraftInput} from "../edutwin-draft";

// Fictional first-chapter authoring candidate, NOT the approved Missione 118 package.
// It exercises the compiler with an explicit prologue and distinct routes.
export const missione118DraftInput:EduTwinDraftInput={
 title:"Missione 118 — Il messaggio che cambia",
 idea:"Tecnologia e cittadinanza digitale: confrontare informazioni selezionate automaticamente con la fonte originale.",
 ageBand:"lower-secondary",
 opening:{
  theme:"Questa storia parla delle informazioni che ci arrivano attraverso i sistemi automatici e di come possiamo verificarle.",
  setting:"Anno 2045. In città i display pubblici personalizzano le notizie per aiutare le persone a orientarsi.",
  characters:"Nora dirige l'archivio delle invenzioni. Teo è un giovane inventore. AX-118 è un assistente artificiale che recupera informazioni.",
  disruption:"Due visitatori della mostra leggono notizie diverse sull'apertura del laboratorio. Uno crede che sia chiuso tutto il giorno, l'altro che sia aperto.",
  role:"Nora ti affida il compito di capire da dove arrivano i due messaggi prima di aggiornare il display.",
  mission:"Ricostruisci l'avviso originale e aiuta i visitatori a raggiungere il laboratorio senza essere disorientati.",
  firstAction:"Raggiungi i due display all'ingresso della mostra."
 },
 story:{
  hook:"Due display mostrano avvisi apparentemente incompatibili.",
  setting:"Città e mostra delle invenzioni nel 2045.",
  characters:"Nora, curatrice; Teo, inventore; AX-118, assistente artificiale; due visitatori.",
  characterGoal:"Nora vuole un avviso attendibile; Teo vuole che i visitatori possano vedere il laboratorio.",
  disruption:"I display omettono parti diverse dello stesso avviso.",
  unknown:"Quale orario è sostenuto dalla fonte originale?",
  learnerRole:"Investigatore della mostra incaricato di ricostruire l'avviso.",
  turningPoint:"Le due notizie sono frammenti dello stesso documento, non due orari distinti.",
  ending:"Il display mostra l'orario completo e i visitatori raggiungono il laboratorio al momento previsto."
 },
 world:{
  learnerRole:"Investigatore della mostra.",
  canObserve:"I due display, l'avviso originale e lo stato dei visitatori.",
  canChange:"Ordine dell'indagine e proposta di correzione del display.",
  unknown:"Che cosa è stato omesso nei messaggi personalizzati?",
  consequence:"La fonte ricostruita modifica l'avviso e il percorso dei visitatori.",
  motivation:"Aiutare i visitatori a non perdere la visita."
 },
 experience:{grammar:"INQUIRY_EVIDENCE",rationale:"La fonte originale è necessaria per risolvere una contraddizione reale nel mondo narrativo."},
 scenes:[
  {sceneId:"display",kind:"SCENE",interaction:"CHOICE",title:"Due messaggi, una mostra",
   visibleSituation:"Il primo display dice «Laboratorio chiuso fino alle 15». Il secondo dice «Laboratorio aperto dalle 15». I visitatori non sanno se attendere.",
   learnerAction:"Scegli se confrontare i due messaggi o cercare direttamente l'avviso originale.",
   consequence:"Cambia l'ordine delle evidenze che puoi esaminare.",reveal:"I display non mostrano l'intero avviso.",
   world:{place:"Ingresso",status:"Visitatori incerti",signals:[{id:"fonte",label:"Avviso originale",state:"OFF"},{id:"confronto",label:"Confronto dei messaggi",state:"OFF"}]},
   choices:[
    {choiceId:"compare",label:"Confronta i due display",feedback:"Le frasi indicano la stessa ora, ma ciascuna descrive soltanto metà della giornata.",targetSceneId:"compare",
     worldAfter:{place:"Ingresso",status:"Messaggi confrontati",signals:[{id:"fonte",label:"Avviso originale",state:"OFF"},{id:"confronto",label:"Confronto dei messaggi",state:"ACTIVE"}]}},
    {choiceId:"source",label:"Cerca l'avviso nell'archivio",feedback:"Hai individuato il documento originale; puoi confrontare i messaggi con la sua formulazione completa.",targetSceneId:"source",
     worldAfter:{place:"Ingresso",status:"Fonte individuata",signals:[{id:"fonte",label:"Avviso originale",state:"ACTIVE"},{id:"confronto",label:"Confronto dei messaggi",state:"OFF"}]}}
   ]},
  {sceneId:"compare",kind:"SCENE",interaction:"SUMMARY",title:"La stessa ora",
   visibleSituation:"Teo nota che entrambi i messaggi riportano le 15. Nessuno dei due dimostra che il laboratorio sia chiuso per tutta la giornata.",
   learnerAction:"Apri l'avviso originale nell'archivio.",consequence:"Passi dai frammenti alla fonte completa.",reveal:"Le due frasi possono essere compatibili.",choices:[]},
  {sceneId:"source",kind:"SCENE",interaction:"SUMMARY",title:"L'avviso completo",
   visibleSituation:"L'avviso originale recita: «Laboratorio chiuso per preparazione fino alle 15; visita dalle 15 alle 17».",
   learnerAction:"Proponi di mostrare entrambe le informazioni sul display.",consequence:"Nora dispone di un testo completo da confrontare con i due messaggi.",reveal:"La selezione automatica non ha inventato le frasi, ma le ha separate dal contesto.",choices:[]},
  {sceneId:"closure",kind:"SCENE",interaction:"SUMMARY",title:"La mostra riapre",
   visibleSituation:"Il display riporta entrambi gli orari. I visitatori scelgono di attendere e raggiungono il laboratorio alle 15.",
   learnerAction:"Osserva il nuovo avviso e il percorso dei visitatori.",consequence:"La contraddizione è risolta; il laboratorio è raggiungibile all'ora indicata.",reveal:"Prima di decidere, confrontare una sintesi con la fonte completa può cambiare ciò che comprendiamo.",
   world:{place:"Ingresso",status:"Avviso completo esposto",signals:[{id:"fonte",label:"Avviso originale",state:"ACTIVE"},{id:"display",label:"Avviso completo",state:"STABLE"}]},choices:[]}
 ]
};
