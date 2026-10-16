const C='sps-v5',A=['./','./index.html','./Our-School-Space.png','./manifest.webmanifest','./badge-96.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))))});
// Push notifications (FCM data messages)
self.addEventListener('push',e=>{let p={};try{p=e.data?e.data.json():{}}catch(x){}const d=p.data||{},n=p.notification||{};e.waitUntil(self.registration.showNotification(d.title||n.title||'مساحتنا المدرسية',{body:d.body||n.body||'',icon:'icon-192.png',badge:'badge-96.png',dir:'rtl',lang:'ar',data:{url:d.url||'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=new URL((e.notification.data&&e.notification.data.url)||'./',self.registration.scope).href;e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus' in c)return c.focus()}return clients.openWindow(u)}))});
