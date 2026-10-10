import type { LauncherItem } from '../app/access-state';

export function AccessLauncher({ items }: { items: LauncherItem[] }) {
  return (
    <div className="access-launcher" aria-label="Ambienti disponibili">
      {items.map((item) => (
        <button
          key={item.application}
          type="button"
          disabled
          aria-disabled="true"
          className="access-launcher-item"
          aria-label={`${item.label} — Disponibile dalla fase di federazione`}
        >
          <span className="access-launcher-label">{item.label}</span>
          <span className="access-launcher-pending">Disponibile dalla fase di federazione</span>
        </button>
      ))}
    </div>
  );
}
