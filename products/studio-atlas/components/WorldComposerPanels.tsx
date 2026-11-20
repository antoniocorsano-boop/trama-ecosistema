"use client";

import { useState } from "react";
import type { PathwayProject, SceneWorldState } from "../lib/model";
import { compareSceneWorld, worldPlaces } from "../lib/world-composer";
import { AwcTechnicalEvidencePanel } from "./AwcTechnicalEvidencePanel";

type Representation = "2D" | "3D" | "COMBINATA";
const REPRESENTATIONS: Array<{ value: Representation; title: string; description: string }> = [
  { value: "2D", title: "Illustrata 2-D", description: "Immagini e indizi attivi, senza imporre una scena tridimensionale." },
  { value: "3D", title: "Ambiente 3-D", description: "Da valutare solo se l'esplorazione dello spazio è necessaria." },
  { value: "COMBINATA", title: "Combinata", description: "Immagini per raccontare, profondità solo nei momenti utili." },
];

const SIGNAL_LABELS: Record<string, string> = {
  OFF: "Spento",
  READY: "Pronto",
  ACTIVE: "Attivo",
  DELAYED: "In ritardo",
  MISMATCH: "Non corrispondente",
  STABLE: "Sincronizzato",
  MANUAL: "Manuale",
};

export function WorldDesignOverview({ project }: { project: PathwayProject }) {
  const [representation, setRepresentation] = useState<Representation>("2D");
  const places = worldPlaces(project);

  return (
    <section className="world-composer-panel" aria-labelledby="world-design-heading">
      <div className="world-composer-heading">
        <h2 id="world-design-heading">Il mondo, a partire dalle scene</h2>
        <p>Luoghi e situazioni provengono dal Percorso aperto. Non viene creata una seconda bozza.</p>
      </div>
      {places.length ? (
        <ul className="world-composer-places">
          {places.slice(0, 8).map((place) => (
            <li key={place.id}><strong>{place.label}</strong><span>{place.detail}</span></li>
          ))}
        </ul>
      ) : (
        <p className="world-composer-note">I luoghi compariranno quando saranno descritti nelle scene.</p>
      )}
      {places.length > 8 && <p className="world-composer-note">Altri {places.length - 8} luoghi o stati sono documentati nelle scene.</p>}
      <fieldset className="world-composer-fieldset">
        <legend>Quale rappresentazione aiuterebbe a capire questo mondo?</legend>
        <div className="world-composer-modes">
          {REPRESENTATIONS.map((item) => (
            <button
              type="button"
              className={representation === item.value ? "world-composer-choice selected" : "world-composer-choice"}
              key={item.value}
              aria-pressed={representation === item.value}
              onClick={() => setRepresentation(item.value)}
            >
              <strong>{item.title}</strong><span>{item.description}</span>
            </button>
          ))}
        </div>
        <p className="world-composer-note" role="status">
          {representation === "2D"
            ? "La rappresentazione illustrata resta il riferimento disponibile per la progettazione."
            : "Questa è una valutazione progettuale: la produzione 3-D non è ancora collegata a questo editor."}
          {" "}La scelta di confronto non viene salvata né modifica la produzione esistente.
        </p>
      </fieldset>
    </section>
  );
}

