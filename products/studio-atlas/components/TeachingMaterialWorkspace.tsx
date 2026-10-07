"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MATERIAL_BUNDLE_SCHEMA,
  decodeTeachingContext,
  encodeMaterialBundle,
  type MaterialBundleItem,
  type MaterialType,
  type TeachingContextSnapshot,
} from "../lib/teaching-material-handoff";
import styles from "./TeachingMaterialWorkspace.module.css";

const CATALOG: Array<Omit<MaterialBundleItem, "materialId" | "origin"> & { type: MaterialType }> = [
  { type: "presentation", title: "Presentazione introduttiva", description: "Una sequenza breve per aprire la lezione e rendere visibile il quadro dell’UDA." },
  { type: "worksheet", title: "Scheda di lavoro", description: "Consegne, domande guida ed evidenze da raccogliere durante l’attività." },
  { type: "guide", title: "Guida illustrata", description: "Spiegazioni visuali e riferimenti essenziali per sostenere comprensione e livelli minimi." },
  { type: "rubric", title: "Rubrica di valutazione", description: "Criteri osservabili coerenti con il lavoro richiesto agli studenti." },
];

export function TeachingMaterialWorkspace() {
  const [context, setContext] = useState<TeachingContextSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<MaterialType>>(() => new Set(CATALOG.map((item) => item.type)));

  useEffect(() => {
    const encoded = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("context");
    if (!encoded) {
      setError("Apri questa vista da un’UDA in Docente OS: il contesto didattico non è presente.");
      return;
    }
    const allowed = (process.env.NEXT_PUBLIC_DOCENTE_OS_ORIGINS ?? "https://docente-os-2026-27-beta.onrender.com,http://localhost:3000")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    try {
      setContext(decodeTeachingContext(encoded, allowed));
    } catch {
      setError("Il contesto ricevuto da Docente OS non è valido o proviene da un’origine non autorizzata.");
    }
  }, []);

  const selectedItems = useMemo(() => CATALOG.filter((item) => selected.has(item.type)), [selected]);

  function toggle(type: MaterialType) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  function returnToDocenteOs() {
    if (!context || !selectedItems.length) return;
    const items: MaterialBundleItem[] = selectedItems.map((item) => ({
      ...item,
      materialId: `${context.udaId}-${item.type}`,
      origin: "atlas",
    }));
    const bundle = {
      schema: MATERIAL_BUNDLE_SCHEMA,
      source: "studio-atlas" as const,
      bundleId: `${context.udaId}-${Date.now().toString(36)}`,
      sourceUdaId: context.udaId,
      generatedAt: new Date().toISOString(),
      items,
    };
    const target = new URL(context.returnUrl);
    target.hash = `bundle=${encodeMaterialBundle(bundle)}`;
    window.location.assign(target.toString());
  }

  if (error) {
    return <main className={styles.shell}><section className={styles.error}><strong>Contesto non disponibile</strong><p>{error}</p></section></main>;
  }
  if (!context) return <main className={styles.shell}><p className={styles.loading}>Sto leggendo il contesto dell’UDA…</p></main>;

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>MATERIALI · DA DOCENTE OS</p>
        <h1>Prepara ciò che serve per questa UDA</h1>
        <p>Atlas mantiene il contesto ricevuto: scegli i materiali da riportare alla lezione. Nessuna associazione viene salvata finché non la confermi in Docente OS.</p>
      </header>

      <section className={styles.context} aria-label="Contesto didattico ricevuto">
        <div><span>UDA</span><strong>{context.udaTitle}</strong><small>{context.udaId}</small></div>
        <div><span>CLASSE</span><strong>{context.sectionLabel ?? context.grade}</strong><small>{context.discipline}</small></div>
        {context.period ? <div><span>PERIODO</span><strong>{context.period}</strong><small>{context.blockId ?? "Focus corrente"}</small></div> : null}
      </section>

      <section className={styles.materials} aria-labelledby="materials-title">
        <div className={styles.sectionHeading}><div><span>PROPOSTA ATLAS</span><h2 id="materials-title">Materiali coerenti da preparare</h2></div><strong>{selectedItems.length} selezionati</strong></div>
        <div className={styles.grid}>
          {CATALOG.map((item) => {
            const active = selected.has(item.type);
            return (
              <button key={item.type} type="button" className={`${styles.card} ${active ? styles.active : ""}`} onClick={() => toggle(item.type)} aria-pressed={active}>
                <span className={styles.check}>{active ? "✓" : "+"}</span>
                <small>{label(item.type)}</small>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <aside className={styles.handoff}><div><span>PROSSIMO PASSO</span><strong>Rivedi l’associazione in Docente OS</strong><p>Atlas restituisce solo la proposta selezionata. Lezione e salvataggio restano sotto il controllo del docente.</p></div><button type="button" onClick={returnToDocenteOs} disabled={!selectedItems.length}>Torna a Docente OS <span aria-hidden>→</span></button></aside>
    </main>
  );
}

function label(type: MaterialType) {
  return ({ presentation: "PRESENTAZIONE", worksheet: "ATTIVITÀ", guide: "GUIDA", rubric: "VALUTAZIONE" } satisfies Record<MaterialType, string>)[type];
}
