"use client";

import {useEffect, useRef, useState} from "react";
import {AUTHORED_STEM, authoredSource, importAuthoredSource, verifyAuthoredPackage,
  type AuthoredSource, type DiagramEdge, type DiagramVariant} from "../lib/education-diagram";

const mime: Record<string, string> = {svg: "image/svg+xml", html: "text/html", json: "application/json", md: "text/markdown"};
const maxSourceBytes = 8192;

export function EducationDiagramEditor() {
  const [source, setSource] = useState(() => authoredSource());
  const [variant, setVariant] = useState<DiagramVariant>("mobile-vertical");
  const [links, setLinks] = useState<Record<string, string>>({});
  const [guide, setGuide] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const operation = useRef<AbortController | null>(null);
  const urls = useRef<string[]>([]);
  function clear() {
    operation.current?.abort();
    operation.current = null;
    for (const url of urls.current) URL.revokeObjectURL(url);
    urls.current = [];
  }
  useEffect(() => clear, []);
  function update(next: AuthoredSource) {
    clear();
    setLinks({});
    setGuide("");
    setWorking(false);
    setError("");
    setSource(next);
  }
  async function run(action: (controller: AbortController) => Promise<void>) {
    const controller = new AbortController();
    operation.current = controller;
    setWorking(true);
    setError("");
    try {
      await action(controller);
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Operazione non riuscita.");
    } finally {
      if (operation.current === controller) {
        operation.current = null;
        setWorking(false);
      }
    }
  }
  async function generate() {
    clear();
    setLinks({});
    setGuide("");
    await run(async controller => {
      const response = await fetch("/api/education-diagram", {
        method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify(source), signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Generazione non riuscita.");
      const files = await verifyAuthoredPackage(result);
      if (controller.signal.aborted) return;
      const next: Record<string, string> = {};
      for (const [name, content] of Object.entries(files)) {
        const url = URL.createObjectURL(new Blob([content], {type: mime[name.split(".").at(-1) ?? ""]}));
        urls.current.push(url);
        next[name] = url;
      }
      setGuide(files["guida-docente.md"]);
      setLinks(next);
    });
  }
  function exportSource() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(source, null, 2)], {type: mime.json}));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "education-source.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function updateEdge(index: number, position: 0 | 1, id: string) {
    update({...source, edges: source.edges.map((edge, i): DiagramEdge =>
      i !== index ? edge : position === 0 ? [id, edge[1]] : [edge[0], id])});
  }
  const stem = `${AUTHORED_STEM}-${variant}`;
  const nextId = ["n1", "n2", "n3", "n4"].find(id => !source.nodes.some(node => node.id === id));
  const nextEdge = source.nodes.flatMap(a => source.nodes.map((b): DiagramEdge => [a.id, b.id]))
    .find(([a, b]) => a !== b && !source.edges.some(([x, y]) => a === x && b === y));
  return <section className="education-diagram-editor" aria-label="Componi un diagramma didattico">
    <h3>Componi un diagramma didattico</h3>
    <p>Inserisci da 1 a 4 nodi e fino a 8 relazioni direzionali. Usa solo testo didattico, senza dati personali o indirizzi.</p>
    <label>Titolo <input value={source.title} maxLength={26} onChange={e => update({...source, title: e.target.value})} /></label>
    <label>Finalità <textarea value={source.description} maxLength={160} onChange={e => update({...source, description: e.target.value})} /></label>
    {source.nodes.map((node, index) => <fieldset key={node.id}>
      <legend>Nodo {index + 1}</legend>
      <label>Etichetta <input maxLength={16} value={node.label} onChange={e => update({...source,
        nodes: source.nodes.map(item => item.id === node.id ? {...item, label: e.target.value} : item)})} /></label>
      <label>Dettaglio <input maxLength={22} value={node.detail} onChange={e => update({...source,
        nodes: source.nodes.map(item => item.id === node.id ? {...item, detail: e.target.value} : item)})} /></label>
      <button type="button" onClick={() => update({...source, nodes: source.nodes.filter(item => item.id !== node.id),
        edges: source.edges.filter(edge => !edge.includes(node.id))})}>Elimina nodo {index + 1}</button>
    </fieldset>)}
    <button type="button" disabled={!nextId} onClick={() => nextId && update({...source,
      nodes: [...source.nodes, {id: nextId, label: "", detail: ""}]})}>Aggiungi nodo</button>
    {source.edges.map(([a, b], index) => <fieldset key={index}>
      <legend>Relazione {index + 1}</legend>
      <label>Da <select value={a} onChange={e => updateEdge(index, 0, e.target.value)}>
        {source.nodes.map((node, i) => <option key={node.id} value={node.id}>{i + 1}. {node.label}</option>)}
      </select></label>
      <label>A <select value={b} onChange={e => updateEdge(index, 1, e.target.value)}>
        {source.nodes.map((node, i) => <option key={node.id} value={node.id}>{i + 1}. {node.label}</option>)}
      </select></label>
      <button type="button" onClick={() => update({...source, edges: source.edges.filter((_, i) => index !== i)})}>Elimina relazione {index + 1}</button>
    </fieldset>)}
    <button type="button" disabled={!nextEdge || source.edges.length >= 8}
      onClick={() => nextEdge && update({...source, edges: [...source.edges, nextEdge]})}>Aggiungi relazione</button>
    <label>Importa fonte JSON <input type="file" accept=".json,application/json" onChange={e => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      operation.current?.abort();
      void run(async controller => {
        if (file.size > maxSourceBytes) throw Error("La fonte supera 8 KiB.");
        let json: unknown;
        try { json = JSON.parse(await file.text()); }
        catch { throw Error("La fonte deve essere un documento JSON valido."); }
        if (!controller.signal.aborted) update(importAuthoredSource(json));
      });
    }} /></label>
    <button type="button" onClick={exportSource}>Esporta fonte JSON</button>
    <button type="button" disabled={working} onClick={() => void generate()}>Genera diagramma</button>
    {working && <p role="status">Elaborazione in corso…</p>}
    {error && <p role="alert">{error}</p>}
    {guide && <>
      <p role="status">Integrità verificata. Materiale da revisionare dal docente.</p>
      <label>Formato dell’anteprima <select value={variant} onChange={e => setVariant(e.target.value as DiagramVariant)}>
        <option value="mobile-vertical">Smartphone · verticale</option>
        <option value="desktop-lim-horizontal">LIM · orizzontale</option>
      </select></label>
      <img src={links[stem + ".svg"]} alt={source.title} style={{display: "block", width: "100%",
        maxWidth: variant === "mobile-vertical" ? 360 : 1280, height: "auto", margin: "auto"}} />
      <details><summary>Guida docente</summary><pre>{guide}</pre></details>
      <ul>
        {[[stem + ".html", "Scarica HTML"], [stem + ".svg", "Scarica SVG"],
          ["education-source.json", "Scarica la fonte prodotta"], ["guida-docente.md", "Scarica guida docente"],
          ["education-receipt.json", "Scarica ricevuta di produzione"]].map(([name, label]) =>
          <li key={name}><a href={links[name]} download={name}>{label}</a></li>)}
      </ul>
    </>}
  </section>;
}
