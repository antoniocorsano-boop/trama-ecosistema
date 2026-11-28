"use client";

import { useEffect, useState } from "react";

const KEY = "studio-atlas.appearance.v1";
type Theme = "contemporary" | "atelier";
const parse = (value: string | null): Theme => value === "atelier" ? "atelier" : "contemporary";

export function StudioAppearance() {
  const [theme, setTheme] = useState<Theme>("contemporary");
  const [sessionOnly, setSessionOnly] = useState(false);
  useEffect(() => {
    const restore = () => {
      try {
        const next = parse(localStorage.getItem(KEY));
        setTheme(next);
        document.documentElement.dataset.studioTheme = next;
      } catch { setSessionOnly(true); }
    };
    restore();
    const sync = (event: StorageEvent) => { if (event.key === KEY || event.key === null) restore(); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function choose(value: Theme) {
    setTheme(value);
    document.documentElement.dataset.studioTheme = value;
    try { localStorage.setItem(KEY, value); setSessionOnly(false); }
    catch { setSessionOnly(true); }
  }
  return <aside className="studio-appearance" aria-label="Aspetto di Studio Atlas">
    <label><span>Stile dello Studio</span>
      <select value={theme} onChange={event => choose(parse(event.target.value))}>
        <option value="contemporary">Contemporaneo</option>
        <option value="atelier">Atelier</option>
      </select>
    </label>
    {sessionOnly && <small>Preferenza non salvata sul dispositivo.</small>}
  </aside>;
}
