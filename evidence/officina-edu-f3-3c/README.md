# OFFICINA-EDU-01 · F3.3c

Base collaudata `5d1b960a2948c8c950e4a99acf7074256f8e4370`. Ambiente locale con Node
22.23.5, Python 3.12.14 e Chromium 141.0.7390.37. Anteprima Atlas bloccata a
`39c8104b6aa5ba6f37418246c96660602de372dd`.

| Controllo | Esito locale |
| --- | --- |
| Build e verifica TypeScript di Studio Atlas | Superati |
| Prove unitarie Studio Atlas | 255 superate, 1 saltata (trasporto privato V9.1) |
| Contratto Python | 2 prove superate, incluse 14 fonti da rifiutare |
| Chromium cumulativo Studio Atlas | 39/39, comprese 8/8 F3.3a–c |
| Profili Visual Factory | 15/15 misure e 45/45 prove di accessibilità SVG |
| Pilota ECO02 su HTML e SVG | 9/9 |
| Diagrammi P2 su HTML e SVG | 9/27 in questo Chromium. I 18 rilievi geometrici si riproducono sulla base con gli stessi esiti. |

I quattro PNG provengono dal test cumulativo. La prova compone un circuito da
zero, modifica la relazione, sostituisce «Lampadina» con «LED», reimporta la
fonte e ripete la generazione. Le ricevute mostrano gli SHA-256 dei sei
artefatti, con variazione dei file dopo la modifica e identità al riutilizzo
della stessa fonte. Il test verifica anche la revoca dell'anteprima obsoleta,
il rifiuto del markup e l'assenza di richieste a origini esterne. Una prova
separata controlla in Chromium le altezze effettive delle due righe di
relazioni e del piè di pagina al limite di otto relazioni, su entrambi i formati.
Su mobile a 390 px, lo stesso caso passa da 14 px di sovrapposizione
fra seconda riga e piè di pagina a 9 px di separazione.

## Ripetizione

- Dalla radice, eseguire `python3 tests/test_education_diagram_authored.py`.
- Da `products/studio-atlas`, dopo l'installazione prevista dal progetto,
  eseguire `node --import tsx --test lib/*.test.ts lib/canonical/*.test.ts`,
  `npm run build` e `npm run typecheck`. L'invocazione diretta di Node evita
  il socket locale usato dal comando `tsx` in questo ambiente.
- Per le qualificazioni Chromium usare i cinque insiemi di prove e le due
  origini fissate nel flusso `studio-atlas-atlas-preview-e2e.yml`.
  Il filtro `F3.3[abc]` in `studio-atlas-atlas-preview.spec.ts` isola le
  otto prove di questa sequenza. Il flusso conserva PNG e ricevute.

Il termine della verifica automatica lascia in attesa le revisioni educativa,
artistica e tecnica indipendente. La fonte ammette 1–4 nodi e fino a 8
relazioni. La rotta di generazione richiede l'ambiente docente Next.js con Node
e Python 3. Il costo aggiuntivo di servizi e dipendenze è pari a zero.
