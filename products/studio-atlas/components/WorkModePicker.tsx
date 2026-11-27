import { WORK_MODES, findWorkMode, type WorkModeId } from "../lib/authoring-catalog";

export function WorkModePicker({ value, onChange, defaultLabel = "Scegli un banco" }: {
  value?: WorkModeId;
  onChange: (mode?: WorkModeId) => void;
  defaultLabel?: string;
}) {
  const selected = findWorkMode(value);
  return (
    <section className="work-mode-picker" aria-label="Modalità di lavoro">
      <label>
        Modalità di lavoro{" "}
        <select value={value ?? ""} onChange={event => onChange(findWorkMode(event.target.value)?.id)}>
          <option value="">{defaultLabel}</option>
          {WORK_MODES.map(mode => <option key={mode.id} value={mode.id}>{mode.title}</option>)}
        </select>
      </label>
      {selected && <p role="status">{selected.description}</p>}
    </section>
  );
}
