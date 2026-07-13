/* MedQuest 5 — Service Worker (offline + instalável) */
const CACHE = "medquest-shell-v2";
const ASSETS = [
  "./", "./index.html", "./manifest.json",
  "./css/style.css", "./js/config.js", "./js/content.js", "./js/app.js",
  "./icon-192.png", "./icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Push (notificação mesmo com o app fechado)
self.addEventListener("push", (e) => {
  let data = { title: "MedQuest 5", body: "Hora de estudar! 🔥" };
  try { if (e.data) data = Object.assign(data, e.data.json()); } catch (err) {}
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    data: { url: data.url || "./" }
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const c of list) { if ("focus" in c) return c.focus(); }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});

// Network-first FRESCO: força buscar a versão nova (ignora cache HTTP) quando online;
// usa o cache só quando offline. Assim os updates aparecem na hora.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const sameOrigin = e.request.url.startsWith(self.location.origin);
  const req = sameOrigin ? new Request(e.request.url, { cache: "no-store" }) : e.request;
  e.respondWith(
    fetch(req)
      .then((resp) => {
        if (resp && resp.ok && sameOrigin) {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return resp;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
  );
});
