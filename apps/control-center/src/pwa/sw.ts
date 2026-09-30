/// <reference lib="webworker" />
import { cleanupOutdatedCaches, matchPrecache, precacheAndRoute } from "workbox-precaching";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision?: string | null } | string>;
};

const DATA_CACHE = "trama-control-center-data-v1";
const DATA_PATHS = [
  "/data/ecosystem-snapshot.json",
  "/data/context-packs/project-knowledge.json",
];

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

function isGovernedData(url: URL) {
  return DATA_PATHS.some((path) => url.pathname.endsWith(path));
}

async function withOfflineMarker(response: Response) {
  const body = await response.clone().arrayBuffer();
  const headers = new Headers(response.headers);
  headers.set("X-TRAMA-Data-Source", "CACHE_OFFLINE");
  headers.set("X-TRAMA-Cache-Policy", "NETWORK_FIRST");
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function networkFirstGovernedData(request: Request) {
  const cache = await caches.open(DATA_CACHE);
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached ? withOfflineMarker(cached) : Response.error();
  }
}

async function navigationFallback(request: Request) {
  try {
    return await fetch(request);
  } catch {
    return (
      (await matchPrecache("index.html")) ??
      (await caches.match(new URL("./index.html", self.registration.scope).href)) ??
      Response.error()
    );
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isGovernedData(url)) {
    event.respondWith(networkFirstGovernedData(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(navigationFallback(request));
  }
});
