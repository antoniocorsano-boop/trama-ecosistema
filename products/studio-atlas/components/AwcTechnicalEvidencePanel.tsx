"use client";

import { useEffect, useState } from "react";
import { AwcSalaZeroLivePreview } from "./AwcSalaZeroLivePreview";
import type { SceneVisualRecipe } from "../lib/scene-visual-recipe";
import {
  AWC_F_PLAN_SHA256,
  AWC_FRAMES,
  type AwcEvidencePreview,
  type AwcFrame,
  type AwcRenderer,
  validateAwcEvidenceArchive,
} from "../lib/awc-evidence";

const FRAME_LABEL: Record<AwcFrame, string> = {
  reference: "Originale",
  rotated: "Inquadratura variata",
  restored: "Ripristinata",
  "cue-B": "Segnale B simulato",
};

type PreviewUrls = Record<AwcRenderer, Record<AwcFrame, string>>;

export function AwcTechnicalEvidencePanel({recipe}:{recipe?:SceneVisualRecipe} = {}) {
  const [evidence, setEvidence] = useState<AwcEvidencePreview | null>(null);
  const [frame, setFrame] = useState<AwcFrame>("reference");
  const [urls, setUrls] = useState<PreviewUrls | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "verified" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!evidence) {
      setUrls(null);
      return;
    }
    const created: string[] = [];
    const objects = {} as PreviewUrls;
    for (const renderer of ["art", "web"] as const) {
      const frames = {} as Record<AwcFrame, string>;
      for (const selected of AWC_FRAMES) {
        const url = URL.createObjectURL(evidence.images[renderer][selected]);
        created.push(url);
        frames[selected] = url;
      }
      objects[renderer] = frames;
    }
    setUrls(objects);
    return () => {
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [evidence]);

  async function importEvidence(file: File) {
    setState("loading");
    setError("");
    setEvidence(null);
    setFrame("reference");
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const verified = await validateAwcEvidenceArchive(bytes);
      setEvidence(verified);
      setState("verified");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Archivio tecnico non leggibile");
      setState("error");
    }
  }

  return (
    <section className="awc-evidence-panel" aria-labelledby="awc-evidence-title">
      <h3 id="awc-evidence-title">Sala Zero · Confronto della prova 3-D</h3>
      <p className="world-composer-note">
        Confronta i fotogrammi originali delle due derivazioni oppure apri, qui sotto,
        una prova WebGL tridimensionale separata. Nessuna delle due sostituisce l’esperienza dello studente.
      </p>
      <AwcSalaZeroLivePreview recipe={recipe}/>
      <label className="awc-evidence-input">
        <strong>Apri la prova tecnica conservata</strong>
        <span>Seleziona l’archivio ZIP AWC-F, senza caricarlo su alcun servizio.</span>
        <input
          type="file"
          accept=".zip,application/zip"
          aria-label="Archivio tecnico AWC-F Sala Zero"
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (selected) void importEvidence(selected);
            event.currentTarget.value = "";
          }}
        />
      </label>
      <p className="world-composer-note" role="status" aria-live="polite">
        {state === "loading" ? "Verifica locale di integrità in corso…" :
          state === "verified" ? "Archivio verificato. Anteprima non pubblica." :
          state === "error" ? "Archivio non accettato." :
          "Nessun archivio selezionato. La scena narrativa rimane disponibile."}
      </p>
      {error && <p role="alert" className="awc-evidence-error">{error}</p>}
      {evidence && urls && (
        <>
          <div className="awc-evidence-actions" role="group" aria-label="Stati visivi della Sala Zero">
            {AWC_FRAMES.map((stateId) => (
              <button
                key={stateId}
                type="button"
                className={frame === stateId ? "secondary-action is-current" : "secondary-action"}
                aria-pressed={frame === stateId}
                onClick={() => setFrame(stateId)}
              >
                {FRAME_LABEL[stateId]}
              </button>
            ))}
          </div>
          <div className="awc-evidence-views">
            {(["art", "web"] as const).map((renderer) => (
              <figure key={renderer}>
                <img
                  src={urls[renderer][frame]}
                  width={640}
                  height={480}
                  alt={renderer === "art"
                    ? `Rendering artistico Blender della Sala Zero: stato ${FRAME_LABEL[frame]}`
                    : `Rendering WebGL della Sala Zero: stato ${FRAME_LABEL[frame]}`}
                />
                <figcaption>
                  {renderer === "art" ? "Blender · prova artistica" : "WebGL · prova nel navigatore"}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="world-composer-note">
            Origine verificata: {evidence.sourceRevision.slice(0, 12)} · Piano{" "}
            {AWC_F_PLAN_SHA256.slice(0, 12)}. Ripristino esatto attestato nel rapporto.
            Approvazione artistica e autorizzazione studenti: assenti.
          </p>
        </>
      )}
    </section>
  );
}
