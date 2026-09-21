#!/usr/bin/env python3
"""Build the preregistered TRAMA-SA-01/R3 synthetic corpus."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"docs/pilots/trama-sa-01/r3-cases.json"

domains=[
 ("TEC","Tecnologia","Analizzare un sistema tecnologico mettendo in relazione risorse, energia, fasi e impatti.","La proposta analizza un sistema tecnologico collegando risorse, energia, fasi e impatti."),
 ("MAT","Matematica","Rappresentare relazioni di proporzionalità e interpretarne il significato in situazioni concrete.","La proposta rappresenta relazioni di proporzionalità e ne interpreta il significato in situazioni concrete."),
 ("SCI","Scienze","Descrivere relazioni tra componenti di un ecosistema e riconoscere gli effetti di una variazione.","La proposta descrive le relazioni tra componenti di un ecosistema e gli effetti prodotti da una variazione."),
 ("GEO","Geografia","Interpretare relazioni tra territorio, attività umane, risorse e trasformazioni del paesaggio.","La proposta collega territorio, attività umane, risorse e trasformazioni del paesaggio."),
]
labels=["ALIGNED","PARTIAL","CONTRADICTORY","INSUFFICIENT_EVIDENCE"]
cases=[]
n=1
for di,(code,domain,obj,aligned) in enumerate(domains):
  for li,label in enumerate(labels):
    for variant in range(3):
      cid=f"SA01-R3-{n:03d}"
      if label=="ALIGNED":
        objective=obj
        summary=[aligned,
          aligned.replace("La proposta","L'attività didattica"),
          aligned+" Gli studenti esplicitano i collegamenti osservati."][variant]
        family=["direct","paraphrase","extended-paraphrase"][variant]
      elif label=="PARTIAL":
        objective=obj
        summary=[
          f"La proposta affronta solo uno degli elementi centrali dell'obiettivo di {domain}.",
          f"L'attività tratta una parte pertinente dell'obiettivo di {domain}, omettendo le relazioni richieste.",
          f"La sintesi considera alcuni elementi previsti in {domain}, ma non il confronto complessivo richiesto."
        ][variant]
        family=["subtle-omission","relation-omission","composite-omission"][variant]
      elif label=="CONTRADICTORY":
        objective=obj
        summary=[
          f"La proposta sostiene che gli elementi indicati nell'obiettivo di {domain} non abbiano relazioni tra loro.",
          f"L'attività nega esplicitamente il rapporto centrale richiesto dall'obiettivo di {domain}.",
          f"La sintesi presenta come indipendenti fattori che l'obiettivo di {domain} richiede di mettere in relazione."
        ][variant]
        family=["explicit-contradiction","negation","implicit-contradiction"][variant]
      else:
        objective=[
          f"Conoscere alcuni aspetti di {domain}.",
          f"Osservare elementi relativi a {domain}.",
          f"Comprendere temi di {domain}."
        ][variant]
        summary=[
          f"La proposta formula una conclusione specifica e comparativa in {domain} che l'obiettivo generico non consente di verificare.",
          f"L'attività attribuisce priorità assoluta a una soluzione specifica di {domain} senza criteri presenti nell'evidenza.",
          f"La sintesi introduce una relazione causale dettagliata in {domain} non sostenuta dall'obiettivo disponibile."
        ][variant]
        family=["generic-evidence","unsupported-specificity","unsupported-causality"][variant]
      split="HOLDOUT" if variant==2 and li in (0,1,2,3) else "DEVELOPMENT"
      # 4 domains * 4 labels => 16 holdout, 32 development
      cases.append({
        "id":cid,"domain":domain,"domainCode":code,"family":family,"split":split,
        "expectedStage":"SEMANTIC_REVIEW","expectedSemanticLabel":label,
        "evidence":{"objective":objective,"source":"SYNTHETIC_R3_PREREGISTERED"},
        "manifest":{
          "manifestVersion":"1.0","curriculumRef":f"arena:r3:{code.lower()}",
          "curriculumVersionRef":"arena-r3-v1","authorityState":"APPROVED",
          "authorityReceiptRef":"arena-r3-synthetic-receipt","title":f"R3 {domain} {n:03d}",
          "summary":summary,"rightsStatus":"CLEARED_SYNTHETIC","accessibilityStatus":"REVIEWED_SYNTHETIC"
        }
      })
      n+=1
payload={
 "pilotSpecVersion":"3.0.0","pilotId":"TRAMA-SA-01/R3","createdAt":"2026-09-21",
 "preregistered":True,"tuningOnHoldoutAllowed":False,
 "policy":{"advisoryOnly":True,"personalDataAllowed":False,"providerRuntimeWritesAllowed":False,
           "humanReviewRequired":True,"adr009Status":"PROPOSED","dosA1":"RUNTIME_DEFERRED"},
 "split":{"development":32,"holdout":16},
 "labels":labels,"cases":cases
}
OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(f"{len(cases)} cases -> {OUT}")
