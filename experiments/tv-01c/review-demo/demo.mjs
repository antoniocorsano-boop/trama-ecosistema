import {makeReview} from "./review-guard.mjs";
const el=id=>document.getElementById(id), guard=makeReview();
const input=el("transcript"), start=el("start"), stop=el("stop"), confirm=el("confirm"), review=el("review");
let recognition=null, epoch=0, available=false, checking=false, candidate=null;
const SR=window.SpeechRecognition;
function clearProposal(){guard.invalidate();candidate=null;confirm.disabled=true;el("proposal").textContent="Nessuna proposta.";el("receipt").textContent="";}
function abort(){epoch++;checking=false;const old=recognition;recognition=null;if(old){try{old.abort();}catch{}}stop.disabled=true;start.disabled=!available;review.disabled=false;}
function reset(){abort();clearProposal();input.value="";window.speechSynthesis?.cancel();el("status").textContent="Sessione annullata.";}
input.addEventListener("input",clearProposal);
el("check").addEventListener("click",async()=>{
  reset(); available=false;start.disabled=true;
  if(!window.isSecureContext||!SR||typeof SR.available!=="function"||!("processLocally" in SR.prototype)){
    el("availability").textContent="Riconoscimento locale non verificabile in questo ambiente. Usa il testo.";return;
  }
  const current=epoch;checking=true;
  try{const result=await SR.available({langs:["it-IT"],processLocally:true});
    if(current!==epoch)return;
    available=result==="available";
    el("availability").textContent=available?"Italiano locale dichiarato disponibile dal browser. Da verificare offline.":"Italiano locale non disponibile: "+result+". Nessun servizio remoto attivato.";
  }catch{if(current===epoch)el("availability").textContent="Verifica non riuscita. Usa il testo.";}
  finally{if(current===epoch){checking=false;start.disabled=!available;}}
});
start.addEventListener("click",()=>{
  if(!available||checking||recognition||document.hidden)return;
  clearProposal();input.value="";window.speechSynthesis?.cancel();
  const current=++epoch;
  let r;
  try{r=new SR();r.lang="it-IT";r.processLocally=true;if(r.processLocally!==true)throw Error("local mode unavailable");
    r.continuous=false;r.interimResults=false;recognition=r;
    start.disabled=true;stop.disabled=false;review.disabled=true;
    el("status").textContent="In ascolto. Interrompi per annullare.";
    r.onresult=e=>{if(current!==epoch)return;const parts=[];for(let i=0;i<e.results.length;i++)if(e.results[i].isFinal)parts.push(e.results[i][0].transcript);input.value=parts.join(" ").slice(0,180);clearProposal();};
    r.onerror=()=>{if(current!==epoch)return;abort();input.value="";clearProposal();el("status").textContent="Riconoscimento interrotto o non disponibile. Usa il testo.";};
    r.onend=()=>{if(current!==epoch)return;abort();el("status").textContent="Ascolto terminato. Rileggi la trascrizione prima di verificare.";};
    r.start();
  }catch{abort();input.value="";el("status").textContent="Impossibile avviare il riconoscimento locale.";}
});
stop.addEventListener("click",reset);
el("cancel").addEventListener("click",reset);
review.addEventListener("click",()=>{
  if(recognition||checking)return;
  candidate=guard.review(input.value);el("receipt").textContent="";
  el("proposal").textContent=candidate?"Azione proposta: "+candidate.target+". Controlla il testo e conferma solo se corrisponde alla richiesta.":"Richiesta non riconosciuta o ambigua. Nessuna azione proposta.";
  confirm.disabled=!candidate;
});
confirm.addEventListener("click",()=>{
  if(!candidate||recognition)return;
  const receipt=guard.confirm({revision:candidate.revision,text:input.value,target:candidate.target,explicit:true});
  confirm.disabled=true;candidate=null;
  el("receipt").textContent=receipt?"Simulazione confermata: "+receipt.target+". Nessun dato o applicazione modificati.":"Conferma non valida. Verifica nuovamente.";
});
el("speak").addEventListener("click",()=>{
  const synth=window.speechSynthesis;
  if(!synth||recognition||checking){el("tts").textContent="Sintesi non disponibile durante l'ascolto.";return;}
  const voice=synth.getVoices().find(v=>v.localService===true&&/^it(?:-|$)/i.test(v.lang));
  if(!voice){el("tts").textContent="Nessuna voce italiana dichiarata locale.";return;}
  synth.cancel();const u=new SpeechSynthesisUtterance("TRAMA. La richiesta è pronta per la verifica.");u.voice=voice;u.lang=voice.lang;
  u.onend=()=>el("tts").textContent="Riproduzione terminata.";u.onerror=()=>el("tts").textContent="Riproduzione non riuscita.";el("tts").textContent="Riproduzione della frase di prova.";synth.speak(u);
});
el("mute").addEventListener("click",()=>{window.speechSynthesis?.cancel();el("tts").textContent="Riproduzione interrotta.";});
document.addEventListener("visibilitychange",()=>{if(document.hidden)reset();});window.addEventListener("pagehide",reset);
