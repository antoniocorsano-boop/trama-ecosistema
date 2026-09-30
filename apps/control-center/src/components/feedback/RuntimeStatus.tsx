import { useEffect, useState } from "react";
import { subscribeRuntimeDataState } from "../../data/runtimeState";

type State = { online: boolean; dataSource: "NETWORK_OR_PRECACHE" | "OFFLINE_CACHE" };

export function RuntimeStatus() {
  const [state, setState] = useState<State>({
    online: typeof navigator === "undefined" ? true : navigator.onLine,
    dataSource: "NETWORK_OR_PRECACHE",
  });

  useEffect(() => subscribeRuntimeDataState(setState), []);

  if (state.online && state.dataSource !== "OFFLINE_CACHE") {
    return <p className="runtime-status is-current">Dati governati · rete disponibile</p>;
  }

  return (
    <p className="runtime-status is-offline" role="status">
      {state.dataSource === "OFFLINE_CACHE"
        ? "Offline · copia cached, potenzialmente non aggiornata"
        : "Rete non disponibile · i dati cached verranno marcati come non correnti"}
    </p>
  );
}
