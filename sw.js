// PWA ("Ana ekrana ekle") kurulabilir olması için Chrome'un istediği minimum service worker.
// SADECE sitenin kendi kabuğunu (bu birkaç dosya) önbellekten sunuyoruz — hava/dalga verisi,
// harita karoları, Supabase gibi dış istekler HİÇ dokunulmadan doğrudan ağdan gidiyor; yoksa
// kullanıcı önbellekten eski/yanlış bir deniz durumu görebilirdi. Amaç çevrimdışı çalışmak
// değil, sadece "yüklenebilir" (installable) sayılmak ve kabuğun bir kopyasını tutmak.
const CACHE_ADI = 'seadata-kabuk-v1';
const KABUK_DOSYALARI = ['/', '/index.html', '/icon.png', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_ADI).then((cache) => cache.addAll(KABUK_DOSYALARI)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((isimler) =>
      Promise.all(isimler.filter((isim) => isim !== CACHE_ADI).map((isim) => caches.delete(isim)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // dış istekler (API, harita karoları) dokunulmuyor
  event.respondWith(
    caches.match(event.request).then((yanit) => yanit || fetch(event.request))
  );
});
