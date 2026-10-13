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
  { type: "presentation", title: "Presentazione introduttiva", description: "Per introdurre il tema e guidare la spiegazione." },
  { type: "worksheet", title: "Scheda di lavoro", description: "Per accompagnare l’attività degli studenti." },
  { type: "guide", title: "Guida illustrata", description: "Per sostenere comprensione e livelli minimi." },
  { type: "rubric", title: "Rubrica di valutazione", description: "Per osservare e valutare il lavoro svolto." },
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
      <button className={styles.backAction} type="button" onClick={() => window.history.back()}>← Indietro</button>

      <section className={styles.context} aria-label="Contesto didattico">
        <div>
          <small>UDA</small>
          <strong>{context.udaTitle}</strong>
        </div>
        <span>{context.sectionLabel ?? context.grade} · {context.discipline}</span>
      </section>

      <header className={styles.header}>
        <h1>Scegli i materiali</h1>
        <p>Seleziona ciò che ti serve per questa lezione.</p>
      </header>

      <section className={styles.materials} aria-label="Materiali disponibili">
        <div className={styles.grid}>
          {CATALOG.map((item) => {
            const active = selected.has(item.type);
            return (
              <button key={item.type} type="button" className={`${styles.card} ${active ? styles.active : ""}`} onClick={() => toggle(item.type)} aria-pressed={active}>
                <span className={styles.check} aria-hidden>{active ? "✓" : "+"}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <div className={styles.actionBar}>
        <span>{selectedItems.length === 1 ? "1 materiale scelto" : `${selectedItems.length} materiali scelti`}</span>
        <button type="button" onClick={returnToDocenteOs} disabled={!selectedItems.length}>
          Continua con {selectedItems.length} {selectedItems.length === 1 ? "materiale" : "materiali"}
        </button>
      </div>
    </main>
  );
}
