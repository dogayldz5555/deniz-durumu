// PWA ("Ana ekrana ekle") kurulabilir olması için Chrome'un istediği minimum service worker.
// SADECE sitenin kendi kabuğunu (bu birkaç dosya) önbellekliyoruz — hava/dalga verisi,
// harita karoları, Supabase gibi dış isteklere HİÇ dokunulmuyor, onlar zaten her zaman
// doğrudan ağdan gidiyor (aşağıdaki fetch işleyicisi origin kontrolüyle bunları atlıyor).
//
// ÖNEMLİ: kabuk dosyaları İÇİN de ÖNCELİK AĞDA (network-first) — bu site sık sık
// güncelleniyor (yeni özellik/düzeltme neredeyse her gün deploy oluyor), "önce önbellek"
// stratejisi kullanılsaydı telefonuna ekleyen bir kullanıcı GÜNCELLEMELERİ HİÇ GÖRMEZDİ
// (ör. gün içi tema değişikliği: eski, cache'lenmiş bir index.html'de bu özellik hiç
// olmayabilir). Önbellek SADECE ağ gerçekten ulaşılamazsa (çevrimdışı) devreye giriyor.
const CACHE_ADI = 'seadata-kabuk-v2';
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
    fetch(event.request)
      .then((agYaniti) => {
        const kopya = agYaniti.clone();
        caches.open(CACHE_ADI).then((cache) => cache.put(event.request, kopya)).catch(() => {});
        return agYaniti;
      })
      .catch(() => caches.match(event.request))
  );
});
