const V='nisi-v16';
const CORE=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
// cache:'reload' skips the browser's HTTP cache so a new version never stores an old copy
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const put=(req,r)=>{if(r&&(r.ok||r.type==='opaque')){const c=r.clone();caches.open(V).then(x=>x.put(req,c))}return r};
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  // the page itself: network first (revalidated) so updates arrive at once, cached copy when offline
  if(req.mode==='navigate'||/\/([\w-]+\.html)?$/.test(new URL(req.url).pathname)){
    e.respondWith(fetch(req.url,{cache:'no-cache'}).then(r=>put(req,r)).catch(()=>caches.match(req,{ignoreSearch:true}).then(h=>h||caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>{
    const net=fetch(req).then(r=>put(req,r)).catch(()=>hit);
    return hit||net;
  }));
});
