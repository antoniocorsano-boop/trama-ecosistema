const CACHE='trama-control-center-v4';
const SHELL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.svg','./icons/icon-512.svg','./data/ecosystem-snapshot.json','./reports/stakeholder-assurance.html','./reports/stakeholder-assurance.md'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  const u=new URL(event.request.url);
  if(event.request.method!=='GET'||u.origin!==self.location.origin)return;
  if(u.pathname.endsWith('/data/ecosystem-snapshot.json')){
    event.respondWith(fetch(event.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return r}).catch(()=>caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return r})).catch(()=>caches.match('./index.html')));
});