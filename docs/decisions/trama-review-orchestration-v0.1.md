# GOV-REV-03/V3 — raccordo revisioni / Compute Factory

Stato: candidato di laboratorio, senza autorita di esecuzione. Riferimento: registro-docente issue #391 (GOV-REV-02/03). Base TRAMA osservata: f40b4576f4542b6630f20de9d063d2fcc1b88ced.

## Componenti riutilizzate

- La verifica FREE_ONLY del compilatore Compute Policy e il pianificatore deterministico delle revisioni condividono il controllo di ammissibilita; le regole GPU/SkyPilot restano specifiche di Visual Factory.
- L'adattatore CodeRabbit e di sola lettura rispetto al fornitore: elabora osservazioni dichiarate dal chiamante e verifica base, HEAD, autore dichiarato, file esaminati e limiti. Una quota storica non prova disponibilita attuale. Le due fixture examples/ sono proiezioni di osservazioni pubbliche, non attestazioni firmate.
- Il registro SQLite esistente conserva contabilita, transazioni, deduplicazione e recupero; REVIEW_SIM e una nuova unita esclusivamente sintetica. Nessun saldo reale e importato in tale unita. La prenotazione di un gruppo e atomica: una risorsa insufficiente annulla tutte le nuove prenotazioni del gruppo. Una candidatura esatta ha un solo lotto immutabile, vincolato a mandato, assegnazioni e ricevute. Ogni chiave candidato/provider e separata dalle chiavi Visual Factory. Esito incerto conserva la quota; variazioni o transizioni del lotto richiedono riconciliazione, mai reinvio automatico.

## Limiti e criteri di accettazione

Il registro non e un servizio di fatturazione e non attesta origine, disponibilita o costo del fornitore. Il pianificatore non invia commenti, non usa credenziali, non acquista crediti, non emette attestazioni e non autorizza integrazione o rilascio. Una prenotazione sintetica non autorizza una revisione reale. Un adattatore futuro dovra acquisire disponibilita attuale, autenticazione, ambito e costo con evidenza attendibile, rispettare i limiti del servizio e riconciliare gli esiti prima di ogni invio. Se la disponibilita e ignota, HOLD. Non automatizzare il reintegro della quota. La sicurezza richiede revisione indipendente sullo SHA esatto e verifica specialistica secondo GOV-REV-03.

## Prove

Eseguire `python -m unittest tests/test_visual_factory_compute_plan.py tests/test_compute_factory_quota_ledger.py tests/test_review_orchestrator.py tests/test_coderabbit_review_adapter.py tests/test_review_reservation.py -v`. Le prime due suite sono regressioni del registro e della politica preesistenti. Le nuove prove coprono concorrenza, rollback del gruppo, idempotenza, separazione delle unita, variazione del mandato e recupero. Nessuna prova sintetica sostituisce una qualifica indipendente o un riscontro reale del fornitore.
