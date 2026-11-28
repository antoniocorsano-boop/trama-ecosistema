// Teaching candidates already exercised in F3.3d; not approved or linked to a project.
// Shared between the editor and end-to-end qualification. Validate on every load.
export const EDUCATION_DIAGRAM_EXAMPLES = [
  {
    "schema": "trama.diagram-education-source/v0.1",
    "id": "diagramma-docente",
    "status": "TEACHER_REVIEW_REQUIRED",
    "profile": "studio-atlas",
    "runtimeAuthorized": false,
    "publicationAuthorized": false,
    "title": "Dalla carta alla carta",
    "description": "Le frecce indicano la successione delle fasi del riciclo della carta: dalla materia recuperata al nuovo prodotto.",
    "nodes": [
      {
        "id": "n1",
        "label": "Carta usata",
        "detail": "Raccolta e selezione"
      },
      {
        "id": "n2",
        "label": "Impasto",
        "detail": "Fibre e acqua"
      },
      {
        "id": "n3",
        "label": "Nuovo foglio",
        "detail": "Forma e asciugatura"
      },
      {
        "id": "n4",
        "label": "Uso",
        "detail": "Nuovo utilizzo"
      }
    ],
    "edges": [
      [
        "n1",
        "n2"
      ],
      [
        "n2",
        "n3"
      ],
      [
        "n3",
        "n4"
      ]
    ],
    "activity": {
      "question": "Quale fase trasforma le fibre recuperate in un nuovo foglio?",
      "criterion": "Distingue preparazione dell’impasto e formazione del nuovo foglio"
    }
  },
  {
    "schema": "trama.diagram-education-source/v0.1",
    "id": "diagramma-docente",
    "status": "TEACHER_REVIEW_REQUIRED",
    "profile": "studio-atlas",
    "runtimeAuthorized": false,
    "publicationAuthorized": false,
    "title": "Dal campo alla tavola",
    "description": "Le frecce indicano la successione della filiera orticola. Individuare l’effetto della scarsità d’acqua sulla coltivazione.",
    "nodes": [
      {
        "id": "n1",
        "label": "Coltivazione",
        "detail": "Acqua, suolo, energia"
      },
      {
        "id": "n2",
        "label": "Raccolta",
        "detail": "Ortaggi maturi"
      },
      {
        "id": "n3",
        "label": "Distribuzione",
        "detail": "Vendita locale"
      },
      {
        "id": "n4",
        "label": "Consumo",
        "detail": "Acquisto e uso"
      }
    ],
    "edges": [
      [
        "n1",
        "n2"
      ],
      [
        "n2",
        "n3"
      ],
      [
        "n3",
        "n4"
      ]
    ],
    "activity": {
      "question": "Che cosa può accadere alla raccolta se manca acqua durante la coltivazione?",
      "criterion": "Collega scarsità d’acqua, crescita degli ortaggi e possibile riduzione della raccolta"
    }
  },
  {
    "schema": "trama.diagram-education-source/v0.1",
    "id": "diagramma-docente",
    "status": "TEACHER_REVIEW_REQUIRED",
    "profile": "studio-atlas",
    "runtimeAuthorized": false,
    "publicationAuthorized": false,
    "title": "Circuito chiuso",
    "description": "Le frecce rappresentano il percorso della corrente convenzionale nel circuito chiuso. Modello concettuale, non schema elettrico.",
    "nodes": [
      {
        "id": "n1",
        "label": "Pila",
        "detail": "Tensione elettrica"
      },
      {
        "id": "n2",
        "label": "Interruttore",
        "detail": "Chiuso: continuità"
      },
      {
        "id": "n3",
        "label": "Lampadina",
        "detail": "Luce e calore"
      }
    ],
    "edges": [
      [
        "n1",
        "n2"
      ],
      [
        "n2",
        "n3"
      ],
      [
        "n3",
        "n1"
      ]
    ],
    "activity": {
      "question": "Che cosa cambia quando si apre l’interruttore?",
      "criterion": "Spiega che il percorso si interrompe, la corrente cessa e la lampadina si spegne"
    }
  }
];
