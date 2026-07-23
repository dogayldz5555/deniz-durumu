// İl/ilçe/SSS statik sayfalarını üretir. Elle çalıştırılır (Vercel build adımı DEĞİL):
//   node tools/generate-pages.js
// Tek doğruluk kaynağı js/app.js'teki MAVI_BAYRAK_PLAJLAR dizisidir — merkez/zoom ve plaj
// listeleri buradan türetilir, ayrıca bir koordinat kopyası tutulmaz.

const fs = require("fs");
const path = require("path");
const { ilceSayfasiUret, ilSayfasiUret, sssSayfasiUret, hakkimizdaSayfasiUret, denizGuvenligiSayfasiUret, maviBayrakSayfasiUret, veriRehberiSayfasiUret, iletisimSayfasiUret, ruzgarSporlariSayfasiUret, maviBayrakSiralamasiSayfasiUret, navHtmlUret } = require("./sayfa-sablonu");

const KOK = path.join(__dirname, "..");

function maviBayrakPlajlariOku() {
  const appJs = fs.readFileSync(path.join(KOK, "js/app.js"), "utf8");
  const m = appJs.match(/const MAVI_BAYRAK_PLAJLAR = (\[[\s\S]*?\n\]);/);
  if (!m) throw new Error("MAVI_BAYRAK_PLAJLAR js/app.js içinde bulunamadı");
  return new Function(`return ${m[1]};`)();
}

// Mavi Bayrak sertifikası OLMAYAN ama gerçek halka açık plajlar/sahiller — bkz. js/app.js'teki
// HALK_PLAJLARI tanımı. Sayfalarda AYRI bir başlık altında (yanlış sertifika iddiası olmadan)
// listelenir, ama ilçe/il harita merkezi hesabına mavi bayraklı plajlarla birlikte katılır.
function halkPlajlariOku() {
  const appJs = fs.readFileSync(path.join(KOK, "js/app.js"), "utf8");
  const m = appJs.match(/const HALK_PLAJLARI = (\[[\s\S]*?\n\]);/);
  if (!m) throw new Error("HALK_PLAJLARI js/app.js içinde bulunamadı");
  return new Function(`return ${m[1]};`)();
}

function bboxVeMerkez(plajlar) {
  const lats = plajlar.map((p) => p.lat);
  const lons = plajlar.map((p) => p.lon);
  const latMin = Math.min(...lats), latMax = Math.max(...lats);
  const lonMin = Math.min(...lons), lonMax = Math.max(...lons);
  return {
    lat: (latMin + latMax) / 2,
    lon: (lonMin + lonMax) / 2,
    span: Math.max(latMax - latMin, lonMax - lonMin),
  };
}

function ilceZoom(span) {
  if (span < 0.03) return 15;
  if (span < 0.08) return 14;
  if (span < 0.2) return 13;
  if (span < 0.4) return 12;
  return 11;
}

function ilZoom(span) {
  if (span < 0.5) return 10;
  if (span < 1.0) return 9;
  if (span < 2.0) return 8;
  return 7;
}

// Her ilin baskın denizi — js/app.js'teki DENIZ_BOLGELERI kutularına göre, o ilin TÜM
// plajlarının (MAVI_BAYRAK_PLAJLAR + HALK_PLAJLARI) çoğunluğunun düştüğü bölge hesaplanarak
// 2026-07-20'de üretildi (bkz. proje notları). Sadece ince bir görsel kimlik (bkz.
// tools/sayfa-sablonu.js bolgeRozetiHtml, css/app.css [data-bolge=...]) için kullanılıyor —
// gerçek dalga/rüzgar eşiği hesabı buna değil, doğrudan js/app.js'teki denizBolgesi()'ne
// dayanır. Yeni il eklenirse ya da bir ilin plaj dağılımı büyük ölçüde değişirse yeniden
// hesaplanmalı (aşağıdaki mantık ilBolgesiHesapla ile tekrarlanabilir).
const IL_BOLGE_HARITASI = {
  samsun: "karadeniz", zonguldak: "karadeniz", bartin: "karadeniz", kastamonu: "karadeniz",
  sinop: "karadeniz", ordu: "karadeniz", giresun: "karadeniz", trabzon: "karadeniz",
  rize: "karadeniz", artvin: "karadeniz", sakarya: "karadeniz", duzce: "karadeniz",
  kirklareli: "karadeniz",
  istanbul: "marmara", kocaeli: "marmara", yalova: "marmara", bursa: "marmara", tekirdag: "marmara",
  izmir: "ege", aydin: "ege", mugla: "ege", balikesir: "ege", canakkale: "ege",
  antalya: "akdeniz", mersin: "akdeniz", adana: "akdeniz", hatay: "akdeniz",
};

