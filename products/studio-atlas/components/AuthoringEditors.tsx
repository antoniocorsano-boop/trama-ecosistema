"use client";

import type {
  ExperienceGrammar,
  PathwayProject,
  PathwayScene,
  StoryDraft,
  WorldDraft,
} from "../lib/model";

type Props = {
  project: PathwayProject;
  onPatch: (patch: Partial<PathwayProject>) => void;
};

const storyFields: Array<[keyof StoryDraft, string, string]> = [
  ["hook", "Apertura", "Qual è l’immagine o la situazione che fa entrare subito nella storia?"],
  ["setting", "Dove siamo", "Che luogo è? Che atmosfera ha?"],
  ["characters", "Chi c’è", "Chi incontriamo e perché conta?"],
  ["characterGoal", "Cosa vogliono", "Che cosa stanno cercando di ottenere i personaggi?"],
  ["disruption", "Cosa rompe l’equilibrio", "Quale evento fa nascere il problema?"],
  ["unknown", "Cosa non sappiamo", "Qual è la domanda che tiene aperta la storia?"],
  ["learnerRole", "Il ruolo dello studente", "Perché proprio lo studente deve intervenire?"],
  ["turningPoint", "La svolta", "Quale scoperta o azione cambia la situazione?"],
  ["ending", "Dove arriviamo", "Come si chiude o si riapre la storia?"],
];

export function StoryEditor({ project, onPatch }: Props) {
  const ready = storyFields.every(([key]) => project.story[key].trim());

  function update(key: keyof StoryDraft, value: string) {
    onPatch({
      story: { ...project.story, [key]: value },
      storyReview: { decision: "DRAFT" },
      humanState: "STORY_DRAFT",
    });
  }

  return (
    <div className="authoring-editor">
      <h1>Costruisci la storia.</h1>
      <p className="lead">
        Prima del mondo e delle scene deve esistere una ragione per voler continuare.
      </p>

      <div className="story-sequence">
        {storyFields.map(([key, label, hint], index) => (
          <label className="story-beat" key={key}>
            <span className="beat-index">{String(index + 1).padStart(2, "0")}</span>
            <span className="beat-copy">
              <strong>{label}</strong>
              <small>{hint}</small>
              <textarea
                rows={3}
                value={project.story[key]}
                onChange={(e) => update(key, e.target.value)}
              />
            </span>
          </label>
        ))}
      </div>

      <div className="review-strip">
        <div>
          <strong>Human Story Review</strong>
          <p>
            {project.storyReview.decision === "PASS"
              ? "Storia approvata per il world design."
              : project.storyReview.decision === "READY"
                ? "La storia è pronta per una decisione umana."
                : project.storyReview.decision === "REVISE"
                  ? "Sono richieste modifiche prima di proseguire."
                  : "Completa i passaggi essenziali prima della review."}
          </p>
        </div>

        {project.storyReview.decision === "READY" ? (
          <div className="review-actions">
            <button
              className="secondary-action"
              onClick={() => onPatch({
                storyReview: { decision: "REVISE", reviewedAt: new Date().toISOString() },
                humanState: "STORY_DRAFT",
              })}
            >
              Richiedi modifiche
            </button>
            <button
              className="primary-action"
              onClick={() => onPatch({
                storyReview: { decision: "PASS", reviewedAt: new Date().toISOString() },
                humanState: "WORLD_DESIGN",
              })}
            >
              Approva storia
            </button>
          </div>
        ) : project.storyReview.decision !== "PASS" ? (
          <button
            className="primary-action"
            disabled={!ready}
            onClick={() => onPatch({
              storyReview: { decision: "READY" },
              humanState: "STORY_REVIEW",
            })}
          >
            Pronta per revisione
          </button>
        ) : null}
      </div>
    </div>
  );
}

