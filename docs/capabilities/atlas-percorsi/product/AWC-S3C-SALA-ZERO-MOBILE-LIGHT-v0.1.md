# AWC S3c — Revisione illuminazione Sala Zero su Android

Data: 20 novembre 2026. **Bozza tecnica non pubblicabile**. Dipendenza AWC S3b, PR #351.
Nessuna modifica alla Biblioteca Atlas, al progetto canonico, al motore Three r128 o alle autorizzazioni.

## Evidenza concreta e decisione
Due schermate Android del docente mostrano lo stesso orientamento `camera.orbit=-0.14 rad`:
- **Luce equilibrata S3b**: ambiente più leggibile e contrastato, ma forte ombra
  triangolare sulla parete sinistra e bordi zigrinati intorno allo schermo.
- **Luce originale AWC-F**: stessa geometria e inquadratura, ma esposizione e
  luce ambientale eccessive; materiali appiattiti.

La possibilità di ruotare e cambiare profilo sul dispositivo è osservata.
Non sono misurati né la frequenza di fotogrammi né il consumo della GPU.
Le schermate sono evidenze di riesame nell'interazione, non approvazione artistica.

**Decisione S3c**: conservare i due comandi e lasciare la modalità originale
identica alla fonte AWC-F. Correggere esclusivamente il profilo di prova
`balanced`, eliminando i contributi di ombra non necessari su pareti,
schermo e rifiniture; mantenere ombre di contatto sugli oggetti mobili.
Non ricostruire la geometria o inventare nuovi materiali.

## Correzione limitata
| Parametro | S3b | S3c |
| --- | ---: | ---: |
| Illuminazione emisferica | 0,64 | 0,82 |
| Luce direzionale | 1,20 | 1,03 |
| Riempimento | 0,50 | 0,72 |
| Esposizione | 0,74 | 0,86 |
| Dimensione mappa ombre | 512² | 1024² |
| Campo ortografico ombre (±) | 8 | 5,8 |
| Spostamento lungo la normale | 0 | 0,035 |
| Oggetti che proiettano ombre | quasi tutti | console + sensori A/B |
| Ricalcolo ombre | ad ogni disegno | solo cambio illuminazione |

Il maggior numero di texel nella mappa ombre è compensato
dall'assenza di ricalcolo durante i movimenti della sola telecamera;
resta da verificarne l'effetto su un dispositivo Android reale.
La fonte canonica della scena (16 oggetti / 192 triangoli) rimane esatta.
In Three.js r128, `PCFSoftShadowMap` non supporta un efficace
controllo della sfumatura mediante il solo `shadow.radius`:
per questo si è intervenuti sul campo della camera ombre,
sull'orientamento delle superfici e sugli oggetti che le producono.

## Procedura
L'applicazione Studio Atlas e il documento HTML autonomo utilizzano
gli stessi parametri S3c. Il file HTML continua a imporre una politica
di sicurezza che impedisce richieste esterne.
Confrontare **alla stessa orbita** S3b e S3c su Android:
1. pareti e pavimento: evitare zone troppo chiare o troppo nere;
2. cornice della proiezione: controllare bande e bordi seghettati;
3. rotazione: verificare fluidità e assenza di intermittenza;
4. segnale B e ripristino: verificare che siano invariati.

Non sono ancora attestate equivalenza artistica con Blender,
prestazioni effettive del dispositivo, disponibilità della scena in
una versione pubblicata agli studenti o autorizzazioni relative.
