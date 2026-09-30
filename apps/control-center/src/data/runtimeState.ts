type RuntimeDataState = {
  online: boolean;
  dataSource: "NETWORK_OR_PRECACHE" | "OFFLINE_CACHE";
};

const EVENT = "trama:data-runtime-state";

let state: RuntimeDataState = {
  online: typeof navigator === "undefined" ? true : navigator.onLine,
  dataSource: "NETWORK_OR_PRECACHE",
};

export function reportDataSource(source: RuntimeDataState["dataSource"]) {
  state = { ...state, dataSource: source };
  window.dispatchEvent(new CustomEvent(EVENT, { detail: state }));
}

export function subscribeRuntimeDataState(listener: (next: RuntimeDataState) => void) {
  const onCustom = (event: Event) => listener((event as CustomEvent<RuntimeDataState>).detail);
  const onOnline = () => {
    state = { ...state, online: true };
    listener(state);
  };
  const onOffline = () => {
    state = { ...state, online: false };
    listener(state);
  };

  window.addEventListener(EVENT, onCustom);
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
  listener(state);

  return () => {
    window.removeEventListener(EVENT, onCustom);
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
  };
}
