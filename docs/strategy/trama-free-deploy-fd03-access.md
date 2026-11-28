# FD-03 — Qualificazione accesso riservato (candidato)
2026-11-14 — NO_DEPLOY / NO_PROVISION / NO_PRIVATE_UPLOAD — riferimento #315.

## Decisione di isolamento
Conservare il sito sintetico pubblico FD-02 (trama-fd02.pages.dev) e le evidenze già qualificate. Candidato separato per la revisione riservata: trama-fd03-review.pages.dev, nome proposto, non creato né verificato. Un solo progetto privato condivisibile per futuri collaudi, non un progetto per ogni EduTwin. Non modificare i progetti esistenti. Nessun nuovo servizio o progetto prima della verifica FREE_ONLY e autorizzazione esplicita. Missione 118 resta locale/privata.

## Ordine operativo
1. Titolare autorizzato: verificare in sola lettura Zero Trust/Access, piano Free, disponibilità posti, assenza di nuovi addebiti, condizioni e limiti effettivi; non attivare piani a pagamento. La tariffa pubblicata non prova l'entitlement dell'account.
2. Solo dopo autorizzazione, predisporre il progetto isolato e una fixture esclusivamente sintetica. Prima di qualsiasi contenuto privato, coprire sia dominio base sia tutte le anteprime, alias e hash. Nessun dominio personalizzato, Functions, Workers, R2, analytics o fallback a pagamento. Verificare assenza di origini alternative e di policy Bypass/Service Auth o permissive.
3. Configurare un solo revisore autorizzato con indirizzo esplicito (mai dominio intero/Everyone); autenticazione OTP se disponibile e autorizzata. Nessun indirizzo, OTP, token, cookie o credenziale in repository o chat. Non modificare Google Workspace scolastico. Nessun account studente.
4. Inventariare via metadati provider tutti gli URL effettivi e le risorse; nessun URL omesso, inclusi deployment precedenti. Confrontare l'inventario con le policy effettive; bloccare se il limite dello strumento impedisce copertura integrale.
5. Solo su inventario approvato avviare scripts/free_deploy_access.py con --approved-synthetic-probe, --team e un --host per ciascun hostname. Non eseguire ora: progetto non provisionato. Il probe anonimo usa GET senza credenziali, non segue redirect, non legge o conserva contenuti; verifica root, index, CSS, JS, immagine, audio, manifest e Range audio. Un redirect verso il login Access esatto costituisce osservazione, non prova completa. 2xx, 403 generico, 404, redirect inatteso o errore di rete non qualificano. Non pubblicare URL di login completi o query string. Il report non autorizza nulla e termina con exit 2 anche in caso di osservazioni favorevoli.
6. Collaudo umano autorizzato: accesso da smartphone con identità ammessa; riproduzione audio e immagini, interazioni e collegamenti diretti. Con sessione anonima/identità non ammessa, tutte le superfici devono negare l'accesso. Verificare logout/revoca con i tempi documentati, nuova richiesta dopo scadenza e accesso ai singoli file. Non revocare sessioni di altri servizi senza autorizzazione: il logout Access può avere effetto globale.
7. Registrare evidenze non personali di policy, inventario, prove anonime e autorizzate, revoca e costi. Nessuna promozione automatica: revisione indipendente e autorizzazione distinta per Missione 118; pubblicazione studenti separata e subordinata ai requisiti scolastici.

## Esito e limiti
FD-03 rimane NOT_QUALIFIED. CI esclusivamente offline con sette test deterministici; non effettua richieste Cloudflare. Il probe non verifica completezza inventario, autenticazione positiva, revoca, protezione cache, costi, permessi o riservatezza effettiva; tutti restano obbligatori. Non ritentare o aggirare rifiuti. Se Free non verificabile, conservare collaudo locale.

## Fonti ufficiali
- https://developers.cloudflare.com/pages/platform/known-issues/ (distinzione policy dominio base e anteprime)
- https://developers.cloudflare.com/pages/configuration/preview-deployments/ (alias e hash)
- https://www.cloudflare.com/it-it/sase/products/access/ (piano Free pubblicato)
- https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/ (OTP)
- https://developers.cloudflare.com/cloudflare-one/access-controls/policies/common-policies/ (restrizione email e metodo)
- https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/ (sessioni/logout)
