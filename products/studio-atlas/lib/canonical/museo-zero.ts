import type { PathwayProject } from "../model";

export const MUSEO_ZERO_PROJECT_ID = "pw-strategy-selection-01-museo-zero";
export const MUSEO_ZERO_PRODUCT_REVIEW_REF =
  "docs/capabilities/atlas-percorsi/pathways/PW-STRATEGY-SELECTION-01/worlds/MUSEO-ZERO/PRODUCT-REVIEW-PACK-v0.1.md";

export function createMuseoZeroPilotProject(): PathwayProject {
  const now = new Date().toISOString();

  return {
    projectId: MUSEO_ZERO_PROJECT_ID,
    title: "MUSEO ZERO · La sala che non torna",
    idea:
      "La sera prima dell’apertura di una mostra interattiva, una sala reagisce in ritardo ai visitatori: il team deve capire quale modifica ha rotto la sincronizzazione e scegliere come rimetterla in funzione.",
    ageBand: "lower-secondary",
    humanState: "WORLD_DESIGN",
    productionState: "NOT_REQUESTED",
    story: {
      hook:
        "Museo chiuso, luci basse, ultima prova. Lia entra dalla nuova entrata: nulla accade; proiezione, suono e luce partono troppo tardi.",
      setting:
        "Museo Zero, piccolo museo contemporaneo in allestimento: ingresso, Sala Zero, cabina regia e laboratorio/deposito.",
      characters:
        "Lia cura spazio e percorso; Omar segue installazione e sensori; Teo segue regia e prove. Ognuno possiede solo una parte delle informazioni.",
      characterGoal:
        "Aprire la sala mantenendo il nuovo percorso accessibile, senza sostituire componenti funzionanti e con un comportamento stabile e ripetibile.",
      disruption:
        "Dopo varie modifiche legittime fatte nel pomeriggio, la prova serale fallisce: la sala risponde in ritardo.",
      unknown:
        "Perché la sala parte tardi se il sensore sembra funzionare? Tra le cose cambiate oggi, quale ha davvero causato il problema?",
      learnerRole:
        "Nuovo membro junior del team di allestimento: osserva, collega informazioni frammentarie, prova spiegazioni e aiuta il team a decidere.",
      turningPoint:
        "La timeline ricostruisce bene la sequenza, ma non spiega il ritardo: serve cambiare rappresentazione e osservare le relazioni del sistema.",
      ending:
        "La soluzione supportata viene provata: proiezione, suono e luce tornano sincronizzati e Sala Zero è pronta per la prova generale.",
    },
    storyReview: {
      decision: "PASS",
      evidenceRef:
        "docs/capabilities/atlas-percorsi/storytelling/STORY-PW-STRATEGY-01-MUSEO-ZERO.md",
    },
    world: {
      learnerRole:
        "Junior setup operator che costruisce una vista coerente tra luoghi, tempi, configurazioni e conseguenze.",
      canObserve:
        "Percorso vecchio e nuovo, sensori A/B, cue mapping, log di prova, registrazione del fallimento, note e testimonianze parziali del team.",
      canChange:
        "Nel modello sicuro può organizzare le evidenze, cambiare la rappresentazione usata e provare diverse mappature/soluzioni senza modificare impianti reali.",
      unknown:
        "Quale relazione tra percorso, sensore e trigger attivo produce il ritardo e quale soluzione regge i vincoli della sala.",
      consequence:
        "Ogni prova modifica il comportamento visibile della sala: il ritardo si ripete, scompare oppure rivela un limite della soluzione scelta.",
      motivation:
        "Capire finalmente che cosa non torna, vedere la sala reagire correttamente e contribuire a una decisione che il team userà nella prova finale.",
    },
    worldReview: { decision: "READY" },
    productReview: {
      decision: "READY",
      evidenceRef: MUSEO_ZERO_PRODUCT_REVIEW_REF,
    },
    experience: {
      grammar: "SIMULATION_MICROWORLD",
      rationale:
        "Il centro dell’esperienza è osservare una relazione, cambiare una mappatura in sicurezza e vedere la conseguenza nel mondo. Timeline e confronto entrano quando cambia la domanda.",
    },
    scenes: [
      {
        sceneId: "MZ1_FAILED_REHEARSAL",
        kind: "SCENE",
        interaction: "SUMMARY",
        title: "Qualcosa non torna",
        visibleSituation:
          "Lia attraversa la nuova entrata. Il sensore si accende, ma la parete resta buia; proiezione, suono e luce arrivano quando lei è già oltre.",
        learnerAction:
          "Osserva la prova fallita e individua quali elementi sembrano fuori sincronia.",
        consequence:
          "La sala non è pronta, ma il fallimento rende visibile il problema da spiegare.",
        reveal:
          "Il sensore fisico sembra funzionare: il problema non coincide automaticamente con un guasto hardware.",
        world: {
          place: "Sala Zero",
          status: "La sala reagisce dopo il passaggio del visitatore",
          signals: [
            { id: "sensor-b", label: "Sensor B · nuova entrata", state: "ACTIVE", detail: "Il sensore rileva il passaggio." },
            { id: "cue-map", label: "Mappatura regia", state: "MISMATCH", detail: "Il cue attivo non segue il nuovo ingresso." },
            { id: "projection", label: "Proiezione", state: "DELAYED", detail: "Parte quando Lia è già oltre." },
            { id: "sound-light", label: "Suono e luce", state: "DELAYED", detail: "Seguono la proiezione in ritardo." },
          ],
        },
        choices: [],
      },
      {
        sceneId: "MZ2_RECONSTRUCT_DAY",
        kind: "SCENE",
        interaction: "CHOICE",
        title: "Tutti hanno cambiato qualcosa",
        visibleSituation:
          "Lia, Omar e Teo ricordano modifiche diverse. Note, orari e tracce sono distribuiti tra ingresso, laboratorio e regia.",
        learnerAction:
          "Scegli come organizzare per prima cosa le informazioni che hai raccolto.",
        consequence:
          "Il modo in cui organizzi le informazioni rende alcune domande più facili da affrontare e altre ancora opache.",
        reveal:
          "Sapere quando è avvenuto un cambiamento non significa ancora sapere se lo ha causato.",
        world: {
          place: "Museo Zero · indizi della giornata",
          status: "Le modifiche sono note, ma la relazione causale è ancora incerta",
          signals: [
            { id: "route", label: "Percorso visitatori", state: "ACTIVE", detail: "È stato invertito per mantenere accessibile la nuova entrata." },
            { id: "sensor-b", label: "Sensor B", state: "READY", detail: "È stato spostato sul nuovo ingresso." },
            { id: "control", label: "Regia", state: "MISMATCH", detail: "La configurazione non è ancora stata collegata con certezza alle altre modifiche." },
            { id: "rehearsal-log", label: "Log prova", state: "DELAYED", detail: "Registra la risposta tardiva della sala." },
          ],
        },
        choices: [
          {
            choiceId: "timeline",
            targetSceneId: "MZ3_TIMELINE_LIMIT",
            label: "Metto in fila i cambiamenti della giornata",
            feedback:
              "La sequenza temporale chiarisce che percorso e sensore sono cambiati prima della prova fallita. Ora sai quando, ma non ancora perché.",
          },
          {
            choiceId: "connections",
            targetSceneId: "MZ4_TEST_MAPPING",
            label: "Collego subito percorso, sensore e regia",
            feedback:
              "Le relazioni sono promettenti, ma senza ordinare alcune modifiche rischi di attribuire importanza a coincidenze.",
          },
          {
            choiceId: "compare-fixes",
            targetSceneId: "MZ3_TIMELINE_LIMIT",
            label: "Confronto già le possibili soluzioni",
            feedback:
              "È troppo presto: prima devi capire quale relazione spiega davvero il ritardo.",
          },
        ],
      },
      {
        sceneId: "MZ3_TIMELINE_LIMIT",
        kind: "SCENE",
        interaction: "SUMMARY",
        title: "La timeline non basta",
        visibleSituation:
          "La sequenza è coerente: il percorso è stato invertito, Sensor B è stato spostato, poi la prova ha fallito. Anche grafica e volume erano cambiati.",
        learnerAction:
          "Decidi quale relazione devi osservare per passare da 'quando' a 'perché'.",
        consequence:
          "L’attenzione si sposta dalla cronologia alla dipendenza tra ingresso, sensore ascoltato e cue attivi.",
        reveal:
          "Una rappresentazione utile per una domanda può diventare insufficiente quando cambia la domanda.",
        world: {
          place: "Timeline dell’allestimento",
          status: "La sequenza temporale è chiara, ma non spiega perché la sala reagisce tardi",
          signals: [
            { id: "route-change", label: "Cambio percorso", state: "READY", detail: "Avviene prima della prova fallita." },
            { id: "sensor-move", label: "Spostamento Sensor B", state: "READY", detail: "Avviene prima della prova fallita." },
            { id: "graphics-volume", label: "Grafica e volume", state: "READY", detail: "Cambiano nello stesso pomeriggio ma non spiegano il ritardo." },
            { id: "causal-link", label: "Relazione causale", state: "MISMATCH", detail: "La timeline da sola non la rende visibile." },
          ],
        },
        choices: [],
      },
      {
        sceneId: "MZ4_TEST_MAPPING",
        kind: "SCENE",
        interaction: "CHOICE",
        title: "Prova il collegamento",
        visibleSituation:
          "Nella simulazione la nuova entrata usa Sensor B, mentre la regia risulta ancora mappata sul vecchio Sensor A.",
        learnerAction:
          "Scegli quale configurazione provare nella simulazione e osserva la risposta della sala.",
        consequence:
          "La conseguenza della prova permette di confrontare la tua spiegazione con il comportamento del sistema.",
        reveal:
          "Il mondo, non un punteggio, deve mostrare se il modello spiega il problema.",
        world: {
          place: "Simulazione · Sala Zero",
          status: "Il nuovo ingresso usa Sensor B, ma la regia ascolta ancora Sensor A",
          signals: [
            { id: "sensor-b", label: "Sensor B", state: "ACTIVE", detail: "Rileva il visitatore al nuovo ingresso." },
            { id: "trigger-map", label: "Trigger regia", state: "MISMATCH", detail: "È ancora associato a Sensor A." },
            { id: "projection", label: "Proiezione", state: "DELAYED", detail: "Riceve il cue troppo tardi." },
            { id: "sequence", label: "Sequenza sala", state: "DELAYED", detail: "Suono e luce seguono il ritardo." },
          ],
        },
        choices: [
          {
            choiceId: "current-a",
            targetSceneId: "MZ3_TIMELINE_LIMIT",
            label: "Mantengo il trigger su Sensor A",
            worldAfter: {
              place: "Simulazione · Sala Zero",
              status: "Il ritardo si ripete: la configurazione continua ad ascoltare il riferimento sbagliato",
              signals: [
                { id: "sensor-b", label: "Sensor B", state: "ACTIVE", detail: "Il nuovo ingresso viene rilevato." },
                { id: "trigger-map", label: "Trigger su Sensor A", state: "MISMATCH", detail: "La regia non usa il segnale del nuovo ingresso." },
                { id: "projection", label: "Proiezione", state: "DELAYED", detail: "Parte quando il visitatore è già oltre." },
              ],
            },
            feedback:
              "Il visitatore supera la nuova entrata e la sala continua a partire tardi: il fallimento si ripete.",
          },
          {
            choiceId: "switch-b",
            targetSceneId: "MZ5_COMPARE_RECOVERY",
            label: "Provo il trigger su Sensor B",
            worldAfter: {
              place: "Simulazione · Sala Zero",
              status: "La sala risponde nel momento previsto: la mappatura aggiornata spiega il problema",
              signals: [
                { id: "sensor-b", label: "Sensor B", state: "ACTIVE", detail: "Rileva il passaggio al nuovo ingresso." },
                { id: "trigger-map", label: "Trigger su Sensor B", state: "ACTIVE", detail: "La regia ascolta il segnale corretto." },
                { id: "projection", label: "Proiezione", state: "STABLE", detail: "Parte all’ingresso." },
                { id: "sequence", label: "Suono e luce", state: "STABLE", detail: "Restano sincronizzati." },
              ],
            },
            feedback:
              "La proiezione parte all’ingresso e la sequenza torna sincronizzata: la relazione causale è fortemente supportata.",
          },
          {
            choiceId: "manual",
            targetSceneId: "MZ5_COMPARE_RECOVERY",
            label: "Provo un cue manuale",
            worldAfter: {
              place: "Simulazione · Sala Zero",
              status: "La prova riesce, ma dipende dall’intervento dell’operatore",
              signals: [
                { id: "sensor-b", label: "Sensor B", state: "ACTIVE", detail: "Il sensore continua a funzionare." },
                { id: "manual-cue", label: "Cue operatore", state: "MANUAL", detail: "Un operatore deve intervenire al momento giusto." },
                { id: "projection", label: "Proiezione", state: "STABLE", detail: "Parte correttamente in questa prova." },
                { id: "repeatability", label: "Ripetibilità", state: "MISMATCH", detail: "Il risultato non è garantito visita dopo visita." },
              ],
            },
            feedback:
              "La sala può funzionare in una prova, ma il risultato dipende dal tempismo dell’operatore e non è stabile.",
          },
        ],
      },
      {
        sceneId: "MZ5_COMPARE_RECOVERY",
        kind: "TRANSFER",
        interaction: "CHOICE",
        title: "Quale soluzione regge davvero?",
        visibleSituation:
          "Il team può ripristinare il vecchio percorso, aggiornare la mappatura a Sensor B oppure usare temporaneamente un cue manuale.",
        learnerAction:
          "Confronta accessibilità, affidabilità e lavoro necessario e raccomanda una soluzione da provare.",
        consequence:
          "La raccomandazione cambia la configurazione della prova finale e rende visibili i compromessi.",
        reveal:
          "La scelta migliore dipende dai vincoli condivisi, non solo dalla soluzione che sembra più rapida.",
        world: {
          place: "Banco decisione · Sala Zero",
          status: "Tre soluzioni possono far ripartire la sala, ma non rispettano allo stesso modo i vincoli",
          signals: [
            { id: "accessibility", label: "Accessibilità del percorso", state: "ACTIVE", detail: "Il nuovo ingresso deve restare utilizzabile." },
            { id: "reliability", label: "Affidabilità", state: "MISMATCH", detail: "La soluzione deve funzionare in visite ripetute." },
            { id: "workload", label: "Lavoro richiesto", state: "READY", detail: "Il team ha poco tempo prima della prova generale." },
          ],
        },
        choices: [
          {
            choiceId: "restore-old-route",
            targetSceneId: "MZ4_TEST_MAPPING",
            label: "Ripristino il vecchio percorso",
            worldAfter: {
              place: "Confronto soluzione",
              status: "Il vecchio percorso riduce il lavoro in regia ma sacrifica il nuovo assetto accessibile",
              signals: [
                { id: "accessibility", label: "Accessibilità del percorso", state: "MISMATCH", detail: "Il nuovo ingresso non viene mantenuto." },
                { id: "reliability", label: "Affidabilità tecnica", state: "STABLE", detail: "La vecchia configurazione è conosciuta." },
                { id: "workload", label: "Lavoro fisico", state: "DELAYED", detail: "Serve ripristinare il percorso precedente." },
              ],
            },
            feedback:
              "Riduce il cambiamento in regia, ma entra in conflitto con il nuovo percorso e richiede nuovo lavoro fisico.",
          },
          {
            choiceId: "update-mapping",
            targetSceneId: "MZ6_FINAL_REHEARSAL",
            label: "Aggiorno la mappatura a Sensor B",
            worldAfter: {
              place: "Confronto soluzione",
              status: "La mappatura a Sensor B mantiene il percorso accessibile e produce una risposta stabile",
              signals: [
                { id: "accessibility", label: "Accessibilità del percorso", state: "STABLE", detail: "La nuova entrata resta utilizzabile." },
                { id: "reliability", label: "Affidabilità", state: "STABLE", detail: "La simulazione risponde in modo ripetibile." },
                { id: "workload", label: "Lavoro richiesto", state: "READY", detail: "La modifica è circoscritta alla configurazione." },
              ],
            },
            feedback:
              "Mantiene il percorso accessibile, richiede una modifica contenuta e nella simulazione produce un comportamento stabile.",
          },
          {
            choiceId: "manual-cue",
            targetSceneId: "MZ4_TEST_MAPPING",
            label: "Uso il cue manuale",
            worldAfter: {
              place: "Confronto soluzione",
              status: "Il cue manuale è praticabile come ripiego, ma resta fragile per l’uso ripetuto",
              signals: [
                { id: "accessibility", label: "Accessibilità del percorso", state: "STABLE", detail: "Il nuovo ingresso resta utilizzabile." },
                { id: "reliability", label: "Affidabilità", state: "MANUAL", detail: "Dipende dal tempismo dell’operatore." },
                { id: "workload", label: "Carico operativo", state: "MISMATCH", detail: "Richiede attenzione continua durante le visite." },
              ],
            },
            feedback:
              "È un buon ripiego temporaneo, ma resta meno affidabile per visite ripetute.",
          },
        ],
      },
      {
        sceneId: "MZ6_FINAL_REHEARSAL",
        kind: "SCENE",
        interaction: "SUMMARY",
        title: "La sala torna coerente",
        visibleSituation:
          "Lia attraversa di nuovo la sala. Questa volta proiezione, suono e luce seguono il visitatore nel momento previsto.",
        learnerAction:
          "Osserva la prova finale e confrontala con il primo fallimento.",
        consequence:
          "Il team può procedere alla prova generale e il nuovo percorso resta utilizzabile.",
        reveal:
          "Il sensore non era rotto: la configurazione ascoltava il riferimento sbagliato.",
        world: {
          place: "Sala Zero · prova finale",
          status: "Ingresso, trigger e risposta della sala sono di nuovo sincronizzati",
          signals: [
            { id: "sensor-b", label: "Sensor B", state: "ACTIVE", detail: "Rileva il passaggio nel punto corretto." },
            { id: "trigger-map", label: "Trigger regia", state: "ACTIVE", detail: "Ascolta Sensor B." },
            { id: "projection", label: "Proiezione", state: "STABLE", detail: "Parte al momento previsto." },
            { id: "sound-light", label: "Suono e luce", state: "STABLE", detail: "Seguono la sequenza senza ritardo." },
          ],
        },
        choices: [],
      },
      {
        sceneId: "MZ7_QUIET_CLOSE",
        kind: "SCENE",
        interaction: "SUMMARY",
        title: "Pronta per la prova generale",
        visibleSituation:
          "Sala Zero resta accesa nella configurazione corretta. Il museo torna silenzioso e il team chiude la sessione di allestimento.",
        learnerAction:
          "Concludi la prova e lascia il mondo nello stato raggiunto.",
        consequence:
          "Il Percorso si chiude senza punteggio o morale esplicita.",
        reveal:
          "SALA ZERO — PRONTA PER LA PROVA GENERALE.",
        world: {
          place: "Sala Zero · chiusura",
          status: "La configurazione resta stabile e pronta per la prova generale",
          signals: [
            { id: "room", label: "Sala Zero", state: "STABLE", detail: "La sequenza è pronta." },
            { id: "route", label: "Percorso accessibile", state: "STABLE", detail: "La nuova entrata resta attiva." },
            { id: "team", label: "Sessione di allestimento", state: "OFF", detail: "Il team può chiudere la prova." },
          ],
        },
        choices: [],
      },
    ],
    storyboardReady: false,
    archived: false,
    createdAt: now,
    updatedAt: now,
    revision: 1,
  };
}
