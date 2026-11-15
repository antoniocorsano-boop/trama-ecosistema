// TV-01C interaction guard. Diagnostic only; no product routes or execution.
const commands = new Map([
  ["apri il calendario", "Calendario"], ["apri calendario", "Calendario"],
  ["mostra il calendario", "Calendario"], ["mostra calendario", "Calendario"],
  ["mostra l'orario", "Orario"], ["mostra orario", "Orario"],
  ["apri la lezione", "Preparazione della lezione"],
  ["apri lezione", "Preparazione della lezione"],
  ["cerca un laboratorio", "Ricerca laboratori"],
  ["cerca laboratorio", "Ricerca laboratori"],
]);
export const normalize = value => String(value ?? "").normalize("NFC").toLocaleLowerCase("it-IT").replace(/[’‘]/g,"'").replace(/[.!?]+$/g,"").trim().replace(/\s+/g," ");
export function propose(text) {
  const normalized = normalize(text);
  if (!commands.has(normalized)) return null;
  return Object.freeze({transcript: normalized, target: commands.get(normalized), mode:"SIMULATION_ONLY"});
}
export function makeReview() {
  let revision=0, pending=null;
  return Object.freeze({
    invalidate() { revision++; pending=null; },
    review(text) {
      revision++;
      const candidate=propose(text);
      pending=candidate ? Object.freeze({...candidate,revision}) : null;
      return pending;
    },
    confirm({revision: reviewedRevision,text,target,explicit=false}={}) {
      if (explicit !== true || !pending || pending.revision !== reviewedRevision ||
          pending.transcript !== normalize(text) || pending.target !== target) return null;
      const receipt=Object.freeze({status:"SIMULATED",target:pending.target,revision});
      revision++; pending=null;
      return receipt;
    }
  });
}
