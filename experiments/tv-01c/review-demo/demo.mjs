import {makeReview} from "./review-guard.mjs";
const el=id=>document.getElementById(id), guard=makeReview();
const input=el("transcript"), mic=el("start"), confirm=el("confirm"), review=el("review"), panel=el("review-panel");
const SR=window.SpeechRecognition;
let recognition=null, epoch=0, checking=false, candidate=null;
function status(message){el("status").textContent=message;}
function feedback(message=""){el("feedback").textContent=message;el("feedback").hidden=!message;}
function clearProposal(){guard.invalidate();candidate=null;confirm.disabled=true;panel.hidden=true;el("receipt").textContent="";}
function render(){
  const busy=Boolean(recognition)||checking;
  mic.disabled=checking;mic.classList.toggle("listening",Boolean(recognition));
  mic.setAttribute("aria-pressed",String(Boolean(recognition)));
  mic.setAttribute("aria-label",recognition?"Interrompi ascolto":"Parla con TRAMA");
  el("mic-label").textContent=recognition?"Interrompi":checking?"Verifico…":"Parla";
  input.disabled=busy;review.disabled=busy||!input.value.trim();
  for(const button of document.querySelectorAll("[data-example]"))button.disabled=busy;
}
function abort(){
  epoch++;checking=false;const old=recognition;recognition=null;
  if(old){old.onend=null;old.onresult=null;old.onerror=null;try{old.abort();}catch{}}
  render();
}
function reset(message="Richiesta annullata."){
  abort();clearProposal();input.value="";feedback();window.speechSynthesis?.cancel();status(message);render();
}
function unavailable(message){
  el("availability").textContent=message;status("Qui puoi scrivere la tua richiesta.");render();
}
function listen(){
  if(document.hidden||recognition)return;
  clearProposal();feedback();window.speechSynthesis?.cancel();
  const current=++epoch;
  try{
    const r=new SR();r.lang="it-IT";r.processLocally=true;
    if(r.processLocally!==true)throw Error("local mode unavailable");
    r.continuous=false;r.interimResults=false;recognition=r;input.value="";
    status("Ti ascolto…");render();
    r.onresult=e=>{
      if(current!==epoch)return;
      const parts=[];for(let i=0;i<e.results.length;i++)if(e.results[i].isFinal)parts.push(e.results[i][0].transcript);
      const spoken=parts.join(" ");
      if(spoken.length>180){abort();input.value="";clearProposal();feedback("La richiesta è troppo lunga. Prova con una frase breve.");render();return;}
      input.value=spoken;clearProposal();render();
    };
    r.onerror=()=>{if(current!==epoch)return;abort();input.value="";clearProposal();status("Non sono riuscito ad ascoltarti. Puoi scrivere.");render();};
    r.onend=()=>{if(current!==epoch)return;recognition=null;epoch++;status(input.value.trim()?"Rileggi la richiesta e continua.":"Non ho sentito una richiesta. Riprova o scrivi.");render();};
    r.start();
  }catch{abort();status("La voce non è disponibile. Puoi scrivere.");}
}
mic.addEventListener("click",async()=>{
  if(recognition){reset("Ascolto interrotto.");return;}
  if(checking)return;
  if(!window.isSecureContext||!SR||typeof SR.available!=="function"||!("processLocally" in SR.prototype)){
    unavailable("Il riconoscimento locale non è disponibile in questo ambiente. Non viene usato un servizio remoto.");return;
  }
  const current=++epoch;checking=true;status("Controllo la disponibilità della voce…");render();
  try{
    const result=await SR.available({langs:["it-IT"],processLocally:true});
    if(current!==epoch||document.hidden)return;
    checking=false;
    if(result!=="available"){unavailable("L'italiano locale non è disponibile. Nessun servizio remoto attivato.");return;}
    el("availability").textContent="Il dispositivo dichiara disponibile la voce italiana locale. La prova senza rete resta necessaria.";
    listen();
  }catch{if(current===epoch){checking=false;unavailable("Non è stato possibile verificare la voce locale.");}}
  finally{if(current===epoch){checking=false;render();}}
});
input.addEventListener("input",()=>{clearProposal();feedback();render();});
for(const button of document.querySelectorAll("[data-example]"))button.addEventListener("click",()=>{
  if(recognition||checking)return;input.value=button.dataset.example;clearProposal();feedback();render();input.focus();
});
el("cancel").addEventListener("click",()=>reset());
review.addEventListener("click",()=>{
  if(recognition||checking||!input.value.trim())return;
  clearProposal();feedback();candidate=guard.review(input.value);
  if(!candidate){feedback("Non ho individuato una richiesta precisa. Prova con uno degli esempi.");return;}
  el("proposal").textContent=candidate.target;panel.hidden=false;confirm.disabled=false;confirm.focus();
});
el("back").addEventListener("click",()=>{clearProposal();input.focus();render();});
confirm.addEventListener("click",()=>{
  if(!candidate||recognition||checking)return;
  const receipt=guard.confirm({revision:candidate.revision,text:input.value,target:candidate.target,explicit:true});
  confirm.disabled=true;candidate=null;
  el("receipt").textContent=receipt?"Richiesta confermata. In questa prova non viene aperta alcuna applicazione.":"La richiesta è cambiata. Verificala di nuovo.";
});
el("speak").addEventListener("click",()=>{
  const synth=window.speechSynthesis;
  if(!synth||recognition||checking){el("tts").textContent="Voce non disponibile in questo momento.";return;}
  const voice=synth.getVoices().find(v=>v.localService===true&&/^it(?:-|$)/i.test(v.lang));
  if(!voice){el("tts").textContent="Nessuna voce italiana locale disponibile.";return;}
  synth.cancel();const u=new SpeechSynthesisUtterance("Come posso aiutarti?");u.voice=voice;u.lang=voice.lang;
  u.onend=()=>el("tts").textContent="Ascolto terminato.";u.onerror=()=>el("tts").textContent="Non è stato possibile riprodurre la voce.";el("tts").textContent="Risposta in riproduzione.";synth.speak(u);
});
el("mute").addEventListener("click",()=>{window.speechSynthesis?.cancel();el("tts").textContent="Voce interrotta.";});
document.addEventListener("visibilitychange",()=>{if(document.hidden)reset("Tocca per iniziare.");});
window.addEventListener("pagehide",()=>reset("Tocca per iniziare."));
render();
