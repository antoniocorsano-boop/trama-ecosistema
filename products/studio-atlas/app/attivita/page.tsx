"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  decodeUtf8,
  isolatedHtml,
  listActivityDrafts,
  saveActivityDraft,
  type ActivityDraft,
} from "../../lib/activity-drafts";

const FIRST_PACKAGE = "https://github.com/antoniocorsano-boop/Curriculum-Atlas/pull/84";

export default function AttivitaPage() {
  const [url, setUrl] = useState(FIRST_PACKAGE);
  const [activities, setActivities] = useState<ActivityDraft[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [problem, setProblem] = useState("");
  const [preview, setPreview] = useState<"CLOSED" | "EXPERIENCE" | "GUIDE">("CLOSED");

  useEffect(() => {
    listActivityDrafts().then(setActivities).catch((error) => {
      setProblem(error instanceof Error ? error.message : "Archivio locale non disponibile");
    });
  }, []);

  const current = useMemo(() =>
    activities.find((item) => item.key === selectedKey) ?? activities[0] ?? null,
    [activities, selectedKey]
  );
  const imageAssets = current?.manifest.assets.filter((item) => item.type === "IMAGE") ?? [];
  const findFile = (path: string) => current?.files.find((item) => item.path === path);
  const html = current?.files.find((item) => item.type === "INTERACTIVE_HTML");
  const guide = current?.files.find((item) => item.type === "TEACHER_GUIDE");
  let previewHtml = "";
  try {
    if (preview === "EXPERIENCE" && html) previewHtml = isolatedHtml(decodeUtf8(html.base64), true);
    if (preview === "GUIDE" && guide) previewHtml = isolatedHtml(decodeUtf8(guide.base64), false);
  } catch {
    previewHtml = "";
  }

  async function importActivity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProblem("");
    setNotice("");
    setLoading(true);
    setPreview("CLOSED");
    try {
      const response = await fetch("/api/attivita/importa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const result = await response.json() as { draft?: ActivityDraft; verified?: number; error?: string };
      if (!response.ok || !result.draft) throw new Error(result.error ?? "Importazione non riuscita");
      const outcome = await saveActivityDraft(result.draft);
      const updated = await listActivityDrafts();
      setActivities(updated);
      setSelectedKey(result.draft.key);
      setNotice(outcome === "EXISTS"
        ? "Attività già presente: nessuna modifica agli originali."
        : "Attività importata come bozza: " + result.verified + " risorse verificate e conservate.");
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "Non è stato possibile importare l'attività");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="studio-shell activity-shell">
      <nav className="back-nav"><Link href="/">← Studio Atlas</Link></nav>
      <header className="studio-header">
        <div>
          <p className="eyebrow">Biblioteca di Studio Atlas</p>
          <h1>Attività da utilizzare e sviluppare.</h1>
        </div>
      </header>

      <section className="activity-import" aria-labelledby="import-title">
        <h2 id="import-title">Importa attività</h2>
        <p>Acquisisci un pacchetto da una revisione di Curriculum Atlas. Il materiale rimane una bozza privata sul dispositivo: non viene pubblicato né assegnato a una classe.</p>
        <form onSubmit={importActivity} className="activity-form">
          <label htmlFor="activity-url">Collegamento alla revisione che contiene il materiale</label>
          <div className="activity-form-row">
            <input
              id="activity-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              type="url"
              required
              spellCheck={false}
              placeholder="https://github.com/.../pull/..."
              disabled={loading}
            />
            <button type="submit" className="primary-action" disabled={loading}>
              {loading ? "Verifica in corso…" : "Importa"}
            </button>
          </div>
        </form>
        {problem && <p className="activity-message error" role="alert">{problem}</p>}
        {notice && <p className="activity-message" role="status">{notice}</p>}
      </section>

      <section className="activity-library" aria-label="Attività importate">
        <div className="section-heading">
          <h2>Le tue attività</h2>
          <span>{activities.length}</span>
        </div>
        {activities.length === 0 ? (
          <p className="activity-empty">Non ci sono ancora attività importate su questo dispositivo.</p>
        ) : (
          <div className="activity-list">
            {activities.map((activity) => (
              <button
                type="button"
                key={activity.key}
                className={"activity-list-item" + (current?.key === activity.key ? " active" : "")}
                onClick={() => { setSelectedKey(activity.key); setPreview("CLOSED"); setNotice(""); }}
                aria-pressed={current?.key === activity.key}
              >
                <strong>{activity.manifest.title}</strong>
                <small>Bozza · versione {activity.version} · {activity.files.length} risorse</small>
              </button>
            ))}
          </div>
        )}
      </section>

      {current && (
        <section className="activity-details" aria-labelledby="activity-title">
          <p className="eyebrow">Materiale acquisito · revisione docente necessaria</p>
          <h2 id="activity-title">{current.manifest.title}</h2>
          <p className="activity-meta">
            {current.manifest.learning?.suggestedDurationMinutes
              ? current.manifest.learning.suggestedDurationMinutes + " minuti · " : ""}
            {current.files.length} file originali verificati · versione {current.version}
          </p>

          {imageAssets.length > 0 && (
            <div className="activity-gallery" aria-label="Illustrazioni conservate">
              {imageAssets.map((asset) => {
                const file = findFile(asset.path);
                return file && file.format.startsWith("image/") ? (
                  <figure key={asset.id}>
                    {/* The image is an integrity-checked, locally stored data URI. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={"data:" + file.format + ";base64," + file.base64} alt={"Illustrazione " + asset.id + "; descrizione da verificare"} />
                    <figcaption>{asset.id}</figcaption>
                  </figure>
                ) : null;
              })}
            </div>
          )}

          {current.manifest.learning?.objectives && (
            <div className="activity-teaching">
              <h3>Proposta didattica</h3>
              <ul>{current.manifest.learning.objectives.map((objective) =>
                <li key={objective}>{objective}</li>)}
              </ul>
            </div>
          )}

          <div className="activity-review-line">
            <strong>Da verificare prima dell'uso con gli studenti</strong>
            <p>Diritti, accessibilità, correttezza dei contenuti e obiettivi del curricolo approvato in Arena. Nessuna autorizzazione di pubblicazione è stata concessa.</p>
          </div>

          <div className="activity-controls">
            {html && <button type="button" className="secondary-action"
              onClick={() => setPreview(preview === "EXPERIENCE" ? "CLOSED" : "EXPERIENCE")}>
              {preview === "EXPERIENCE" ? "Chiudi prova" : "Prova l'attività in ambiente isolato"}
            </button>}
            {guide && <button type="button" className="secondary-action"
              onClick={() => setPreview(preview === "GUIDE" ? "CLOSED" : "GUIDE")}>
              {preview === "GUIDE" ? "Chiudi guida" : "Leggi guida docente"}
            </button>}
          </div>
          {preview !== "CLOSED" && previewHtml && (
            <div className="activity-preview">
              <p>{preview === "EXPERIENCE"
                ? "Anteprima isolata per il docente. Non equivale ad autorizzazione per gli studenti."
                : "Guida docente originale, in consultazione protetta."}</p>
              <iframe
                key={current.key + preview}
                title={preview === "EXPERIENCE" ? "Prova riservata dell'attività" : "Guida docente"}
                sandbox={preview === "EXPERIENCE" ? "allow-scripts" : ""}
                referrerPolicy="no-referrer"
                srcDoc={previewHtml}
              />
            </div>
          )}

          <details className="activity-resource-details">
            <summary>Verifica le risorse conservate ({current.files.length})</summary>
            <ul>{current.files.map((file) =>
              <li key={file.path}>{file.path} · SHA-256 {file.sha256.slice(0, 12)}…</li>
            )}</ul>
          </details>
          <p className="activity-source">
            Fonte: <a href={"https://github.com/" + current.source.repository + "/pull/" + current.source.pullRequest}
              target="_blank" rel="noopener noreferrer">revisione GitHub #{current.source.pullRequest}</a>.
            Archivio locale del dispositivo; nessuna sincronizzazione o collegamento automatico alle UDA.
          </p>
        </section>
      )}
    </main>
  );
}
