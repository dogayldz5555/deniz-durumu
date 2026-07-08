// İl/ilçe/SSS statik sayfalarını üretir. Elle çalıştırılır (Vercel build adımı DEĞİL):
//   node tools/generate-pages.js
// Tek doğruluk kaynağı js/app.js'teki MAVI_BAYRAK_PLAJLAR dizisidir — merkez/zoom ve plaj
// listeleri buradan türetilir, ayrıca bir koordinat kopyası tutulmaz.

const fs = require("fs");
const path = require("path");
const { ilceSayfasiUret, ilSayfasiUret, sssSayfasiUret, navHtmlUret } = require("./sayfa-sablonu");

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
    const { lat: ilLat, lon: ilLon, span: ilSpan } = bboxVeMerkez(ilTumPlajlar.length ? ilTumPlajlar : [{ lat: 39, lon: 35 }]);

    const ilceListe = il.ilceler.map((slug) => {
      const ic = ilceMap.get(slug);
      if (!ic) throw new Error(`yerler.json'da ilçe bulunamadı: ${slug}`);
      return ic;
    });

    if (!filtre || filtre.has(il.slug)) {
      const html = ilSayfasiUret({ il, ilceler: ilceListe, plajlar: ilPlajlar, halkPlajlar: ilHalkPlajlar, lat: ilLat, lon: ilLon, zoom: ilZoom(ilSpan), navHtml });
      yazDosya(`${il.slug}/index.html`, html);
    }

    for (const ic of ilceListe) {
      if (filtre && !filtre.has(il.slug) && !filtre.has(`${il.slug}/${ic.slug}`)) continue;
      const icPlajlar = plajlar.filter((p) => p.il === il.ad && p.ilce === ic.ad);
      const icHalkPlajlar = halkPlajlar.filter((p) => p.il === il.ad && p.ilce === ic.ad);
      const icTumPlajlar = tumPlajlar.filter((p) => p.il === il.ad && p.ilce === ic.ad);
      if (!icTumPlajlar.length) {
        console.warn(`UYARI: ${il.ad}/${ic.ad} için MAVI_BAYRAK_PLAJLAR/HALK_PLAJLARI'nda eşleşen plaj yok`);
      }
      const { lat, lon, span } = bboxVeMerkez(icTumPlajlar.length ? icTumPlajlar : [{ lat: ilLat, lon: ilLon }]);
      const html = ilceSayfasiUret({ ilce: ic, il, plajlar: icPlajlar, halkPlajlar: icHalkPlajlar, lat, lon, zoom: ilceZoom(span), navHtml });
      yazDosya(`${il.slug}/${ic.slug}/index.html`, html);
    }
  }

  if (!filtre || filtre.has("sss")) {
    yazDosya("sss/index.html", sssSayfasiUret({ sorular: sss.sorular, navHtml }));
  }

  // Nav ve sitemap her zaman TÜM il/ilçe listesine göre güncellenir (filtreden bağımsız),
  // aksi halde kısmi/pilot üretimde nav eksik ilçeler gösterirdi.
  navBlokunuIndexHtmlaYaz(navHtml);
  sitemapUret(yerler.iller);
}

main();