const worldFields: Array<[keyof WorldDraft, string, string]> = [
  ["learnerRole", "Chi è lo studente qui dentro?", "Un ruolo concreto, non “chi risponde alle domande”."],
  ["canObserve", "Cosa può osservare?", "Indizi, luoghi, comportamenti, dati, oggetti."],
  ["canChange", "Cosa può cambiare?", "Quale parte del mondo reagisce alle sue azioni?"],
  ["unknown", "Cosa non sa ancora?", "L’informazione che deve conquistare."],
  ["consequence", "Cosa succede quando agisce?", "Una conseguenza visibile o comprensibile."],
  ["motivation", "Perché dovrebbe continuare?", "La tensione o promessa che porta avanti."],
];

export function WorldEditor({ project, onPatch }: Props) {
  const ready = worldFields.every(([key]) => project.world[key].trim());

  function update(key: keyof WorldDraft, value: string) {
    onPatch({
      world: { ...project.world, [key]: value },
      worldReview: { decision: "DRAFT" },
      humanState: "WORLD_DESIGN",
    });
  }

  return (
    <div className="authoring-editor">
      <h1>Fai esistere il mondo.</h1>
      <p className="lead">
        Il mondo deve dare allo studente qualcosa da osservare, cambiare e capire.
      </p>

      <div className="world-grid">
        {worldFields.map(([key, label, hint]) => (
          <label className="world-field" key={key}>
            <strong>{label}</strong>
            <small>{hint}</small>
            <textarea rows={4} value={project.world[key]} onChange={(e) => update(key, e.target.value)} />
          </label>
        ))}
      </div>

      <div className="review-strip">
        <div>
          <strong>World Review</strong>
          <p>
            {project.worldReview.decision === "PASS"
              ? "Mondo approvato per la progettazione dell’esperienza."
              : project.worldReview.decision === "REVISE"
                ? "Il mondo deve essere rivisto."
                : "La review resta una decisione umana esplicita."}
          </p>
        </div>
        {project.worldReview.decision !== "PASS" && (
          <div className="review-actions">
            <button
              className="secondary-action"
              disabled={!ready}
              onClick={() => onPatch({
                worldReview: { decision: "REVISE", reviewedAt: new Date().toISOString() },
              })}
            >
              Da rivedere
            </button>
            <button
              className="primary-action"
              disabled={!ready}
              onClick={() => onPatch({
                worldReview: { decision: "PASS", reviewedAt: new Date().toISOString() },
              })}
            >
              Approva mondo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const grammars: Array<[Exclude<ExperienceGrammar, "">, string, string]> = [
  ["INQUIRY_EVIDENCE", "Indagine", "Raccogli indizi e costruisci una spiegazione."],
  ["BRANCHING_CONSEQUENCE", "Conseguenze", "Fai scelte e osserva come cambia la situazione."],
  ["WORKSHOP_CONSTRUCTION", "Officina", "Costruisci, combina o correggi qualcosa."],
  ["SIMULATION_MICROWORLD", "Micromondo", "Agisci su un sistema e osserva le relazioni."],
  ["VISUAL_NARRATIVE", "Narrazione visuale", "Attraversa una sequenza in cui immagini e azioni portano avanti la storia."],
  ["ENVIRONMENTAL_STORYTELLING", "Esplorazione", "Capisci il mondo leggendo ciò che contiene."],
];

export function ExperienceEditor({ project, onPatch }: Props) {
  return (
    <div className="authoring-editor">
      <h1>Che cosa farà davvero lo studente?</h1>
      <p className="lead">
        Scegli la forma dell’esperienza che rende necessaria l’azione dello studente.
      </p>

      <div className="grammar-list">
        {grammars.map(([value, title, description]) => (
          <button
            key={value}
            className={project.experience.grammar === value ? "grammar-row active" : "grammar-row"}
            onClick={() => onPatch({
              experience: { ...project.experience, grammar: value },
              humanState: "SCENES",
            })}
          >
            <strong>{title}</strong>
            <span>{description}</span>
          </button>
        ))}
      </div>

      <label className="rationale-field">
        <strong>Perché questa forma?</strong>
        <textarea
          rows={4}
          value={project.experience.rationale}
          onChange={(e) => onPatch({
            experience: { ...project.experience, rationale: e.target.value },
          })}
          placeholder="Spiega in poche righe perché questa forma serve alla storia e all’apprendimento."
        />
      </label>
    </div>
  );
}

export function SceneEditor({ project, onPatch }: Props) {
  const complete =
    project.scenes.length > 0 &&
    project.scenes.some((scene) => scene.kind === "TRANSFER") &&
    project.scenes.every(
      (scene) =>
        scene.visibleSituation.trim() &&
        scene.learnerAction.trim() &&
        scene.consequence.trim(),
    );

  function addScene() {
    const scene: PathwayScene = {
      sceneId: crypto.randomUUID(),
      kind: "SCENE",
      interaction: "SUMMARY",
      title: `Scena ${project.scenes.length + 1}`,
      visibleSituation: "",
      learnerAction: "",
      consequence: "",
      reveal: "",
      choices: [],
    };
    onPatch({
      scenes: [...project.scenes, scene],
      storyboardReady: false,
      humanState: "SCENES",
    });
  }

  function updateScene(sceneId: string, patch: Partial<PathwayScene>) {
    onPatch({
      scenes: project.scenes.map((scene) =>
        scene.sceneId === sceneId ? { ...scene, ...patch } : scene,
      ),
      storyboardReady: false,
      humanState: "SCENES",
    });
  }

  function removeScene(sceneId: string) {
    onPatch({
      scenes: project.scenes.filter((scene) => scene.sceneId !== sceneId),
      storyboardReady: false,
    });
  }

  return (
    <div className="authoring-editor">
      <div className="section-action-heading">
        <div>
          <h1>Metti in sequenza ciò che accade.</h1>
          <p className="lead">
            Ogni scena deve chiarire cosa vede lo studente, cosa può fare e che cosa cambia.
          </p>
        </div>
        <button className="primary-action" onClick={addScene}>Aggiungi scena</button>
      </div>

      {project.scenes.length === 0 ? (
        <div className="empty-stage">
          <strong>Non ci sono ancora scene.</strong>
          <p>Inizia dal primo momento che lo studente deve vivere, non da una schermata.</p>
        </div>
      ) : (
        <div className="scene-timeline">
          {project.scenes.map((scene, index) => (
            <section className="scene-row" key={scene.sceneId}>
              <div className="scene-number">{String(index + 1).padStart(2, "0")}</div>
              <div className="scene-body">
                <div className="scene-heading-row">
                  <input
                    className="scene-title"
                    value={scene.title}
                    onChange={(e) => updateScene(scene.sceneId, { title: e.target.value })}
                    aria-label={`Titolo scena ${index + 1}`}
                  />
                  <select
                    className="scene-kind"
                    value={scene.kind}
                    onChange={(e) => {
                      const kind = e.target.value as PathwayScene["kind"];
                      updateScene(scene.sceneId, {
                        kind,
                        primitive: kind === "TRANSFER" ? "TRANSFER" : scene.primitive === "TRANSFER" ? "INVESTIGATE" : scene.primitive,
                        feedbackCategory:
                          kind === "TRANSFER" ? "TRANSFER_SUCCESSFUL" : scene.feedbackCategory === "TRANSFER_SUCCESSFUL" ? "EVIDENCE_SUPPORTED" : scene.feedbackCategory,
                      });
                    }}
                    aria-label={`Tipo scena ${index + 1}`}
                  >
                    <option value="SCENE">Scena del percorso</option>
                    <option value="TRANSFER">Trasferimento · situazione nuova</option>
                  </select>
                  <select
                    className="scene-kind"
                    value={scene.interaction}
                    onChange={(e) => updateScene(scene.sceneId, {
                      interaction: e.target.value as PathwayScene["interaction"],
                      choices: e.target.value === "CHOICE" && scene.choices.length < 2
                        ? [
                            { choiceId: crypto.randomUUID(), label: "", feedback: "" },
                            { choiceId: crypto.randomUUID(), label: "", feedback: "" },
                          ]
                        : scene.choices,
                    })}
                    aria-label={`Interazione scena ${index + 1}`}
                  >
                    <option value="SUMMARY">Momento narrativo</option>
                    <option value="CHOICE">Scelta con conseguenze</option>
                  </select>
                </div>
                <label>
                  <span>Cosa vede</span>
                  <textarea rows={3} value={scene.visibleSituation} onChange={(e) => updateScene(scene.sceneId, { visibleSituation: e.target.value })} />
                </label>
                <label>
                  <span>Cosa può fare</span>
                  <textarea rows={3} value={scene.learnerAction} onChange={(e) => updateScene(scene.sceneId, { learnerAction: e.target.value })} />
                </label>
                <label>
                  <span>Cosa cambia</span>
                  <textarea rows={3} value={scene.consequence} onChange={(e) => updateScene(scene.sceneId, { consequence: e.target.value })} />
                </label>
                <label>
                  <span>Cosa scopre</span>
                  <textarea rows={2} value={scene.reveal} onChange={(e) => updateScene(scene.sceneId, { reveal: e.target.value })} />
                </label>

                {scene.interaction === "CHOICE" && (
                  <div className="scene-choice-editor">
                    <div className="scene-choice-heading">
                      <strong>Possibilità</strong>
                      <span>Ogni possibilità deve mostrare una conseguenza comprensibile prima di continuare.</span>
                    </div>

                    {scene.choices.map((choice, choiceIndex) => (
                      <div className="scene-choice-row" key={choice.choiceId}>
                        <span className="choice-index">{String(choiceIndex + 1).padStart(2, "0")}</span>
                        <input
                          value={choice.label}
                          placeholder="Cosa può scegliere lo studente"
                          aria-label={`Opzione ${choiceIndex + 1} scena ${index + 1}`}
                          onChange={(e) => updateScene(scene.sceneId, {
                            choices: scene.choices.map((candidate) =>
                              candidate.choiceId === choice.choiceId
                                ? { ...candidate, label: e.target.value }
                                : candidate,
                            ),
                          })}
                        />
                        <textarea
                          rows={2}
                          value={choice.feedback}
                          placeholder="Che cosa mostra questa scelta"
                          aria-label={`Conseguenza opzione ${choiceIndex + 1} scena ${index + 1}`}
                          onChange={(e) => updateScene(scene.sceneId, {
                            choices: scene.choices.map((candidate) =>
                              candidate.choiceId === choice.choiceId
                                ? { ...candidate, feedback: e.target.value }
                                : candidate,
                            ),
                          })}
                        />
                        {scene.choices.length > 2 && (
                          <button
                            className="quiet-action danger"
                            onClick={() => updateScene(scene.sceneId, {
                              choices: scene.choices.filter((candidate) => candidate.choiceId !== choice.choiceId),
                            })}
                          >
                            Rimuovi possibilità
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      className="quiet-action"
                      onClick={() => updateScene(scene.sceneId, {
                        choices: [
                          ...scene.choices,
                          { choiceId: crypto.randomUUID(), label: "", feedback: "" },
                        ],
                      })}
                    >
                      + Aggiungi possibilità
                    </button>
                  </div>
                )}

                <button className="quiet-action danger" onClick={() => removeScene(scene.sceneId)}>Rimuovi scena</button>
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="review-strip">
        <div>
          <strong>Storyboard</strong>
          <p>
            {project.storyboardReady
              ? "Storyboard segnato come pronto per la produzione."
              : project.scenes.some((scene) => scene.kind === "TRANSFER")
                ? "Controlla che ogni scena abbia situazione, azione e conseguenza."
                : "Aggiungi anche una scena di trasferimento: la strategia deve essere provata in una situazione nuova."}
          </p>
        </div>
        {!project.storyboardReady && (
          <button
            className="primary-action"
            disabled={!complete}
            onClick={() => onPatch({ storyboardReady: true })}
          >
            Storyboard pronto
          </button>
        )}
      </div>
    </div>
  );
}
