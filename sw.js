const CACHE='buduj-slowa-v15';
const FILES=['./','./index.html','./style.css?v=15','./app.js?v=15','./learning.js?v=15','./course.js?v=15','./word-lookup.js?v=15','./word-data.js?v=15','./WORD_DICTIONARY_LICENSE.md','./answer-sounds.js?v=15','./audio-settings.js?v=15','./data.js?v=15','./icon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest','./exports/slownik_PL_RU_EN_DE.txt','./exports/slownik_PL_RU_EN_DE.csv'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>Promise.all(FILES.map(url=>cache.add(new Request(url,{cache:'reload'}))))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('buduj-slowa-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  // Bypass the browser HTTP cache online; retain a separate fallback for offline learning.
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(event.request,copy)));}
    return response;
  }).catch(()=>caches.match(event.request).then(hit=>hit||(event.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
