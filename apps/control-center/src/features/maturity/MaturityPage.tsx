import { useEffect, useMemo, useState } from "react";
import { loadEcosystemSnapshot, type SnapshotLoadState } from "../../data/client";
import { toMaturitySnapshot } from "../../domain/maturity/adapter";
import {
  bindingLabel,
  COMPONENT_STAGES,
  evidenceDisplayLabel,
  lifecycleLabel,
  productLabel,
  shortComponentName,
  sourceLabel,
  STAGE_LABELS,
  stageIndex,
  type MaturityComponent,
} from "../../domain/maturity/model";

const initial: SnapshotLoadState = { status: "LOADING" };

export function MaturityPage() {
  const [state, setState] = useState<SnapshotLoadState>(initial);
  const [product, setProduct] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void loadEcosystemSnapshot(controller.signal).then(setState);
    return () => controller.abort();
  }, []);

  if (state.status === "LOADING") {
    return <StatusMessage title="Maturità" message="Caricamento dello snapshot governato…" />;
  }

  if (state.status === "INVALID" || state.status === "UNAVAILABLE") {
    return (
      <StatusMessage
        title="Maturità"
        message="Snapshot non utilizzabile. La candidate non ricostruisce né deduce lo stato."
        tone="error"
      />
    );
  }

  const model = toMaturitySnapshot(state.data);
  return (
    <MaturityView
      model={model}
      product={product}
      onProductChange={setProduct}
      selectedId={selectedId}
      onSelect={setSelectedId}
    />
  );
}

type ViewProps = {
  model: ReturnType<typeof toMaturitySnapshot>;
  product: string;
  onProductChange: (value: string) => void;
  selectedId: string | null;
  onSelect: (value: string) => void;
};

