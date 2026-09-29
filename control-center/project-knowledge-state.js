(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.TRAMAProjectKnowledgeState=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  function text(value,fallback='—'){
    return value===null||value===undefined||value===''?fallback:String(value);
  }

  function localTime(value){
    if(!value)return 'Data non disponibile';
    try{
      return new Intl.DateTimeFormat('it-IT',{
        dateStyle:'medium',timeStyle:'short'
      }).format(new Date(value));
    }catch{return String(value)}
  }

  function technical(pack,effective){
    return {
      effectiveContextStatus:effective?.effectiveContextStatus||'NOT_AVAILABLE',
      governedKnowledgeStatus:effective?.governedKnowledgeStatus||text(pack?.status,'UNKNOWN'),
      liveObservationStatus:effective?.liveObservationStatus||'NOT_AVAILABLE',
      semanticDriftStatus:effective?.semanticDriftStatus||'NOT_AVAILABLE',
      governedAsOf:effective?.governedAsOf||pack?.asOf||null,
      liveObservedAt:effective?.liveObservedAt||null,
      promotionRequired:Boolean(effective?.promotionRequired),
      sourceRefs:Array.isArray(effective?.sourceRefs)?effective.sourceRefs:(Array.isArray(pack?.sourceRefs)?pack.sourceRefs:[])
    };
  }

  function derive(pack,transportMode='fresh'){
    if(!pack||pack.subject!=='project-knowledge'){
      return {
        kind:'error',tone:'blocked',
        title:'Informazioni di riferimento non disponibili',
        summary:'Non è possibile mostrare in modo affidabile lo stato delle informazioni.',
        verifiedTitle:'Informazioni di riferimento',
        verifiedText:'Il pacchetto di riferimento non è disponibile o non è riconoscibile.',
        verifiedMeta:'Nessuna data disponibile',
        updatesTitle:'Aggiornamenti recenti',
        updatesText:'Non disponibili.',
        updatesMeta:'',
        notice:'Serve un controllo tecnico prima di utilizzare questa vista.',
        actionRequired:false,actionLabel:null,
        technical:technical(pack,null)
      };
    }

    const effective=pack.effectiveContext||null;
    const tech=technical(pack,effective);
    const governedCurrent=effective?.governedKnowledgeStatus==='CURRENT';
    const governedUsable=governedCurrent || (!effective && ['CURRENT','PARTIAL'].includes(String(pack.status||'')));
    const verifiedTitle=governedCurrent?'Informazioni verificate':'Informazioni di riferimento';
    const verifiedText=governedCurrent
      ?'Le informazioni di riferimento restano valide.'
      :(governedUsable
        ?'Le informazioni di riferimento disponibili restano consultabili.'
        :'Alcune informazioni di riferimento devono essere verificate.');
    const verifiedMeta='Riferimento: '+localTime(tech.governedAsOf);

    if(transportMode==='offline-cache'){
      return {
        kind:'offline',tone:'attention',
        title:"Stai vedendo l'ultimo stato disponibile",
        summary:'Non è stato possibile controllare una versione più recente. Le informazioni già disponibili restano consultabili.',
        verifiedTitle,verifiedText,verifiedMeta,
        updatesTitle:'Aggiornamenti recenti',
        updatesText:'Connessione non disponibile. Nessun dato viene presentato come appena verificato.',
        updatesMeta:tech.liveObservedAt?'Ultimo controllo: '+localTime(tech.liveObservedAt):'Ultimo controllo recente non disponibile',
        notice:'Quando la connessione tornerà disponibile, questa vista potrà essere aggiornata.',
        actionRequired:false,actionLabel:null,technical:tech
      };
    }

    if(effective?.accessStatus==='NO_ACCESS'){
      return {
        kind:'noaccess',tone:'quiet',
        title:'Lo stato è disponibile',
        summary:'Puoi comprendere l’esito anche se i dettagli tecnici non sono disponibili per questo profilo.',
        verifiedTitle,verifiedText,verifiedMeta,
        updatesTitle:'Aggiornamenti recenti',
        updatesText:'L’esito del controllo resta leggibile senza mostrare dettagli tecnici riservati.',
        updatesMeta:tech.liveObservedAt?'Ultimo controllo: '+localTime(tech.liveObservedAt):'Ultimo controllo disponibile',
        notice:'L’assenza dei dettagli tecnici non indica un errore né la perdita delle informazioni.',
        actionRequired:false,actionLabel:null,
        technical:{...tech,restricted:true}
      };
    }

    if(!effective){
      return {
        kind:'unavailable',tone:'attention',
        title:'Le informazioni di riferimento sono disponibili',
        summary:'Gli aggiornamenti recenti non sono ancora disponibili in questa vista.',
        verifiedTitle,verifiedText,verifiedMeta,
        updatesTitle:'Aggiornamenti recenti',
        updatesText:'Il collegamento al contesto aggiornato non è ancora attivo. Nessun dato viene presentato come live.',
        updatesMeta:'Ultimo pacchetto disponibile: '+localTime(pack.asOf),
        notice:'Non è richiesta alcuna azione. Puoi continuare a consultare le informazioni di riferimento.',
        actionRequired:false,actionLabel:null,technical:tech
      };
    }

    if(effective.effectiveContextStatus==='BLOCKED'){
      return {
        kind:'blocked',tone:'blocked',
        title:'Serve una verifica prima di continuare',
        summary:'Una decisione dipendente da queste informazioni resta sospesa finché la verifica non è completata.',
        verifiedTitle,verifiedText,verifiedMeta,
        updatesTitle:'Aggiornamenti recenti',
        updatesText:'Sono disponibili informazioni recenti, ma non sufficienti per proseguire con l’azione interessata.',
        updatesMeta:tech.liveObservedAt?'Controllato: '+localTime(tech.liveObservedAt):'Controllo recente non disponibile',
        notice:'Puoi continuare a consultare le informazioni e lo storico. L’azione bloccata richiede una verifica.',
        actionRequired:true,actionLabel:'Apri la verifica',technical:tech
      };
    }

    if(effective.semanticDriftStatus==='REVIEW_REQUIRED'){
      return {
        kind:'review',tone:'attention',
        title:'Alcune informazioni sono cambiate',
        summary:'Devono essere verificate prima di essere considerate confermate.',
        verifiedTitle,verifiedText,verifiedMeta,
        updatesTitle:'Aggiornamenti recenti',
        updatesText:'È stato rilevato un cambiamento in una fonte di riferimento.',
        updatesMeta:tech.liveObservedAt?'Cambiamento osservato: '+localTime(tech.liveObservedAt):'Data del cambiamento non disponibile',
        notice:'Le informazioni già verificate restano consultabili fino alla conclusione della verifica.',
        actionRequired:true,actionLabel:'Verifica le informazioni',technical:tech
      };
    }

    if(['PARTIAL','UNAVAILABLE','STALE'].includes(effective.liveObservationStatus) || effective.effectiveContextStatus==='DEGRADED'){
      return {
        kind:'partial',tone:'attention',
        title:'Informazioni parzialmente aggiornate',
        summary:'Puoi continuare a consultare le informazioni verificate; alcuni aggiornamenti recenti non sono disponibili.',
        verifiedTitle,verifiedText,verifiedMeta,
        updatesTitle:'Aggiornamenti recenti',
        updatesText:'L’ultimo controllo non ha prodotto tutte le informazioni previste.',
        updatesMeta:tech.liveObservedAt?'Ultimo controllo: '+localTime(tech.liveObservedAt):'Ultimo controllo completo non disponibile',
        notice:'Non è richiesta alcuna azione, salvo che una specifica attività indichi diversamente.',
        actionRequired:false,actionLabel:null,technical:tech
      };
    }

    if(effective.liveObservationStatus==='FRESH' && effective.semanticDriftStatus==='NONE' && effective.effectiveContextStatus==='USABLE'){
      const liveFacts=Array.isArray(effective.liveFacts)?effective.liveFacts:[];
      const noUpdates=liveFacts.length===0;
      return {
        kind:noUpdates?'empty':'normal',tone:'quiet',
        title:noUpdates?'Nessun aggiornamento da mostrare':'Le informazioni di riferimento sono valide',
        summary:noUpdates
          ?'Non ci sono aggiornamenti recenti che richiedono attenzione.'
          :'Gli aggiornamenti recenti non richiedono attenzione.',
        verifiedTitle,verifiedText,verifiedMeta,
        updatesTitle:'Aggiornamenti recenti',
        updatesText:noUpdates?'Nessun aggiornamento recente.':'Controllati di recente. Nessuna modifica richiede attenzione.',
        updatesMeta:tech.liveObservedAt?'Ultimo controllo: '+localTime(tech.liveObservedAt):'Controllo recente disponibile',
        notice:null,actionRequired:false,actionLabel:null,technical:tech
      };
    }

    return {
      kind:'unknown',tone:'attention',
      title:'Alcune informazioni devono essere verificate',
      summary:'Lo stato più recente non è abbastanza chiaro per essere presentato come confermato.',
      verifiedTitle,verifiedText,verifiedMeta,
      updatesTitle:'Aggiornamenti recenti',
      updatesText:'Lo stato recente non è ancora classificabile con sufficiente certezza.',
      updatesMeta:tech.liveObservedAt?'Ultimo controllo: '+localTime(tech.liveObservedAt):'Controllo recente non disponibile',
      notice:'Non interpretare questa condizione come un errore automatico. Serve una verifica del contesto.',
      actionRequired:false,actionLabel:null,technical:tech
    };
  }

  return {derive,localTime};
});
