import type { GapEntry } from "../../domain/ecosystem/model";

export function EcosystemGapView({entries}:{entries:GapEntry[]}){
  if(entries.length===0) return <p className="empty-gap">Nessun delta governato aperto.</p>;
  return (
    <div className="gap-view" aria-label="Vista AS IS GAP TO BE">
      <div className="gap-columns" aria-hidden="true"><strong>AS IS</strong><strong>GAP</strong><strong>TO BE</strong><strong>NEXT</strong></div>
      {entries.map((entry)=><article className={entry.safeguard?"gap-row is-safeguard":"gap-row"} key={entry.id}>
        <header><span>{entry.subjectType==="node"?"Nodo":"Flusso"}</span><h4>{entry.label}</h4></header>
        <div className="gap-cell"><small>AS IS</small><strong>{entry.currentState}</strong></div>
        <div className="gap-cell"><small>GAP</small><strong>{entry.safeguard?"Confine già soddisfatto":entry.gapSummary}</strong>{!entry.safeguard && entry.missing.length>0?<ul>{entry.missing.map((item)=><li key={item}>{item}</li>)}</ul>:null}</div>
        <div className="gap-cell"><small>TO BE</small><strong>{entry.targetState}</strong><p>{entry.targetBoundary}</p></div>
        <div className="gap-cell gap-next"><small>NEXT</small><strong>{entry.safeguard?"Nessun intervento ecosistemico ammesso":entry.nextAction}</strong>{entry.preconditions.length>0?<div className="gap-guardrails"><b>Prerequisiti</b><ul>{entry.preconditions.map((item)=><li key={item}>{item}</li>)}</ul></div>:null}{entry.forbiddenUntil.length>0?<div className="gap-guardrails"><b>Bloccato fino a</b><ul>{entry.forbiddenUntil.map((item)=><li key={item}>{item}</li>)}</ul></div>:null}</div>
      </article>)}
    </div>
  );
}