function ObservableState({ state, fallback }: { state: SceneWorldState | null; fallback: string }) {
  if (!state) {
    return <p className="world-composer-note">{fallback}</p>;
  }
  return (
    <div className="world-composer-state">
      <strong>{state.place}</strong>
      <p>{state.status}</p>
      <ul>
        {state.signals.map((signal) => (
          <li key={signal.id}>
            <strong>{signal.label}</strong>
            <span>{SIGNAL_LABELS[signal.state] ?? signal.state}{signal.detail ? ` · ${signal.detail}` : ""}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SceneDesignComparison({
  project,
  onUpdateChoiceState,
}: {
  project: PathwayProject;
  onUpdateChoiceState: (sceneId: string, choiceId: string, status: string) => void;
}) {
  const [selectedSceneId, setSelectedSceneId] = useState(project.scenes[0]?.sceneId ?? "");
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [proposal, setProposal] = useState<{ sceneId: string; choiceId: string; status: string } | null>(null);
  const scene = project.scenes.find((candidate) => candidate.sceneId === selectedSceneId)
    ?? project.scenes[0];

  if (!scene) return null;

  const comparison = compareSceneWorld(scene, selectedChoiceId);
  const observableChoices = scene.choices.filter((choice) => choice.worldAfter);
  const changed = Boolean(comparison.variation);
  const proposalStatus = changed
    ? proposal?.sceneId === scene.sceneId && proposal?.choiceId === selectedChoiceId
      ? proposal.status
      : comparison.variation?.status ?? ""
    : "";
  const hasUnsavedChange = changed && proposalStatus !== comparison.variation?.status;

  return (
    <section className="world-composer-panel" aria-labelledby="scene-comparison-heading">
      <div className="world-composer-heading">
        <h2 id="scene-comparison-heading">Tavola della scena</h2>
        <p>Osserva la situazione iniziale e le conseguenze già definite. Non è una simulazione 3-D.</p>
      </div>
      <label className="world-composer-selector">
        <strong>Scena da osservare</strong>
        <select
          value={scene.sceneId}
          onChange={(event) => {
            setSelectedSceneId(event.target.value);
            setSelectedChoiceId(null);
            setProposal(null);
          }}
        >
          {project.scenes.map((item, index) => (
            <option key={item.sceneId} value={item.sceneId}>{index + 1}. {item.title}</option>
          ))}
        </select>
      </label>
      <p className="world-composer-note"><strong>Lo studente:</strong> {scene.learnerAction}</p>
      {observableChoices.length > 0 ? (
        <fieldset className="world-composer-fieldset">
          <legend>Confronta una conseguenza osservabile</legend>
          <div className="world-composer-buttons">
            <button type="button" className={!changed ? "secondary-action is-current" : "secondary-action"} aria-pressed={!changed} onClick={() => { setSelectedChoiceId(null); setProposal(null); }}>
              Originale
            </button>
            {observableChoices.map((choice) => (
              <button
                type="button"
                key={choice.choiceId}
                className={selectedChoiceId === choice.choiceId ? "secondary-action is-current" : "secondary-action"}
                aria-pressed={selectedChoiceId === choice.choiceId}
                onClick={() => { setSelectedChoiceId(choice.choiceId); setProposal(null); }}
              >
                {choice.label}
              </button>
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="world-composer-note">Questa scena non contiene ancora alternative con uno stato successivo documentato.</p>
      )}
      <div className="world-composer-comparison" aria-live="polite">
        <section>
          <h3>Situazione originale</h3>
          <ObservableState state={comparison.original} fallback={scene.visibleSituation} />
        </section>
        <section>
          <h3>{changed ? "Dopo la scelta" : "Conseguenza prevista"}</h3>
          <ObservableState state={comparison.variation ? { ...comparison.variation, status: proposalStatus } : null} fallback={scene.consequence} />
          {changed && comparison.feedback && <p className="world-composer-note">{comparison.feedback}</p>}
        </section>
      </div>
      {changed && selectedChoiceId && (
        <div className="world-composer-variation-editor">
          <label>
            <strong>Conseguenza osservabile dopo la scelta</strong>
            <textarea
              rows={3}
              value={proposalStatus}
              onChange={(event) => setProposal({
                sceneId: scene.sceneId,
                choiceId: selectedChoiceId,
                status: event.target.value,
              })}
            />
          </label>
          <p className="world-composer-note">
            La variazione compare nel confronto prima di essere conservata. Il salvataggio
            modifica il contenuto della scena e richiede una nuova revisione del Percorso.
          </p>
          <div className="world-composer-buttons">
            <button
              className="primary-action"
              type="button"
              disabled={!hasUnsavedChange || !proposalStatus.trim()}
              onClick={() => {
                // Il testo resta disponibile anche se il salvataggio locale fallisce.
                onUpdateChoiceState(scene.sceneId, selectedChoiceId, proposalStatus);
              }}
            >
              Conserva variazione nella scena
            </button>
            <button
              className="secondary-action"
              type="button"
              disabled={!hasUnsavedChange}
              onClick={() => setProposal(null)}
            >
              Scarta la modifica
            </button>
          </div>
        </div>
      )}
      {project.projectId === "pw-strategy-selection-01-museo-zero" &&
       scene.sceneId === "MZ4_TEST_MAPPING" && (
        <AwcTechnicalEvidencePanel />
      )}
      <div className="world-composer-footer">
        <button className="quiet-action" type="button" onClick={() => { setSelectedChoiceId(null); setProposal(null); }} disabled={!changed}>
          Ripristina la vista originale
        </button>
        <p className="world-composer-note">Ripristinare la vista non elimina modifiche già salvate. Lo stato originale rimane distinto dalla conseguenza scelta.</p>
      </div>
    </section>
  );
}
