const CACHE='trama-control-center-v7';
const SHELL=['./manifest.webmanifest','./icons/icon-192.svg','./icons/icon-512.svg','./ecosystem.html','./evidence.html','./data/ecosystem-snapshot.json','./reports/stakeholder-assurance.html','./reports/stakeholder-assurance.md'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

async function networkFirst(request,fallback){
  try{
    const response=await fetch(request,{cache:'no-store'});
    if(response&&response.ok){
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(request,copy));
    }
    return response;
  }catch(err){
    return (await caches.match(request)) || (fallback ? await caches.match(fallback) : undefined) || Response.error();
  }
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  const u=new URL(request.url);
  if(request.method!=='GET'||u.origin!==self.location.origin)return;

  const isNavigation=request.mode==='navigate';
  const isHtml=u.pathname.endsWith('/')||u.pathname.endsWith('.html');
  const isSnapshot=u.pathname.endsWith('/data/ecosystem-snapshot.json');

  if(isNavigation||isHtml){
    event.respondWith(networkFirst(request,'./index.html'));
    return;
  }

  if(isSnapshot){
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>cached||fetch(request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(request,copy));
      return response;
    }))
  );
});