export function MaturityView({
  model,
  product,
  onProductChange,
  selectedId,
  onSelect,
}: ViewProps) {
  const products = useMemo(
    () => [...new Set(model.components.map((component) => component.product).filter(Boolean) as string[])]
      .sort((a, b) => productLabel(a).localeCompare(productLabel(b), "it")),
    [model.components],
  );

  const visible = useMemo(
    () => model.components.filter((component) => product === "ALL" || component.product === product),
    [model.components, product],
  );

  const selected = visible.find((component) => component.componentId === selectedId)
    ?? visible[0]
    ?? null;

  const source = model.sourceState?.["component-evidence-registry"];
  const sourceLabelValue = source?.status === "FRESH" ? "Aggiornata" : (source?.status || "Non disponibile");

  return (
    <section className="maturity-page" aria-labelledby="maturity-title">
      <header className="feature-header">
        <p className="section-kicker">A2 · VISTA SPECIALISTICA</p>
        <h2 id="maturity-title">Maturità</h2>
        <p>
          I livelli confermati riflettono evidenze governate. Le evidenze live verificate possono aggiornare
          lo stato osservato e la maturità candidata senza promuovere automaticamente il ciclo di vita.
        </p>
      </header>

      <section className="maturity-summary" aria-label="Quadro disponibile">
        <SummaryMetric label="Aree osservate" value={String(model.areas.length)} />
        <SummaryMetric label="Componenti tracciati" value={String(model.components.length)} />
        <SummaryMetric label="Fonte componenti" value={sourceLabelValue} />
      </section>

      <section className="maturity-section" aria-labelledby="areas-title">
        <div className="section-title">
          <div>
            <h3 id="areas-title">Aree di maturità</h3>
            <p>Livelli da evidenze bound · nessuno score di qualità.</p>
          </div>
        </div>
        <div className="area-list">
          {model.areas.map((area) => (
            <article key={area.id} className="area-item">
              <div>
                <strong>{area.name}</strong>
                <small>{area.ownerDomain || "—"}</small>
                <small>
                  {area.nextTargetLevel == null
                    ? "Catena L5 completa"
                    : `Prossimo livello: L${area.nextTargetLevel}`}
                </small>
              </div>
              <div className="level-track" aria-label={`${area.name}: livello confermato L${area.confirmedLevel}, candidato L${area.candidateLevel}`}>
                {[0, 1, 2, 3, 4, 5].map((level) => (
                  <span key={level} className={level <= area.confirmedLevel ? "level is-confirmed" : "level"}>
                    L{level}
                  </span>
                ))}
              </div>
              <dl className="area-meta">
                <div><dt>Confermato</dt><dd>L{area.confirmedLevel}</dd></div>
                <div><dt>Candidato</dt><dd>L{area.candidateLevel}</dd></div>
                <div><dt>Prove bound</dt><dd>{bindingLabel(area.evidenceBindingStatus)}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="maturity-section" aria-labelledby="components-title">
        <div className="section-title">
          <div>
            <h3 id="components-title">Componenti</h3>
            <p>Evidenze governate + live verificate, senza score o percentuali.</p>
          </div>
        </div>

        <div className="product-filters" role="group" aria-label="Filtra componenti per prodotto">
          <FilterButton active={product === "ALL"} onClick={() => onProductChange("ALL")}>Tutti</FilterButton>
          {products.map((item) => (
            <FilterButton
              key={item}
              active={product === item}
              onClick={() => onProductChange(item)}
            >
              {productLabel(item)}
            </FilterButton>
          ))}
        </div>

        <div className="component-workspace">
          <div className="component-list" aria-label="Elenco equivalente della maturità dei componenti">
            {visible.map((component) => (
              <ComponentButton
                key={component.componentId}
                component={component}
                selected={component.componentId === selected?.componentId}
                onSelect={() => onSelect(component.componentId)}
              />
            ))}
          </div>

          <aside className="component-detail" aria-live="polite" aria-label="Dettaglio componente">
            {selected ? <ComponentDetail component={selected} /> : <p>Nessun componente disponibile.</p>}
          </aside>
        </div>
      </section>

      <footer className="feature-footer">
        Snapshot {model.schemaVersion} · {formatDate(model.generatedAt)} · READ_ONLY
      </footer>
    </section>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick}>
      {children}
    </button>
  );
}

function ComponentButton({
  component,
  selected,
  onSelect,
}: {
  component: MaturityComponent;
  selected: boolean;
  onSelect: () => void;
}) {
  const maturity = component.maturity ?? {};
  const confirmed = maturity.confirmedStage ?? "REGISTERED";
  const candidate = maturity.candidateStage ?? confirmed;
  const confirmedIndex = stageIndex(confirmed);
  const candidateIndex = stageIndex(candidate);

  return (
    <button
      type="button"
      className={selected ? "component-item is-selected" : "component-item"}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className="component-item-copy">
        <strong>{shortComponentName(component)}</strong>
        <small>{productLabel(component.product)} · {lifecycleLabel(component.lifecycle)}</small>
      </span>
      <span className="stage-rail" aria-label={`Confermato ${STAGE_LABELS[confirmed]}, candidato ${STAGE_LABELS[candidate]}`}>
        {COMPONENT_STAGES.map((stage, index) => (
          <span
            key={stage}
            title={STAGE_LABELS[stage]}
            className={
              index <= confirmedIndex
                ? "stage-dot is-confirmed"
                : index <= candidateIndex
                  ? "stage-dot is-candidate"
                  : "stage-dot"
            }
          />
        ))}
      </span>
      <span className="component-item-stage">
        <small>Confermato</small>
        <strong>{STAGE_LABELS[confirmed]}</strong>
        {candidate !== confirmed ? <em>Candidato: {STAGE_LABELS[candidate]}</em> : null}
      </span>
    </button>
  );
}

function ComponentDetail({ component }: { component: MaturityComponent }) {
  const maturity = component.maturity ?? {};
  const confirmed = maturity.confirmedStage ?? "REGISTERED";
  const candidate = maturity.candidateStage ?? confirmed;
  const evidence = Object.values(component.evidenceStatus ?? {});

  return (
    <>
      <p className="detail-kicker">{productLabel(component.product)}</p>
      <h4>{shortComponentName(component)}</h4>
      <p className="component-id">{component.componentId}</p>

      <dl className="detail-meta">
        <div><dt>Ciclo di vita</dt><dd>{lifecycleLabel(component.lifecycle)}</dd></div>
        <div><dt>Origine</dt><dd>{sourceLabel(component.sourceClass)}</dd></div>
        <div><dt>Confermato</dt><dd>{STAGE_LABELS[confirmed]}</dd></div>
        <div><dt>Candidato</dt><dd>{STAGE_LABELS[candidate]}</dd></div>
      </dl>

      <h5>Evidenze</h5>
      <ul className="evidence-list">
        {evidence.map((item) => (
          <li key={item.type || item.ref}>
            <span>{item.type?.replaceAll("_", " ") || "Evidenza"}</span>
            <strong data-source-plane={item.sourcePlane || "GOVERNED"}>
              {evidenceDisplayLabel(item)}
            </strong>
          </li>
        ))}
      </ul>

      {maturity.remainingEvidenceTypes?.length ? (
        <p className="remaining-evidence">
          Ancora richiesto: {maturity.remainingEvidenceTypes.map((item) => item.replaceAll("_", " ").toLowerCase()).join(", ")}.
        </p>
      ) : null}

      {component.sourceRef ? <p className="source-ref">{component.sourceRef}</p> : null}
    </>
  );
}

function StatusMessage({
  title,
  message,
  tone = "normal",
}: {
  title: string;
  message: string;
  tone?: "normal" | "error";
}) {
  return (
    <section className={tone === "error" ? "feature-status is-error" : "feature-status"}>
      <p className="section-kicker">A2 · VISTA SPECIALISTICA</p>
      <h2>{title}</h2>
      <p role={tone === "error" ? "alert" : undefined}>{message}</p>
    </section>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
