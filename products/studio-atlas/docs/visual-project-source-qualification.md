# F3.4a1b — Fonte progettuale locale e ammissione controllata
Il file esportato dal banco Produzione è una candidatura locale, non un'approvazione né un'autorizzazione di calcolo. Contiene i contenuti della revisione e le eventuali immagini esistenti; non deve includere dati personali degli studenti. Le copie di anteprima e le ricevute di produzione sono escluse. Non caricare il file in repository pubblici o servizi esterni.
## Procedura dell'operatore
1. Acquisire il file per via locale e controllare manualmente i contenuti, la provenienza, la privacy, la revisione e la coerenza didattica.
2. Dalla directory Studio Atlas: `pnpm visual-factory:project-source inspect <candidate.json>`. Il programma ricostruisce il piano e mostra gli identificativi e il digest esatto della candidatura.
3. Solo dopo revisione positiva: `pnpm visual-factory:project-source approve <candidate.json> <new-approval.json> --reviewed-digest <sha256>`. Non sovrascrive file; produce un file riservato all'operatore, senza chiamare fornitori.
4. L'operatore può configurare il percorso del file approvato in `VISUAL_FACTORY_PROJECT_APPROVAL_FILE`, in un archivio server protetto e non scrivibile dal client. Il server ricontrolla la fonte a ogni richiesta generica.
L'operatore è il confine di fiducia; i digest non sono firme o autenticazione. Non è presente un endpoint per caricare o approvare candidature. La risposta valida rimane 409 PROJECT_PLAN_VERIFIED_EXECUTION_BLOCKED: nessuna generazione, spesa o pubblicazione. F3.4a1c qualificherà il raccordo esecutivo.
