"use client";

import { useState } from "react";
import type { PathwayProject, PathwayScene, SceneWorldState } from "../lib/model";
import { compareSceneWorld, worldPlaces } from "../lib/world-composer";
import { AwcTechnicalEvidencePanel } from "./AwcTechnicalEvidencePanel";
import { SceneVisualRecipeEditor } from "./SceneVisualRecipeEditor";
import { DEFAULT_RECIPE, type SceneVisualRecipe } from "../lib/scene-visual-recipe";

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


const LOCATION_LABELS = { ENTRY: "Ingresso", ROOM: "Ambiente", CONTROL: "Controllo", LAB: "Laboratorio" } as const;

function SceneComposition({ scene, scenes, onFocus }: {
  scene: PathwayScene;
  scenes: PathwayScene[];
  onFocus: (sceneId: string, locationId: string) => void;
}) {
  const locations = scene.stage?.locations ?? [];
  const focus = locations.find(location => location.id === scene.stage?.focusLocationId);
  const evidence = scene.stage?.evidence ?? [];
  const character = scene.stage?.characterBeat;
  const [inspected, setInspected] = useState<string | null>(null);
  const current = locations.find(location => location.id === inspected) ?? focus;
  return (
    <section className="composition-board" aria-labelledby="composition-heading">
      <header>
        <h3 id="composition-heading">Composizione visuale</h3>
        <p>Una tavola di lavoro della scena esistente: luoghi, indizi, azione e conseguenze. Non è un rendering né un'anteprima per gli studenti.</p>
      </header>
      <div className="composition-layout">
        <div className="composition-space">
          <h4>{scene.title || "Scena senza titolo"}</h4>
          <p>{scene.visibleSituation || "Situazione da descrivere nell’editor della scena."}</p>
          {locations.length > 0 ? (
            <>
              <div className="composition-map" role="group" aria-label="Mappa schematica dei luoghi">
                {locations.map(location => (
                  <button type="button" key={location.id}
                    data-position={location.position}
                    className="composition-location"
                    aria-pressed={current?.id === location.id}
                    onClick={() => setInspected(location.id)}>
                    <small>{LOCATION_LABELS[location.position]}</small>
                    <strong>{location.label}</strong>
                    {focus?.id === location.id && <span>Fuoco attuale</span>}
                    <span>{evidence.filter(item => item.locationId === location.id).length} indizi</span>
                  </button>
                ))}
              </div>
              {current && <div className="composition-inspector" aria-live="polite">
                <strong>{current.label}</strong>
                <p>{current.detail}</p>
                <ul>{evidence.filter(item => item.locationId === current.id).map(item =>
                  <li key={item.id}><strong>{item.label}</strong><span>{item.detail}</span></li>
                )}</ul>
                <button type="button" className="secondary-action" disabled={current.id === focus?.id}
                  onClick={() => onFocus(scene.sceneId, current.id)}>Imposta come fuoco della scena</button>
              </div>}
            </>
          ) : <p className="composition-empty">Nessun luogo visuale documentato: non vengono inventati ambienti o immagini.</p>}
          {character && <div className="composition-character">
            <strong>{character.name} · {character.role}</strong><p>{character.line}</p>
          </div>}
        </div>
        <aside className="composition-flow" aria-label="Sequenza educativa">
          <div><small>01 · Azione</small><p>{scene.learnerAction || "Da definire"}</p></div>
          <div><small>02 · Conseguenza</small><p>{scene.consequence || "Da definire"}</p></div>
          {scene.interaction === "CHOICE" && <div>
            <small>Possibilità e destinazioni</small>
            <ul>{scene.choices.map(choice => <li key={choice.choiceId}>
              <strong>{choice.label || "Scelta da definire"}</strong>
              <span>{choice.feedback || "Conseguenza da definire"}</span>
              <span>→ {scenes.find(item => item.sceneId === choice.targetSceneId)?.title || "Destinazione non definita"}</span>
            </li>)}</ul>
          </div>}
          <div><small>03 · Scoperta</small><p>{scene.reveal || "Da definire"}</p></div>
        </aside>
      </div>
      <p className="world-composer-note">Esplorare la tavola non modifica il Percorso. Impostare il fuoco salva nella scena e riapre la revisione, senza autorizzare la pubblicazione.</p>
    </section>
  );
}

function SceneVisualWorkbench({scene,showSalaZero,onSave}:{scene:PathwayScene;showSalaZero:boolean;onSave:(id:string,recipe:SceneVisualRecipe|undefined)=>void}){
  const [draft,setDraft]=useState(scene.visualRecipe??DEFAULT_RECIPE);
  return <>
    <SceneVisualRecipeEditor value={draft} saved={scene.visualRecipe} onChange={setDraft}
      onSave={()=>onSave(scene.sceneId,draft)}
      onRemove={()=>{onSave(scene.sceneId,undefined);setDraft(DEFAULT_RECIPE);}}/>
    {showSalaZero&&<AwcTechnicalEvidencePanel recipe={draft}/>}
  </>;
}

export function SceneDesignComparison({
  project,
  onUpdateChoiceState,
  onUpdateFocus,
  onUpdateRecipe,
}: {
  project: PathwayProject;
  onUpdateChoiceState: (sceneId: string, choiceId: string, status: string) => void;
  onUpdateFocus: (sceneId: string, locationId: string) => void;
  onUpdateRecipe: (sceneId: string, recipe: SceneVisualRecipe | undefined) => void;
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
      <SceneComposition key={scene.sceneId} scene={scene} scenes={project.scenes} onFocus={onUpdateFocus} />
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
      <SceneVisualWorkbench key={scene.sceneId} scene={scene} onSave={onUpdateRecipe}
        showSalaZero={project.projectId === "pw-strategy-selection-01-museo-zero" && scene.sceneId === "MZ4_TEST_MAPPING"}/>
      <div className="world-composer-footer">
        <button className="quiet-action" type="button" onClick={() => { setSelectedChoiceId(null); setProposal(null); }} disabled={!changed}>
          Ripristina la vista originale
        </button>
        <p className="world-composer-note">Ripristinare la vista non elimina modifiche già salvate. Lo stato originale rimane distinto dalla conseguenza scelta.</p>
      </div>
    </section>
  );
}