function yazDosya(relPath, icerik) {
  const tamYol = path.join(KOK, relPath);
  fs.mkdirSync(path.dirname(tamYol), { recursive: true });
  fs.writeFileSync(tamYol, icerik);
  console.log("yazildi:", relPath);
}

function navBlokunuIndexHtmlaYaz(navHtml) {
  const indexPath = path.join(KOK, "index.html");
  const icerik = fs.readFileSync(indexPath, "utf8");
  const yeni = icerik.replace(
    /<!-- NAV:START -->[\s\S]*?<!-- NAV:END -->/,
    `<!-- NAV:START -->\n${navHtml}\n<!-- NAV:END -->`
  );
  if (yeni === icerik && !icerik.includes("<!-- NAV:START -->")) {
    throw new Error("index.html içinde NAV:START/NAV:END işaretleri bulunamadı");
  }
  fs.writeFileSync(indexPath, yeni);
  console.log("guncellendi: index.html (nav)");
}

function sitemapUret(ilListesi) {
  // lastmod KASITLI OLARAK yok — her generate-pages.js çalıştırmasında "bugün" yazan bir
  // lastmod, Google'a sayfanın sürekli az önce değiştiği sinyalini verip arama sonuçlarında
  // "X saat önce" etiketi çıkmasına yol açıyordu (bkz. kullanıcı geri bildirimi 2026-07-06).
  // lastmod sitemap'te zorunlu değil, içerik gerçekten değişmedikçe eklenmemeli.
  const urls = [
    { loc: "https://www.seadatawave.com/", priority: "1.0" },
    { loc: "https://www.seadatawave.com/sss/", priority: "0.5" },
    { loc: "https://www.seadatawave.com/hakkimizda/", priority: "0.5" },
    { loc: "https://www.seadatawave.com/deniz-guvenligi-rehberi/", priority: "0.5" },
    { loc: "https://www.seadatawave.com/mavi-bayrak-nedir/", priority: "0.5" },
    { loc: "https://www.seadatawave.com/ruzgar-dalga-verisi-rehberi/", priority: "0.5" },
    { loc: "https://www.seadatawave.com/iletisim/", priority: "0.4" },
    { loc: "https://www.seadatawave.com/ruzgar-sporlari-noktalari/", priority: "0.5" },
    { loc: "https://www.seadatawave.com/mavi-bayrakli-plaj-siralamasi/", priority: "0.5" },
  ];
  for (const il of ilListesi) {
    urls.push({ loc: `https://www.seadatawave.com/${il.slug}/`, priority: "0.8" });
    for (const icSlug of il.ilceler) {
      urls.push({ loc: `https://www.seadatawave.com/${il.slug}/${icSlug}/`, priority: "0.7" });
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(KOK, "sitemap.xml"), xml);
  console.log("guncellendi: sitemap.xml");
}

function main() {
  const sadeceBunlar = process.argv.slice(2); // örn. node generate-pages.js samsun izmir/cesme
  const filtre = sadeceBunlar.length > 0 ? new Set(sadeceBunlar) : null;

  const plajlar = maviBayrakPlajlariOku();
  const halkPlajlar = halkPlajlariOku();
  const tumPlajlar = plajlar.concat(halkPlajlar); // sadece harita merkezi/zoom hesabı için
  const yerler = JSON.parse(fs.readFileSync(path.join(KOK, "data/yerler.json"), "utf8"));
  const sss = JSON.parse(fs.readFileSync(path.join(KOK, "data/sss.json"), "utf8"));
  const navHtml = navHtmlUret(yerler);

  const ilceMap = new Map(yerler.ilceler.map((ic) => [ic.slug, ic]));

  for (const il of yerler.iller) {
    const ilPlajlar = plajlar.filter((p) => p.il === il.ad);
    const ilHalkPlajlar = halkPlajlar.filter((p) => p.il === il.ad);
    const ilTumPlajlar = tumPlajlar.filter((p) => p.il === il.ad);
    // Plaj verisi henüz eklenmemiş iller/ilçeler için yerler.json'da elle tanımlı
    // "merkez" (lat/lon/zoom) kullanılır — bu, plaj listeleri sonradan eklenene kadar
    // (bkz. proje notları) sayfanın doğru bölgeye odaklanmış açılmasını sağlar.
    let ilLat, ilLon, ilSpan, ilZoomDeger;
    if (ilTumPlajlar.length) {
      ({ lat: ilLat, lon: ilLon, span: ilSpan } = bboxVeMerkez(ilTumPlajlar));
      ilZoomDeger = ilZoom(ilSpan);
    } else if (il.merkez) {
      ilLat = il.merkez.lat; ilLon = il.merkez.lon; ilZoomDeger = il.merkez.zoom || 8;
    } else {
      console.warn(`UYARI: ${il.ad} için ne plaj verisi ne de merkez tanımlı`);
      ({ lat: ilLat, lon: ilLon, span: ilSpan } = bboxVeMerkez([{ lat: 39, lon: 35 }]));
      ilZoomDeger = ilZoom(ilSpan);
    }

    const ilceListe = il.ilceler.map((slug) => {
      const ic = ilceMap.get(slug);
      if (!ic) throw new Error(`yerler.json'da ilçe bulunamadı: ${slug}`);
      return ic;
    });

    const ilBolge = IL_BOLGE_HARITASI[il.slug] || null;

    if (!filtre || filtre.has(il.slug)) {
      const html = ilSayfasiUret({ il, ilceler: ilceListe, plajlar: ilPlajlar, halkPlajlar: ilHalkPlajlar, lat: ilLat, lon: ilLon, zoom: ilZoomDeger, navHtml, bolge: ilBolge });
      yazDosya(`${il.slug}/index.html`, html);
    }

    for (const ic of ilceListe) {
      if (filtre && !filtre.has(il.slug) && !filtre.has(`${il.slug}/${ic.slug}`)) continue;
      const icPlajlar = plajlar.filter((p) => p.il === il.ad && p.ilce === ic.ad);
      const icHalkPlajlar = halkPlajlar.filter((p) => p.il === il.ad && p.ilce === ic.ad);
      const icTumPlajlar = tumPlajlar.filter((p) => p.il === il.ad && p.ilce === ic.ad);
      let lat, lon, span, zoomDeger;
      if (icTumPlajlar.length) {
        ({ lat, lon, span } = bboxVeMerkez(icTumPlajlar));
        zoomDeger = ilceZoom(span);
      } else if (ic.merkez) {
        lat = ic.merkez.lat; lon = ic.merkez.lon; zoomDeger = ic.merkez.zoom || 13;
      } else {
        console.warn(`UYARI: ${il.ad}/${ic.ad} için ne plaj verisi ne de merkez tanımlı`);
        lat = ilLat; lon = ilLon; zoomDeger = 11;
      }
      const html = ilceSayfasiUret({ ilce: ic, il, plajlar: icPlajlar, halkPlajlar: icHalkPlajlar, lat, lon, zoom: zoomDeger, navHtml, bolge: ilBolge });
      yazDosya(`${il.slug}/${ic.slug}/index.html`, html);
    }
  }

  if (!filtre || filtre.has("sss")) {
    yazDosya("sss/index.html", sssSayfasiUret({ sorular: sss.sorular, navHtml }));
  }

  if (!filtre || filtre.has("hakkimizda")) {
    yazDosya("hakkimizda/index.html", hakkimizdaSayfasiUret({ navHtml }));
  }

  if (!filtre || filtre.has("deniz-guvenligi-rehberi")) {
    yazDosya("deniz-guvenligi-rehberi/index.html", denizGuvenligiSayfasiUret({ navHtml }));
  }

  if (!filtre || filtre.has("mavi-bayrak-nedir")) {
    yazDosya("mavi-bayrak-nedir/index.html", maviBayrakSayfasiUret({ navHtml }));
  }

  if (!filtre || filtre.has("ruzgar-dalga-verisi-rehberi")) {
    yazDosya("ruzgar-dalga-verisi-rehberi/index.html", veriRehberiSayfasiUret({ navHtml }));
  }

  if (!filtre || filtre.has("iletisim")) {
    yazDosya("iletisim/index.html", iletisimSayfasiUret({ navHtml }));
  }

  if (!filtre || filtre.has("ruzgar-sporlari-noktalari")) {
    yazDosya("ruzgar-sporlari-noktalari/index.html", ruzgarSporlariSayfasiUret({ navHtml }));
  }

  if (!filtre || filtre.has("mavi-bayrakli-plaj-siralamasi")) {
    const ilSayimi = {};
    plajlar.forEach((p) => { ilSayimi[p.il] = (ilSayimi[p.il] || 0) + 1; });
    const siralama = Object.entries(ilSayimi).sort((a, b) => b[1] - a[1]);
    yazDosya("mavi-bayrakli-plaj-siralamasi/index.html", maviBayrakSiralamasiSayfasiUret({ navHtml, siralama, toplamPlaj: plajlar.length, toplamIl: siralama.length }));
  }

  // Nav ve sitemap her zaman TÜM il/ilçe listesine göre güncellenir (filtreden bağımsız),
  // aksi halde kısmi/pilot üretimde nav eksik ilçeler gösterirdi.
  navBlokunuIndexHtmlaYaz(navHtml);
  sitemapUret(yerler.iller);
}

main();
