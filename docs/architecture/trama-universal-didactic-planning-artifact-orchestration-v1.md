name: PR92 document alignment
on:
  push:
    paths:
      - '.github/workflows/pr92-document-alignment.yml'
permissions:
  contents: write
jobs:
  align:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with:
          ref: docs/universal-didactic-planning-v1
      - name: Align closed pilot references
        shell: python
        run: |
          from pathlib import Path
          p=Path('docs/architecture/trama-universal-didactic-planning-artifact-orchestration-v1.md')
          s=p.read_text()
          s=s.replace('## 16. Protected work in progress','## 16. Protected work and closed-pilot baseline',1)
          s=s.replace('Questa proposta non deve interferire con:\n\n- ECO-02/P1;\n- PR aperte necessarie al collaudo;\n- Lesson Workspace in validazione;\n- apertura dei materiali nel percorso reale;', 'ECO-02/P1 è **CLOSED / HUMAN PASS** e costituisce una baseline validata da preservare. Questa proposta non riapre il pilota e non modifica il runtime validato.\n\nLa proposta non deve interferire con:\n\n- baseline e invarianti validati da ECO-02/P1;\n- eventuali PR ancora aperte con gate umani propri;',1)
          s=s.replace('In particolare, fino alla chiusura del pilota ECO-02/P1, le modifiche a:', 'Eventuali modifiche future a:',1)
          s=s.replace('devono essere considerate ad alto rischio di collisione e richiedono un gate separato.', 'devono preservare gli esiti validati di ECO-02/P1 e, quando incidono sul runtime o sui relativi invarianti, essere trattate mediante un gate separato.',1)
          s=s.replace('11. non modifica il runtime ECO-02 durante il collaudo;', '11. non riapre né altera il runtime e gli invarianti validati da ECO-02/P1;',1)
          s=s.replace('`STATUS.md` — ECO-02/P1 ACTIVE, R4-P1 PLANNED / NO_RUNTIME, R3-P4 NOT AUTHORIZED, DOS-A1 RUNTIME_DEFERRED;', '`STATUS.md` — ECO-02/P1 CLOSED / HUMAN PASS, R4-P1 PLANNED / NO_RUNTIME, R3-P4 NOT AUTHORIZED, DOS-A1 RUNTIME_DEFERRED;',1)
          p.write_text(s)
      - name: Commit document only
        run: |
          git diff --check
          git config user.name 'github-actions[bot]'
          git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
          git add docs/architecture/trama-universal-didactic-planning-artifact-orchestration-v1.md
          git diff --cached --quiet && exit 0
          git commit -m 'docs: align PR92 with closed ECO-02 baseline'
          git push origin HEAD:docs/universal-didactic-planning-v1