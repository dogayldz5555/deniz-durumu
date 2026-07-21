// İl/ilçe/SSS sayfaları için HTML üreten şablon fonksiyonları.
// generate-pages.js tarafından çağrılır. Üretilen il/ilçe sayfaları, index.html'in
// #app-wrap iskeletinin (harita, durum kartı, yorumlar vb.) BİREBİR AYNISINI içerir —
// app.js'in varsaymadığı bir DOM parçası eksik kalırsa script tamamen durur (bkz. plan).

const NAV_OK_SVG = `<svg class="nav-il-ok" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;

// Her ilin baskın denizine göre ince bir görsel kimlik (bkz. css/app.css [data-bolge=...]
// kuralları) — sadece bir renk vurgusu ve küçük bir rozet, marka renklerini (lacivert/altın)
// DEĞİŞTİRMİYOR, üstüne ince bir aksan katıyor. generate-pages.js ilin plaj koordinatlarını
// js/app.js'teki DENIZ_BOLGELERI kutularıyla eşleştirip bu id'lerden birini üretiyor.
const BOLGE_ETIKET = {
  karadeniz: { ad: "Karadeniz kıyısı", adEn: "Black Sea coast" },
  marmara: { ad: "Marmara kıyısı", adEn: "Marmara coast" },
  ege: { ad: "Ege kıyısı", adEn: "Aegean coast" },
  akdeniz: { ad: "Akdeniz kıyısı", adEn: "Mediterranean coast" },
};
function bolgeRozetiHtml(bolge) {
  if (!bolge || !BOLGE_ETIKET[bolge]) return "";
  const e = BOLGE_ETIKET[bolge];
  return `<span class="yer-bolge-rozet"><span class="tr-metin">${e.ad}</span><span class="en-metin">${e.adEn}</span></span>`;
}

const BOLGE_KISA_AD = {
  karadeniz: { ad: "Karadeniz", adEn: "Black Sea" },
  marmara: { ad: "Marmara", adEn: "Sea of Marmara" },
  ege: { ad: "Ege", adEn: "Aegean" },
  akdeniz: { ad: "Akdeniz", adEn: "Mediterranean" },
};

// İl sayfasının en üstündeki 3 istatistik "fiş"i (ilçe sayısı, plaj sayısı, deniz) — sadece
// süs değil, sayfanın kendi gerçek verisinden (plajlar.length, ilceler.length) türetiliyor;
// il sayfasının şablon bir girişten daha fazlası olduğunu ilk bakışta gösteriyor.
function ilHizliBakisHtml({ ilceSayisi, plajSayisi, bolge }) {
  const bolgeKisa = bolge && BOLGE_KISA_AD[bolge] ? BOLGE_KISA_AD[bolge] : null;
  const fis = (sayiHtml, tr, en) => `<div class="yer-stat">
      <span class="yer-stat-sayi">${sayiHtml}</span>
      <span class="yer-stat-etiket"><span class="tr-metin">${tr}</span><span class="en-metin">${en}</span></span>
    </div>`;
  return `<div class="yer-hizli-bakis">
    ${fis(ilceSayisi, "kıyı ilçesi", ilceSayisi === 1 ? "coastal district" : "coastal districts")}
    ${fis(plajSayisi, plajSayisi === 1 ? "plaj" : "plaj", "beaches")}
    ${bolgeKisa ? fis(`<span class="tr-metin">${bolgeKisa.ad}</span><span class="en-metin">${bolgeKisa.adEn}</span>`, "deniz", "sea") : ""}
  </div>`;
}

// Üst menüyü (Anasayfa / İller açılır menüsü / Veriler / Yorumlar / Hakkımızda / SSS) tüm
// il/ilçe/anasayfa/SSS listesinden TEK SEFERDE üretir — bu yüzden sabit bir string DEĞİL,
// yerler.json verisini alan bir fonksiyon: her yeni il/ilçe eklendiğinde "İller" açılır
// menüsü otomatik güncellenir, elle senkronize edilmesi gereken ikinci bir liste olmaz.
// İçindeki tüm linkler GERÇEK <a href> etiketleri (JS'siz de tarayıcı/crawler tarafından
// görülebilir). Aç/kapa (accordion) davranışı için ÖZEL JS YAZILMADI — native <details>/
// <summary> kullanılıyor: her tarayıcıda JS'siz çalışır, klavyeyle erişilebilir, ve SSS
// sayfası gibi app.js'i hiç yüklemeyen (haritasız) sayfalarda bile sorunsuz çalışır.
function navHtmlUret(yerler) {
  const ilGruplari = yerler.iller.map((il) => {
    const ilceLinkleri = il.ilceler
      .map((slug) => {
        const ic = yerler.ilceler.find((x) => x.slug === slug && x.ilSlug === il.slug);
        return ic ? `<a href="/${il.slug}/${ic.slug}/">${escapeHtml(ic.ad)}</a>` : "";
      })
      .join("\n          ");
    return `<details class="nav-il-grup">
        <summary class="nav-il-baslik">${escapeHtml(il.ad)} ${NAV_OK_SVG}</summary>
        <div class="nav-ilce-liste">
          <a href="/${il.slug}/"><span class="tr-metin">Tüm ${escapeHtml(il.ad)}</span><span class="en-metin">All ${escapeHtml(il.ad)}</span></a>
          ${ilceLinkleri}
        </div>
      </details>`;
  }).join("\n      ");

  return `<nav class="site-nav" id="site-nav">
  <a href="/" data-i18n="nav_anasayfa">Anasayfa</a>
  <details class="nav-iller" id="nav-iller">
    <summary class="nav-iller-btn"><span data-i18n="nav_iller">İller</span> ${NAV_OK_SVG}</summary>
    <div class="nav-iller-menu">
      ${ilGruplari}
    </div>
  </details>
  <a href="#status-card" class="nav-kart-link" data-i18n="nav_veriler">Veriler</a>
  <a href="#site-yorumlar-bolum" class="nav-kart-link" data-i18n="nav_yorumlar">Yorumlar</a>
  <a href="/hakkimizda/" data-i18n="nav_hakkimizda">Hakkımızda</a>
  <a href="/deniz-guvenligi-rehberi/" data-i18n="nav_guvenlik">Deniz Güvenliği</a>
  <a href="/mavi-bayrak-nedir/" data-i18n="nav_mavi_bayrak">Mavi Bayrak Nedir?</a>
  <a href="/ruzgar-dalga-verisi-rehberi/" data-i18n="nav_veri_rehberi">Veri Okuma Rehberi</a>
  <a href="/sss/" data-i18n="nav_sss">Sıkça Sorulan Sorular</a>
  <a href="/iletisim/" data-i18n="nav_iletisim">İletişim</a>
</nav>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Plaj adı(nda) (p.adEn) doluysa iki dilde de gösterilir (bkz. css/app.css'teki
// tr-metin/en-metin CSS-toggle mekanizması); doldurulmamışsa (eski kayıtlarda olabilir)
// güvenli şekilde sadece Türkçe adı gösterilir.
function plajAdiHtml(p) {
  if (p.adEn && p.adEn !== p.ad) {
    return `<span class="tr-metin">${escapeHtml(p.ad)}</span><span class="en-metin">${escapeHtml(p.adEn)}</span>`;
  }
  return escapeHtml(p.ad);
}

function plajListesiHtml(plajlar, halkPlajlar) {
  const maviBayrakBlok = plajlar.length
    ? `<div class="yer-plajlar">
      <h2 data-i18n="yer_mavi_bayrakli_baslik">Mavi Bayraklı Plajlar</h2>
      <ul class="yer-plaj-listesi">
      ${plajlar.map((p) => `<li>${plajAdiHtml(p)}</li>`).join("\n      ")}
      </ul>
    </div>`
    : "";
  // Halka açık ama TÜRÇEV sertifikası OLMAYAN plajlar — ayrı, dürüst bir başlık altında;
  // Mavi Bayraklı Plajlar listesiyle karıştırılmasın diye kesinlikle birleştirilmiyor.
  const halkPlajBlok = halkPlajlar && halkPlajlar.length
    ? `<div class="yer-plajlar">
      <h2 data-i18n="yer_halka_acik_baslik">Halka Açık Plajlar</h2>
      <ul class="yer-plaj-listesi">
      ${halkPlajlar.map((p) => `<li>${plajAdiHtml(p)}</li>`).join("\n      ")}
      </ul>
    </div>`
    : "";
  return maviBayrakBlok + halkPlajBlok;
}

// Her mini-SSS maddesinin soru/cevabı yer başına özgü olduğu için (js/app.js'teki paylaşılan
// CEVIRI sözlüğüne taşınamaz) TR+EN ikisi de gömülüyor, CSS ile seçiliyor. EN metni henüz
// yazılmamışsa (soruEn yoksa) sadece TR gösterilir — sayfa hiç kırılmaz, sadece o madde
// İngilizce modda da Türkçe kalır.
function miniSssHtml(miniSss) {
  if (!miniSss || !miniSss.length) return "";
  const maddeler = miniSss
    .map((s) => {
      if (s.soruEn && s.cevapEn) {
        return `<div class="sss-madde">
      <h3><span class="tr-metin">${escapeHtml(s.soru)}</span><span class="en-metin">${escapeHtml(s.soruEn)}</span></h3>
      <p><span class="tr-metin">${s.cevap}</span><span class="en-metin">${s.cevapEn}</span></p>
    </div>`;
      }
      return `<div class="sss-madde">
      <h3>${escapeHtml(s.soru)}</h3>
      <p>${s.cevap}</p>
    </div>`;
    })
    .join("\n    ");
  return `<div class="sss-bolum">
    <h2 data-i18n="sss_git_baslik">Sıkça sorulan sorular</h2>
    ${maddeler}
    <p class="sss-daha-fazla"><a href="/sss/" data-i18n="yer_daha_fazla_soru">Daha fazla soru için Sıkça Sorulan Sorular sayfasına bakın →</a></p>
  </div>`;
}

// Ortak <head> + #app-wrap iskeletini üreten fonksiyon. `ustSectionHtml` .sub tagline'ından
// hemen sonra, `altSectionHtml` #conflict-note'tan hemen sonra (plaj listesi + mini SSS +
// geri dönüş linki gibi bölümler için) enjekte edilir.
function sayfaIskeleti({ title, titleEn, metaAciklama, metaAciklamaEn, canonicalUrl, sayfaKonum, ustSectionHtml, altSectionHtml, navHtml, bolge }) {
  // SAYFA_KONUM'a başlık/açıklamanın İngilizce halini de gömüyoruz ki dilUygula() dil
  // değişince <title>/meta description'ı da (sadece homepage'de değil, bu sayfalarda da)
  // güncelleyebilsin — EN metni henüz yazılmamışsa (baslikEn/metaAciklamaEn null) JS zaten
  // TR'de kalır, sayfa kırılmaz.
  const sayfaKonumJs = sayfaKonum
    ? `<script>window.SAYFA_KONUM = ${JSON.stringify({ ...sayfaKonum, baslik: title, baslikEn: titleEn || null, metaAciklama, metaAciklamaEn: metaAciklamaEn || null })};</script>\n`
    : "";
  // Konum meta etiketleri + JSON-LD "about: Place" — arama motorlarının bu sayfayı belirli
  // bir il/ilçeye ait olarak anlaması için (kullanıcı "deniz durumu" diye aratınca bulunduğu
  // bölgeye en yakın/ilgili sayfanın öne çıkma ihtimalini artırır). Sadece il/ilçe sayfalarında
  // (sayfaKonum doluysa) eklenir — SSS/Hakkımızda gibi konuma bağlı olmayan sayfalarda yok.
  const geoHtml = sayfaKonum
    ? `<meta name="geo.placename" content="${escapeHtml(sayfaKonum.ilce ? `${sayfaKonum.ilce}, ${sayfaKonum.il}` : sayfaKonum.il)}" />
<meta name="geo.position" content="${sayfaKonum.lat};${sayfaKonum.lon}" />
<meta name="ICBM" content="${sayfaKonum.lat}, ${sayfaKonum.lon}" />
`
    : "";
  const jsonLdAbout = sayfaKonum
    ? `, "about": { "@type": "Place", "name": ${JSON.stringify(sayfaKonum.ilce ? `${sayfaKonum.ilce}, ${sayfaKonum.il}` : sayfaKonum.il)}, "geo": { "@type": "GeoCoordinates", "latitude": ${sayfaKonum.lat}, "longitude": ${sayfaKonum.lon} } }`
    : "";
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4137511669971685" crossorigin="anonymous"></script>
<title id="sayfa-baslik">${escapeHtml(title)}</title>
<meta id="meta-aciklama" name="description" content="${escapeHtml(metaAciklama)}" />
<meta id="og-baslik" property="og:title" content="${escapeHtml(title)}" />
<meta id="og-aciklama" property="og:description" content="${escapeHtml(metaAciklama)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="SeaDataWave" />
<meta property="og:url" content="${canonicalUrl}" />
<meta property="og:image" content="https://www.seadatawave.com/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(metaAciklama)}" />
<meta name="twitter:image" content="https://www.seadatawave.com/og-image.png" />
<link rel="canonical" href="${canonicalUrl}" />
${geoHtml}<link rel="manifest" href="/manifest.json" />
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" href="/icon.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "WebPage", "name": ${JSON.stringify(title)}, "url": ${JSON.stringify(canonicalUrl)}, "isPartOf": { "@id": "https://www.seadatawave.com/#website" }, "publisher": { "@id": "https://www.seadatawave.com/#organization" }${jsonLdAbout} }
</script>
<meta name="theme-color" content="#2A7FB8" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="SeaDataWave" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="preconnect" href="https://api.open-meteo.com">
<link rel="preconnect" href="https://marine-api.open-meteo.com">
<link rel="preconnect" href="https://conejfwwcwjtvvzzdqad.supabase.co">
<link rel="preconnect" href="https://cdnjs.cloudflare.com">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="/css/app.css" />
${sayfaKonumJs}<script>
// Sayfa hiç boyanmadan (render olmadan) önce çalışır, böylece gündüz/gece geçişinde
// kısa bir "yanlış renkte açılıp sonra değişme" flaşı olmaz.
(function() {
  var saat = new Date().getHours();
  var tema = "sabah";
  if (saat >= 22 || saat < 5) tema = "gece";
  else if (saat >= 16) tema = "aksam";
  else if (saat >= 12) tema = "oglen";
  document.documentElement.setAttribute('data-tema-hazirlik', tema);
})();
</script>
</head>
<body${bolge ? ` data-bolge="${bolge}"` : ""}>
<header class="site-header">
  <div class="brand">
    <img class="brand-mark" src="/icon.png" alt="SeaDataWave logosu" />
    <div class="brand-yazi">
      <h1>SeaDataWave</h1>
      <p class="brand-alt" data-i18n="brand_alt">Anlık Deniz Verileri</p>
    </div>
  </div>
  <!-- NAV:START -->
  ${navHtml}
  <!-- NAV:END -->
  <div class="yer-arama" id="yer-arama">
    <svg class="yer-arama-ikon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <input type="text" id="yer-arama-input" autocomplete="off" data-i18n-placeholder="yer_arama_placeholder" placeholder="Ara" />
    <ul id="yer-arama-sonuclar" class="yer-arama-sonuclar" style="display:none;"></ul>
  </div>
  <div class="dil-secici" id="dil-secici">
    <button type="button" class="dil-btn" data-dil="tr" id="dil-btn-tr">TR</button>
    <button type="button" class="dil-btn" data-dil="en" id="dil-btn-en">EN</button>
  </div>
</header>

<div id="app-wrap">
<div class="hero-grid">
  <div class="hero-metin">
    <p class="sub" data-i18n="sub_tagline">Haritada bir noktaya tıkla, o bölgenin rüzgar ve dalga durumunu gör.</p>

    ${ustSectionHtml}

    <div class="legend">
      <span><span class="dot" style="background:#1D7FC2"></span><span data-i18n="durum_carsaf">Çok iyi</span></span>
      <span><span class="dot" style="background:#1FA35C"></span><span data-i18n="durum_hafif">İyi</span></span>
      <span><span class="dot" style="background:#E07B1E"></span><span data-i18n="durum_fazla">Orta</span></span>
      <span><span class="dot" style="background:#D9362E"></span><span data-i18n="durum_tehlikeli">Fazla dalga</span></span>
    </div>
  </div>

  <div class="harita-panel-wrap">
    <button class="locate-btn locate-btn-overlay" id="locate-btn" type="button">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
      <span id="locate-btn-text" data-i18n="konumum">Konumum</span>
    </button>
    <div id="map"></div>
    <button id="tam-ekran-veri-kapat" class="tam-ekran-kapat-btn" type="button" data-i18n-aria="veri_paneli_kapat" aria-label="Veri panelini kapat">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
    <div id="tam-ekran-yorumlar-wrap" class="tam-ekran-yorumlar-wrap" style="display:none;">
      <button type="button" id="tam-ekran-yorumlar-tab" class="tam-ekran-yorumlar-tab" data-i18n-aria="tam_ekran_yorumlar_baslik" aria-label="Yorum yap / gör">
        <span class="tam-ekran-yorumlar-tab-etiket" data-i18n="tam_ekran_yorumlar_etiket">Yorumlar</span>
        <svg class="tam-ekran-yorumlar-tab-ok" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>
      </button>
      <div id="tam-ekran-yorumlar-kart" class="tam-ekran-yorumlar-kart" style="display:none;">
        <p class="tam-ekran-yorumlar-baslik" data-i18n="tam_ekran_yorumlar_baslik">Yorum yap / gör</p>
        <div id="tek-panel-isim-row" class="tek-panel-isim-row" style="display:none;">
          <input type="text" id="tek-panel-isim" data-i18n-placeholder="isim_placeholder" placeholder="İsim / rumuz" maxlength="24" />
        </div>
        <div class="tek-panel-not-row">
          <input type="text" id="tek-panel-not" data-i18n-placeholder="not_placeholder" placeholder="İsteğe bağlı not" />
        </div>
        <div class="tek-panel-durum-satir" id="tek-panel-durum-satir"></div>
        <div id="tek-panel-sonuc" class="tek-panel-sonuc" style="display:none;"></div>
        <div class="tek-panel-ayrac"></div>
        <div id="tam-ekran-yorumlar-liste"></div>
      </div>
    </div>
  </div>
</div>

<div id="app">
  <div class="isim-kart">
    <div class="isim-kart-ust">
      <span class="isim-kart-ikon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
      <div>
        <p class="isim-kart-baslik" data-i18n="isim_baslik">İsim / rumuzunu gir</p>
        <p class="isim-kart-alt" data-i18n="isim_alt">Bir kere yeter — hem deniz durumu yorumların hem site değerlendirmen bu isimle yapılır.</p>
      </div>
    </div>
    <div class="gb-name-row" id="gb-name-row">
      <input type="text" id="gb-isim" data-i18n-placeholder="isim_placeholder" placeholder="İsim / rumuz" maxlength="24" />
      <button type="button" id="gb-isim-kaydet-btn" data-i18n="isim_kaydet">Kaydet</button>
    </div>
    <div class="gb-name-saved" id="gb-name-saved" style="display:none;">
      <span id="gb-name-saved-text"></span>
      <button type="button" id="gb-name-degistir" data-i18n="isim_degistir">değiştir</button>
    </div>
  </div>

  <p class="section-label" id="our-label" style="display:none;" data-i18n="tahminimiz">Tahminimiz (rüzgar + dalga verisi)</p>
  <div class="card placeholder" id="status-card">
    <span data-i18n="harita_placeholder">Haritada bir noktaya tıkla.</span>
  </div>

  <div id="conflict-note" class="conflict-note" style="display:none;"></div>

  <p class="section-label" id="community-label" style="display:none;" data-i18n="sahadan_gelenler">Sahadan gelenler</p>
  <div id="community-summary-wrap" style="display:none;"></div>

  <div class="gb-section" id="gb-section" style="display:none;">
    <div class="gb-title" data-i18n="deniz_nasil_baslik">Şu an oradaysan deniz nasıl?</div>
    <p class="gb-alt" data-i18n="gb_alt">İstersen önce not veya fotoğraf ekle, sonra aşağıdan seç — seçince hemen gönderilir.</p>
    <div class="gb-input-row" id="gb-input-row">
      <input type="text" id="gb-note" data-i18n-placeholder="not_placeholder" placeholder="İsteğe bağlı not (örn. dip akıntısı var)" />
    </div>
    <div class="gb-foto-row" id="gb-foto-row">
      <label for="gb-foto-input" class="gb-foto-btn" id="gb-foto-btn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        <span data-i18n="foto_ekle">Fotoğraf ekle (opsiyonel)</span>
      </label>
      <input type="file" id="gb-foto-input" accept="image/*" style="display:none;" />
      <img id="gb-foto-onizleme" class="gb-foto-onizleme" style="display:none;" data-i18n-alt="foto_onizleme_alt" alt="Seçilen fotoğraf önizlemesi" />
      <button type="button" id="gb-foto-kaldir" class="gb-foto-kaldir" style="display:none;" data-i18n-aria="foto_kaldir" aria-label="Fotoğrafı kaldır">×</button>
      <span id="gb-foto-hata" style="display:none;font-size:11px;color:#993C1D;"></span>
    </div>
    <div class="gb-buttons">
      <button class="gb-btn" data-val="carsaf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="12" x2="21" y2="12"/></svg><span data-i18n="durum_carsaf">Çok iyi</span></button>
      <button class="gb-btn" data-val="hafif"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0"/></svg><span data-i18n="durum_hafif">İyi</span></button>
      <button class="gb-btn" data-val="fazla"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span data-i18n="durum_fazla">Orta</span></button>
      <button class="gb-btn" data-val="tehlikeli"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span data-i18n="durum_tehlikeli">Fazla dalga</span></button>
    </div>
    <div class="gb-sent" id="gb-sent" style="display:none;" data-i18n="bildirim_kaydedildi">Bildiriminiz kaydedildi, teşekkürler.</div>
  </div>

  ${altSectionHtml}

  <p class="footnote" data-i18n="footnote">Rüzgar ve dalga verisi Open-Meteo'dan alınır, anlık ve tahminidir. Geri bildirimler herkese açık şekilde paylaşılır ve aynı çevredeki herkes birbirinin yorumunu görebilir.</p>
</div>
</div>

<!-- Siteyi değerlendirme formu — en altta, tam genişlik -->
<div style="max-width:560px;margin:0 auto;padding:36px 20px 0;">
  <div class="site-feedback-card" style="margin-top:0;">
    <p class="site-feedback-title" data-i18n="site_feedback_baslik">Bu uygulamayı nasıl buldun?</p>
    <p class="site-feedback-sub" data-i18n="site_feedback_alt">Deniz durumuyla ilgili değil; sitenin kendisi hakkındaki görüşün. Haritada görünmez, yalnızca geliştirmemize katkı sağlar.</p>
    <div class="site-feedback-stars" id="site-feedback-stars">
      <button type="button" data-puan="1" aria-label="1 yıldız"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>
      <button type="button" data-puan="2" aria-label="2 yıldız"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>
      <button type="button" data-puan="3" aria-label="3 yıldız"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>
      <button type="button" data-puan="4" aria-label="4 yıldız"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>
      <button type="button" data-puan="5" aria-label="5 yıldız"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button>
    </div>
    <textarea id="site-feedback-mesaj" data-i18n-placeholder="site_feedback_mesaj_placeholder" placeholder="İsteğe bağlı: ne eksik, ne beğendin, ne değiştirilmeli?" rows="2"></textarea>
    <button type="button" id="site-feedback-gonder" class="site-feedback-btn" data-i18n="gonder">Gönder</button>
    <div id="site-feedback-sonuc" class="site-feedback-sonuc" style="display:none;"></div>
  </div>
</div>

<!-- Kullanıcı yorumları -->
<div id="site-yorumlar-bolum" style="max-width:1100px;margin:0 auto;padding:0 20px 48px;">
  <p class="site-yorumlar-baslik" data-i18n="site_yorumlar_baslik">Kullanıcı yorumları</p>
  <p class="site-yorumlar-alt" data-i18n="site_yorumlar_alt">Uygulamayı kullananların bıraktığı görüşler.</p>
  <div id="site-yorumlar-yuklen" data-i18n="yorumlar_yukleniyor">Yorumlar yükleniyor…</div>
  <div class="site-yorumlar-grid" id="site-yorumlar-grid" style="display:none;"></div>
</div>

<footer class="site-footer">
  <div class="footer-grid">
    <div>
      <div class="brand">
        <img class="brand-mark" src="/icon.png" alt="SeaDataWave logosu" />
        <div class="brand-yazi"><h1>SeaDataWave</h1><p class="brand-alt" data-i18n="brand_alt">Anlık Deniz Verileri</p></div>
      </div>
    </div>
    <div>
      <h4 data-i18n="footer_kesfet">Keşfet</h4>
      <a href="/samsun/">Samsun</a>
      <a href="/izmir/">İzmir</a>
      <a href="/mugla/">Muğla</a>
      <a href="/aydin/">Aydın</a>
      <a href="/antalya/">Antalya</a>
    </div>
    <div>
      <h4 data-i18n="footer_destek">Destek</h4>
      <a href="/sss/" data-i18n="nav_sss">Sıkça Sorulan Sorular</a>
      <a href="/deniz-guvenligi-rehberi/" data-i18n="nav_guvenlik">Deniz Güvenliği Rehberi</a>
      <a href="/mavi-bayrak-nedir/" data-i18n="nav_mavi_bayrak">Mavi Bayrak Nedir?</a>
      <a href="/ruzgar-dalga-verisi-rehberi/" data-i18n="nav_veri_rehberi">Veri Okuma Rehberi</a>
      <a href="/iletisim/" data-i18n="nav_iletisim">İletişim</a>
      <a href="/gizlilik-politikasi.html" data-i18n="gizlilik_politikasi_link">Gizlilik Politikası</a>
    </div>
  </div>
  <div class="footer-alt">© 2026 SeaDataWave</div>
</footer>

<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="/js/app.js"></script>
</body>
</html>
`;
}

// İki dilli paragraf/cümle üretir: EN metni varsa tr-metin/en-metin span'leriyle ikisini de
// gömer (CSS ile seçiliyor, bkz. css/app.css), yoksa (henüz çevrilmemiş eski kayıt) sadece
// TR gösterip sayfayı kırmaz.
function ikiDilliHtml(tag, trMetin, enMetin, klas) {
  const klasAttr = klas ? ` class="${klas}"` : "";
  if (enMetin) {
    return `<${tag}${klasAttr}><span class="tr-metin">${trMetin}</span><span class="en-metin">${enMetin}</span></${tag}>`;
  }
  return `<${tag}${klasAttr}>${trMetin}</${tag}>`;
}

function ilceSayfasiUret({ ilce, il, plajlar, halkPlajlar, lat, lon, zoom, navHtml, bolge }) {
  // {plajAdlari}/{plajSayisi} token'ları Mavi Bayraklı + halka açık plajları BİRLİKTE
  // yansıtır (sadece bir sertifika iddiası taşımayan, genel "plajları arasında" cümlesi için) —
  // aşağıdaki iki ayrı liste bölümü (plajListesiHtml) yine de sertifikalı/sertifikasız
  // ayrımını korur, burada sadece giriş metninin doğal okunması sağlanıyor.
  const tumPlajlar = plajlar.concat(halkPlajlar || []);
  const plajAdlari = tumPlajlar.map((p) => p.ad).join(", ") || "henüz eklenmemiş";
  const plajAdlariEn = tumPlajlar.map((p) => p.adEn || p.ad).join(", ") || "not added yet";
  const plajSayisi = tumPlajlar.length;
  const doldur = (s) => s.replace(/\{plajAdlari\}/g, plajAdlari).replace(/\{plajSayisi\}/g, String(plajSayisi));
  const doldurEn = (s) => s.replace(/\{plajAdlari\}/g, plajAdlariEn).replace(/\{plajSayisi\}/g, String(plajSayisi));

  const ustSectionHtml = `${ikiDilliHtml("h2", escapeHtml(ilce.baslik), ilce.baslikEn ? escapeHtml(ilce.baslikEn) : null, "yer-baslik")}
  <div class="yer-giris">
    ${bolgeRozetiHtml(bolge)}
    ${ikiDilliHtml("h3", `${escapeHtml(ilce.ad)} Hakkında`, `About ${escapeHtml(ilce.ad)}`)}
    ${ikiDilliHtml("p", doldur(ilce.girisMetni), ilce.girisMetniEn ? doldurEn(ilce.girisMetniEn) : null)}
  </div>`;

  const altSectionHtml = `${plajListesiHtml(plajlar, halkPlajlar)}
  ${miniSssHtml((ilce.miniSss || []).map((s) => ({ soru: s.soru, cevap: doldur(s.cevap), soruEn: s.soruEn, cevapEn: s.cevapEn ? doldurEn(s.cevapEn) : null })))}
  <p class="yer-donus"><a href="/${il.slug}/">${ikiDilliHtml("span", `← ${escapeHtml(il.ad)} deniz durumuna dön`, `← Back to ${escapeHtml(il.ad)} sea conditions`)}</a></p>`;

  const canonicalUrl = `https://www.seadatawave.com/${il.slug}/${ilce.slug}/`;

  return sayfaIskeleti({
    title: ilce.baslik,
    titleEn: ilce.baslikEn,
    metaAciklama: doldur(ilce.metaAciklama),
    metaAciklamaEn: ilce.metaAciklamaEn ? doldurEn(ilce.metaAciklamaEn) : null,
    canonicalUrl,
    sayfaKonum: { lat, lon, zoom, il: il.ad, ilce: ilce.ad },
    ustSectionHtml,
    altSectionHtml,
    navHtml,
    bolge,
  });
}

function ilSayfasiUret({ il, ilceler, plajlar, halkPlajlar, lat, lon, zoom, navHtml, bolge }) {
  const tumPlajSayisi = plajlar.length + (halkPlajlar ? halkPlajlar.length : 0);
  const ustSectionHtml = `${ikiDilliHtml("h2", escapeHtml(il.baslik), il.baslikEn ? escapeHtml(il.baslikEn) : null, "yer-baslik")}
  <div class="yer-giris">
    ${bolgeRozetiHtml(bolge)}
    ${ikiDilliHtml("h3", `${escapeHtml(il.ad)} Hakkında`, `About ${escapeHtml(il.ad)}`)}
    ${ikiDilliHtml("p", il.girisMetni, il.girisMetniEn || null)}
  </div>
  ${ilHizliBakisHtml({ ilceSayisi: ilceler.length, plajSayisi: tumPlajSayisi, bolge })}`;

  const ilceLinkleri = ilceler
    .map((ic) => `<li><a href="/${il.slug}/${ic.slug}/">${escapeHtml(ic.ad)}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></a></li>`)
    .join("\n      ");
  const ilceSectionHtml = `<div class="yer-ilceler">
    ${ikiDilliHtml("h2", `${escapeHtml(il.ad)}'nin kıyı ilçeleri`, `Coastal districts of ${escapeHtml(il.ad)}`)}
    <ul class="yer-ilceler-listesi">
      ${ilceLinkleri}
    </ul>
  </div>`;

  const altSectionHtml = `${plajListesiHtml(plajlar, halkPlajlar)}
  ${ilceSectionHtml}
  ${miniSssHtml(il.miniSss)}
  <p class="yer-donus"><a href="/" data-i18n="yer_donus_il">← Türkiye geneli deniz durumuna dön</a></p>`;

  const canonicalUrl = `https://www.seadatawave.com/${il.slug}/`;

  return sayfaIskeleti({
    title: il.baslik,
    titleEn: il.baslikEn,
    metaAciklama: il.metaAciklama,
    metaAciklamaEn: il.metaAciklamaEn || null,
    canonicalUrl,
    sayfaKonum: { lat, lon, zoom, il: il.ad, ilce: null },
    ustSectionHtml,
    altSectionHtml,
    navHtml,
    bolge,
  });
}

function sssSayfasiUret({ sorular, navHtml }) {
  const maddeler = sorular
    .map(
      (s) => `<div class="sss-madde">
      <h3>${escapeHtml(s.soru)}</h3>
      <p>${escapeHtml(s.cevap)}</p>
    </div>`
    )
    .join("\n    ");

  const jsonLd = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: sorular.map((s) => ({
        "@type": "Question",
        name: s.soru,
        acceptedAnswer: { "@type": "Answer", text: s.cevap },
      })),
    },
    null,
    2
  );

  const title = "Sıkça Sorulan Sorular — SeaDataWave";
  const metaAciklama = "SeaDataWave nasıl çalışır, Mavi Bayrak ne demek, veriler ne sıklıkla güncelleniyor? Sık sorulan sorular ve cevapları.";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(metaAciklama)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(metaAciklama)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="SeaDataWave" />
<meta property="og:url" content="https://www.seadatawave.com/sss/" />
<link rel="canonical" href="https://www.seadatawave.com/sss/" />
<link rel="manifest" href="/manifest.json" />
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" href="/icon.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="stylesheet" href="/css/app.css" />
<script type="application/ld+json">
${jsonLd}
</script>
</head>
<body>
<header class="site-header">
  <div class="brand">
    <img class="brand-mark" src="/icon.png" alt="SeaDataWave logosu" />
    <div class="brand-yazi">
      <h1>SeaDataWave</h1>
      <p class="brand-alt" data-i18n="brand_alt">Anlık Deniz Verileri</p>
    </div>
  </div>
  <!-- NAV:START -->
  ${navHtml}
  <!-- NAV:END -->
</header>
<div id="app-wrap">
<div id="app">
  <div class="sss-bolum" style="margin-top:8px;border-top:none;padding-top:0;">
    <h2 style="font-size:20px;">Sıkça Sorulan Sorular</h2>
    ${maddeler}
  </div>
  <p class="yer-donus"><a href="/">← Ana sayfaya dön</a></p>
</div>
</div>
<footer class="site-footer">
  <div class="footer-grid">
    <div>
      <div class="brand">
        <img class="brand-mark" src="/icon.png" alt="SeaDataWave logosu" />
        <div class="brand-yazi"><h1>SeaDataWave</h1><p class="brand-alt">Anlık Deniz Verileri</p></div>
      </div>
    </div>
    <div>
      <h4>Keşfet</h4>
      <a href="/samsun/">Samsun</a>
      <a href="/izmir/">İzmir</a>
      <a href="/mugla/">Muğla</a>
      <a href="/aydin/">Aydın</a>
      <a href="/antalya/">Antalya</a>
    </div>
    <div>
      <h4>Destek</h4>
      <a href="/sss/">Sıkça Sorulan Sorular</a>
      <a href="/deniz-guvenligi-rehberi/">Deniz Güvenliği Rehberi</a>
      <a href="/mavi-bayrak-nedir/">Mavi Bayrak Nedir?</a>
      <a href="/ruzgar-dalga-verisi-rehberi/">Veri Okuma Rehberi</a>
      <a href="/iletisim/">İletişim</a>
      <a href="/gizlilik-politikasi.html">Gizlilik Politikası</a>
    </div>
  </div>
  <div class="footer-alt">© 2026 SeaDataWave</div>
</footer>
</body>
</html>
`;
}

// Hakkımızda — anasayfadaki kısa panelin genişletilmiş hâli, ayrı bir sayfa olarak. SSS
// sayfasıyla aynı şekilde js/app.js YÜKLENMİYOR (harita/dil değiştirici yok) — bu yüzden
// TR-only, tıpkı sss/ ve gizlilik-politikasi.html gibi.
function hakkimizdaSayfasiUret({ navHtml }) {
  const title = "Hakkımızda — SeaDataWave";
  const metaAciklama = "SeaDataWave nedir, verileri nereden alıyor, kapsamı ne kadar geniş? Sitenin amacı ve çalışma şekli hakkında bilgi.";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(metaAciklama)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(metaAciklama)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="SeaDataWave" />
<meta property="og:url" content="https://www.seadatawave.com/hakkimizda/" />
<link rel="canonical" href="https://www.seadatawave.com/hakkimizda/" />
<link rel="manifest" href="/manifest.json" />
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" href="/icon.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="stylesheet" href="/css/app.css" />
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "AboutPage", "name": ${JSON.stringify(title)}, "url": "https://www.seadatawave.com/hakkimizda/", "isPartOf": { "@id": "https://www.seadatawave.com/#website" }, "publisher": { "@id": "https://www.seadatawave.com/#organization" } }
</script>
</head>
<body>
<header class="site-header">
  <div class="brand">
    <img class="brand-mark" src="/icon.png" alt="SeaDataWave logosu" />
    <div class="brand-yazi">
      <h1>SeaDataWave</h1>
      <p class="brand-alt">Anlık Deniz Verileri</p>
    </div>
  </div>
  <!-- NAV:START -->
  ${navHtml}
  <!-- NAV:END -->
</header>
<div id="app-wrap">
<div id="app">
  <div class="sss-bolum" style="margin-top:8px;border-top:none;padding-top:0;">
    <h2 style="font-size:20px;">Hakkımızda</h2>
    <div class="sss-madde">
      <h3>SeaDataWave Nedir?</h3>
      <p>SeaDataWave, denize girmeden önce o gün havanın ve denizin müsait olup olmadığını evinden görebileceğin ücretsiz bir site — Karadeniz, Marmara, Ege ve Akdeniz kıyılarındaki her noktada geçerli. Haritada herhangi bir sahil noktasına tıklayarak denizin bugün keyifli mi, yoksa dalgalı/tehlikeli mi olacağını anlık rüzgar ve dalga verisiyle öğrenebilir, aynı zamanda sahildeki diğer kullanıcıların gerçek zamanlı yorumlarını okuyabilirsin.</p>
    </div>
    <div class="sss-madde">
      <h3>Veri Kaynağımız</h3>
      <p>Rüzgar ve dalga verisi Open-Meteo'dan alınır — bu bir tahmindir, resmi bir ölçüm değil. Bunun yanında haritada gördüğün "sahadan gelenler" bölümü, o an sahilde olan kullanıcıların kendi gözlemlerine dayanan gerçek zamanlı bildirimlerdir; tahminle sahadan gelen bilgi bazen uyuşmayabilir, deniz hızlı değişebileceği için gitmeden hemen önce kontrol etmeni öneririz.</p>
    </div>
    <div class="sss-madde">
      <h3>Kapsamımız</h3>
      <p>Şu an 27 il ve 156 kıyı ilçesi için ayrı, bölgeye özel sayfalarımız var; bunların içinde 330'dan fazla Mavi Bayraklı ve halka açık plaj yer alıyor. Yeni il/ilçeler ve plajlar zamanla eklenmeye devam ediyor.</p>
    </div>
    <div class="sss-madde">
      <h3>Daha Fazla Bilgi</h3>
      <p>SeaDataWave'in nasıl çalıştığı, Mavi Bayrak'ın ne anlama geldiği ve veri sıklığı gibi konularda daha fazla soru için <a href="/sss/">Sıkça Sorulan Sorular</a> sayfamıza, denize girmeden önce bilmen gerekenler için <a href="/deniz-guvenligi-rehberi/">Deniz Güvenliği Rehberi</a>'mize, gizlilik uygulamalarımız için <a href="/gizlilik-politikasi.html">Gizlilik Politikası</a> sayfamıza bakabilirsin. Görüş ve önerilerini anasayfadaki değerlendirme formundan bize iletebilirsin.</p>
    </div>
  </div>
  <p class="yer-donus"><a href="/">← Ana sayfaya dön</a></p>
</div>
</div>
<footer class="site-footer">
  <div class="footer-grid">
    <div>
      <div class="brand">
        <img class="brand-mark" src="/icon.png" alt="SeaDataWave logosu" />
        <div class="brand-yazi"><h1>SeaDataWave</h1><p class="brand-alt">Anlık Deniz Verileri</p></div>
      </div>
    </div>
    <div>
      <h4>Keşfet</h4>
      <a href="/samsun/">Samsun</a>
      <a href="/izmir/">İzmir</a>
      <a href="/mugla/">Muğla</a>
      <a href="/aydin/">Aydın</a>
      <a href="/antalya/">Antalya</a>
    </div>
    <div>
      <h4>Destek</h4>
      <a href="/sss/">Sıkça Sorulan Sorular</a>
      <a href="/deniz-guvenligi-rehberi/">Deniz Güvenliği Rehberi</a>
      <a href="/mavi-bayrak-nedir/">Mavi Bayrak Nedir?</a>
      <a href="/ruzgar-dalga-verisi-rehberi/">Veri Okuma Rehberi</a>
      <a href="/iletisim/">İletişim</a>
      <a href="/gizlilik-politikasi.html">Gizlilik Politikası</a>
    </div>
  </div>
  <div class="footer-alt">© 2026 SeaDataWave</div>
</footer>
</body>
</html>
`;
}

// Deniz Güvenliği Rehberi — SSS/Hakkımızda ile aynı statik (js/app.js'siz, TR-only) kalıpta,
// ama tamamen özgün ve genel (belirli bir ilçeye özgü olmayan) editoryal içerik. Amaç:
// sitenin sadece şablon üretilen il/ilçe sayfalarından ibaret olmadığını, gerçek katma
// değerli bir kaynak olduğunu göstermek (bkz. proje notları — AdSense "düşük değerli
// içerik" reddi sonrası eklendi, 2026-07-20).
function denizGuvenligiSayfasiUret({ navHtml }) {
  const title = "Deniz Güvenliği Rehberi — SeaDataWave";
  const metaAciklama = "Dip akıntısı nasıl tanınır, yakalanırsan ne yapmalısın, plaj bayrak sistemi ne anlama gelir? Denize girmeden önce bilmen gereken temel güvenlik bilgileri.";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(metaAciklama)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(metaAciklama)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="SeaDataWave" />
<meta property="og:url" content="https://www.seadatawave.com/deniz-guvenligi-rehberi/" />
<link rel="canonical" href="https://www.seadatawave.com/deniz-guvenligi-rehberi/" />
<link rel="manifest" href="/manifest.json" />
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" href="/icon.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="stylesheet" href="/css/app.css" />
<script type="application/ld+json">
{ "@context": "https://schema.org", "@type": "Article", "headline": ${JSON.stringify(title)}, "url": "https://www.seadatawave.com/deniz-guvenligi-rehberi/", "isPartOf": { "@id": "https://www.seadatawave.com/#website" }, "publisher": { "@id": "https://www.seadatawave.com/#organization" } }
</script>
</head>
<body>
<header class="site-header">
  <div class="brand">
    <img class="brand-mark" src="/icon.png" alt="SeaDataWave logosu" />
    <div class="brand-yazi">
      <h1>SeaDataWave</h1>
      <p class="brand-alt">Anlık Deniz Verileri</p>
    </div>
  </div>
  <!-- NAV:START -->
  ${navHtml}
  <!-- NAV:END -->
</header>
<div id="app-wrap">
<div id="app">
  <div class="sss-bolum" style="margin-top:8px;border-top:none;padding-top:0;">
    <h2 style="font-size:20px;">Deniz Güvenliği Rehberi</h2>
    <div class="sss-madde">
      <h3>Dip akıntısı (rip current) nedir, nasıl tanınır?</h3>
      <p>Dip akıntısı, dalgaların kıyıya taşıdığı suyun en dirençsiz noktadan hızla açığa geri boşalmasıyla oluşan dar bir su şeridi — kum bankaları arasındaki kanallarda, mendirek ve iskele kenarlarında daha sık görülür. Yüzeyde köpüksüz, çevresine göre daha durgun görünen ama aslında hızlı akan bir şerit gibi fark edilebilir; rengi de bazen daha bulanık veya farklı olabilir.</p>
    </div>
    <div class="sss-madde">
      <h3>Dip akıntısına yakalanırsan ne yapmalısın?</h3>
      <p>Akıntıya karşı, doğrudan kıyıya doğru yüzmeye çalışma — yorulup panikleme riskini artırır. Bunun yerine kıyıya paralel yüzerek akıntı şeridinden çıkmayı dene; akıntı zayıfladığını hissettiğinde çapraz bir açıyla kıyıya yönel. Yüzemiyorsan ya da çok yorulduysan, panik yapmadan suda kalmaya çalış ve kolunu kaldırıp yardım iste.</p>
    </div>
    <div class="sss-madde">
      <h3>SeaDataWave'deki kademe renkleri güvenlik açısından ne anlama geliyor?</h3>
      <p>Çarşaf (mavi): dalga neredeyse yok, genelde güvenli — ama dip akıntısı her koşulda ihtimal dahilinde olduğunu unutma. İyi (yeşil): küçük dalgalar, çoğu yüzücü için uygun. Orta (turuncu): belirgin dalga; yüzme deneyimin sınırlıysa temkinli ol, çocukları yakından gözet. Fazla dalga (kırmızı): güçlü dalga/rüzgar; deneyimli yüzücüler için bile risklidir, girmemeni öneririz.</p>
    </div>
    <div class="sss-madde">
      <h3>Plajlardaki bayrak sistemi ne anlama gelir?</h3>
      <p>Cankurtaranlı ve Mavi Bayraklı plajların çoğunda uluslararası kabul görmüş üç renkli bayrak kullanılır: yeşil (güvenli), sarı (dikkatli ol, deneyimsizsen girme), kırmızı (yüzme yasak). Cankurtaranı olmayan halka açık plajlarda bu sistem bulunmayabilir — bu durumda kendi gözlemine ve SeaDataWave'deki güncel duruma dikkat etmen daha da önemli.</p>
    </div>
    <div class="sss-madde">
      <h3>Genel yüzme güvenliği önerileri</h3>
      <p>Alkol aldıktan sonra denize girme. Mümkünse yalnız ve kıyıdan uzak yüzme. Çocukları su kenarında sürekli gözetim altında tut. İlk kez gittiğin bir plajda derinlik ve akıntı konusunda yerel halka veya cankurtarana danış. Deniz hızlı değişebilir — evden çıkmadan hemen önce SeaDataWave'den güncel rüzgar/dalga durumuna bir kez daha bak.</p>
    </div>
    <div class="sss-madde">
      <h3>Acil durumda ne yapmalısın?</h3>
      <p>Boğulma tehlikesi gördüğünde ya da yaşadığında hemen <b>112</b>'yi ara. Kendi güvenliğini tehlikeye atmadan yardım çağır; mümkünse can simidi, ip veya yüzebilen bir nesne uzat — suya atlayıp kurtarmaya çalışmak, eğitimli değilsen ikinci bir kurbana yol açabilir.</p>
    </div>
    <div class="sss-madde">
      <h3>Daha fazla bilgi</h3>
      <p>SeaDataWave'in dalga/rüzgar verisini nasıl hesapladığı ve kademe sistemi hakkında daha fazlası için <a href="/sss/">Sıkça Sorulan Sorular</a> sayfamıza, sitenin amacı için <a href="/hakkimizda/">Hakkımızda</a> sayfamıza bakabilirsin. Bu rehber genel bilgilendirme amaçlıdır, profesyonel cankurtaran veya sağlık tavsiyesinin yerini tutmaz.</p>
    </div>
  </div>
  <p class="yer-donus"><a href="/">← Ana sayfaya dön</a></p>
</div>
</div>
<footer class="site-footer">
  <div class="footer-grid">
    <div>
      <div class="brand">
        <img class="brand-mark" src="/icon.png" alt="SeaDataWave logosu" />
        <div class="brand-yazi"><h1>SeaDataWave</h1><p class="brand-alt">Anlık Deniz Verileri</p></div>
      </div>
    </div>
    <div>
      <h4>Keşfet</h4>
      <a href="/samsun/">Samsun</a>
      <a href="/izmir/">İzmir</a>
      <a href="/mugla/">Muğla</a>
      <a href="/aydin/">Aydın</a>
      <a href="/antalya/">Antalya</a>
    </div>
    <div>
      <h4>Destek</h4>
      <a href="/sss/">Sıkça Sorulan Sorular</a>
      <a href="/deniz-guvenligi-rehberi/">Deniz Güvenliği Rehberi</a>
      <a href="/mavi-bayrak-nedir/">Mavi Bayrak Nedir?</a>
      <a href="/ruzgar-dalga-verisi-rehberi/">Veri Okuma Rehberi</a>
      <a href="/iletisim/">İletişim</a>
      <a href="/gizlilik-politikasi.html">Gizlilik Politikası</a>
    </div>
  </div>
  <div class="footer-alt">© 2026 SeaDataWave</div>
</footer>
</body>
</html>
`;
}

// Ortak, statik (js/app.js'siz, TR-only) sayfa iskeleti — SSS/Hakkımızda/Deniz Güvenliği ile
// aynı kalıp, sadece başlık/meta/içerik/canonical parametreleri değişiyor. Uzun-format
// editoryal makaleler (Mavi Bayrak, veri okuma rehberi vb.) bunu kullanıyor.
function statikMakaleSayfasiUret({ slug, title, metaAciklama, jsonLd, gorunenBaslik, icerikHtml, navHtml }) {
  const canonicalUrl = `https://www.seadatawave.com/${slug}/`;
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(metaAciklama)}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(metaAciklama)}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="SeaDataWave" />
<meta property="og:url" content="${canonicalUrl}" />
<link rel="canonical" href="${canonicalUrl}" />
<link rel="manifest" href="/manifest.json" />
<link rel="icon" href="/favicon.ico" sizes="any" />
<link rel="icon" type="image/png" href="/icon.png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="stylesheet" href="/css/app.css" />
<script type="application/ld+json">
${jsonLd}
</script>
</head>
<body>
<header class="site-header">
  <div class="brand">
    <img class="brand-mark" src="/icon.png" alt="SeaDataWave logosu" />
    <div class="brand-yazi">
      <h1>SeaDataWave</h1>
      <p class="brand-alt">Anlık Deniz Verileri</p>
    </div>
  </div>
  <!-- NAV:START -->
  ${navHtml}
  <!-- NAV:END -->
</header>
<div id="app-wrap">
<div id="app">
  <div class="sss-bolum" style="margin-top:8px;border-top:none;padding-top:0;">
    <h2 style="font-size:20px;">${escapeHtml(gorunenBaslik)}</h2>
    ${icerikHtml}
  </div>
  <p class="yer-donus"><a href="/">← Ana sayfaya dön</a></p>
</div>
</div>
<footer class="site-footer">
  <div class="footer-grid">
    <div>
      <div class="brand">
        <img class="brand-mark" src="/icon.png" alt="SeaDataWave logosu" />
        <div class="brand-yazi"><h1>SeaDataWave</h1><p class="brand-alt">Anlık Deniz Verileri</p></div>
      </div>
    </div>
    <div>
      <h4>Keşfet</h4>
      <a href="/samsun/">Samsun</a>
      <a href="/izmir/">İzmir</a>
      <a href="/mugla/">Muğla</a>
      <a href="/aydin/">Aydın</a>
      <a href="/antalya/">Antalya</a>
    </div>
    <div>
      <h4>Destek</h4>
      <a href="/sss/">Sıkça Sorulan Sorular</a>
      <a href="/deniz-guvenligi-rehberi/">Deniz Güvenliği Rehberi</a>
      <a href="/mavi-bayrak-nedir/">Mavi Bayrak Nedir?</a>
      <a href="/ruzgar-dalga-verisi-rehberi/">Veri Okuma Rehberi</a>
      <a href="/iletisim/">İletişim</a>
      <a href="/gizlilik-politikasi.html">Gizlilik Politikası</a>
    </div>
  </div>
  <div class="footer-alt">© 2026 SeaDataWave</div>
</footer>
</body>
</html>
`;
}

function maviBayrakSayfasiUret({ navHtml }) {
  const title = "Mavi Bayrak Nedir? Kriterleri ve Türkiye'deki Uygulaması — SeaDataWave";
  const metaAciklama = "Mavi Bayrak sertifikası ne anlama gelir, TÜRÇEV hangi kriterlere bakar, su kalitesi nasıl kontrol edilir? SeaDataWave'in plaj rozetlerini nasıl kullandığı dahil, doğrulanmış bilgilerle.";
  const jsonLd = `{ "@context": "https://schema.org", "@type": "Article", "headline": ${JSON.stringify(title)}, "url": "https://www.seadatawave.com/mavi-bayrak-nedir/", "isPartOf": { "@id": "https://www.seadatawave.com/#website" }, "publisher": { "@id": "https://www.seadatawave.com/#organization" } }`;

  const icerikHtml = `
    <div class="sss-madde">
      <h3>Mavi Bayrak nedir?</h3>
      <p>Mavi Bayrak, belirli çevresel ve güvenlik standartlarını karşılayan plaj ve marinalara verilen uluslararası bir eko-etiket. Kalıcı bir ödül değil — her sezon için yeniden değerlendirilir, yani bir plaj bir yıl Mavi Bayraklı olup ertesi yıl kriterleri karşılayamazsa bayrağını kaybedebilir.</p>
    </div>
    <div class="sss-madde">
      <h3>Türkiye'de bu süreci kim yürütüyor?</h3>
      <p>Türkiye'de Mavi Bayrak çalışmaları 1993'ten beri TÜRÇEV (Türkiye Çevre Eğitim Vakfı) tarafından yürütülüyor — programın Türkiye'deki başlangıcıyla vakfın kuruluşu aynı yıla denk geliyor.</p>
    </div>
    <div class="sss-madde">
      <h3>Hangi kriterlere bakılıyor?</h3>
      <p>Kriterler dört ana başlıkta toplanıyor: Çevre Eğitimi ve Bilgilendirme, Yüzme Suyu Kalitesi, Çevre Yönetimi, ve Can Güvenliği ve Hizmetler. Bu kriterlerin bir kısmı zorunlu (bayrağı almak için mutlaka karşılanması gerekiyor), bir kısmı ise tavsiye niteliğinde.</p>
    </div>
    <div class="sss-madde">
      <h3>Su kalitesi nasıl kontrol ediliyor?</h3>
      <p>Yüzme sezonu boyunca yaklaşık 15 günde bir su örnekleri alınıyor ve mikrobiyolojik analiz yapılıyor. Sonuçlar, Türkiye'nin Yüzme Suyu Kalitesi Yönetmeliği ve Avrupa Birliği Yüzme Suyu Direktifi çerçevesinde değerlendirilerek plajın su kalitesi sınıflandırılıyor. Bu analiz sonuçlarının plajda kullanıcılara açık şekilde sergilenmesi de kriterlerden biri.</p>
    </div>
    <div class="sss-madde">
      <h3>Mavi Bayrağı olmayan bir plaj güvenli değil mi?</h3>
      <p>Hayır, bu doğru bir çıkarım olmaz. Sertifika eksikliği çoğu zaman suyun kirli olduğu anlamına gelmiyor — plajın başvuru/denetim sürecine hiç dahil olmadığını gösteriyor olabilir. Bu yüzden SeaDataWave'de Mavi Bayraklı plajları ayrı, halka açık ama sertifikasız gerçek plajları da ayrı ve dürüst bir başlık altında listeliyoruz; hiçbir zaman sertifikasız bir plaj için "Mavi Bayraklı" iddiasında bulunmuyoruz.</p>
    </div>
    <div class="sss-madde">
      <h3>SeaDataWave'de bu bilgiyi nasıl kullanıyoruz?</h3>
      <p>Her il/ilçe sayfasında, TÜRÇEV'in resmi ve güncel listesine dayanan plajları "Mavi Bayraklı Plajlar" başlığı altında ayrı listeliyoruz. Haritada bir Mavi Bayraklı plaja yakın bir noktaya tıkladığında da bu bilgi, deniz durumu kartının altında rozet olarak görünür.</p>
    </div>
    <div class="sss-madde">
      <h3>Daha fazla bilgi</h3>
      <p>Mavi Bayrak programının güncel ve resmi kriterleri için TÜRÇEV'in kendi sitesine bakabilirsin. SeaDataWave'in veri kaynağı ve kademe sistemi hakkında daha fazlası için <a href="/ruzgar-dalga-verisi-rehberi/">Rüzgar ve Dalga Verisi Rehberi</a>'mize, denize girmeden önce bilmen gerekenler için <a href="/deniz-guvenligi-rehberi/">Deniz Güvenliği Rehberi</a>'mize bakabilirsin.</p>
    </div>`;

  return statikMakaleSayfasiUret({ slug: "mavi-bayrak-nedir", title, metaAciklama, jsonLd, gorunenBaslik: "Mavi Bayrak Nedir? Kriterleri ve Türkiye'deki Uygulaması", icerikHtml, navHtml });
}

function veriRehberiSayfasiUret({ navHtml }) {
  const title = "Rüzgar ve Dalga Verisi Nasıl Okunur? — SeaDataWave";
  const metaAciklama = "SeaDataWave'deki rüzgar hızı, dalga yüksekliği/periyodu ve kademe renkleri ne anlama gelir? Verinin nereden geldiği ve kıyı şekline göre nasıl yorumlandığı hakkında rehber.";
  const jsonLd = `{ "@context": "https://schema.org", "@type": "Article", "headline": ${JSON.stringify(title)}, "url": "https://www.seadatawave.com/ruzgar-dalga-verisi-rehberi/", "isPartOf": { "@id": "https://www.seadatawave.com/#website" }, "publisher": { "@id": "https://www.seadatawave.com/#organization" } }`;

  const icerikHtml = `
    <div class="sss-madde">
      <h3>Veri nereden geliyor?</h3>
      <p>Rüzgar ve dalga tahminlerini Open-Meteo'nun ücretsiz, açık hava ve deniz tahmin API'lerinden alıyoruz. Bu bir tahmindir — sahil şeridine yerleştirilmiş bir ölçüm cihazının anlık okuması değil, meteorolojik modellerin ürettiği bir öngörü. Bu yüzden site üzerinde her zaman "sahadan gelenler" bölümüyle birlikte gösterilir; ikisi bazen uyuşmayabilir.</p>
    </div>
    <div class="sss-madde">
      <h3>Rüzgar hızı ne anlama gelir?</h3>
      <p>Rüzgar hızını km/saat cinsinden gösteriyoruz. Genel bir referans olarak: 0-15 km/s hafif esinti sayılır, 15-30 km/s orta şiddette bir rüzgardır ve dalgayı belirgin şekilde etkilemeye başlar, 30 km/s üzerinde kuvvetli rüzgar sayılır ve çoğu kıyıda dalgayı hızla büyütür.</p>
    </div>
    <div class="sss-madde">
      <h3>Dalga yüksekliği ve periyodu ne anlama gelir?</h3>
      <p>Dalga yüksekliği, dalganın tepe noktasıyla çukur noktası arasındaki mesafedir (metre cinsinden). Periyot ise iki dalga tepesi arasında geçen süredir (saniye). Aynı yükseklikteki iki dalga çok farklı hissedilebilir: kısa periyotlu bir dalga (genelde yerel rüzgarın ürettiği "rüzgar dalgası") daha dik ve arka arkaya gelen bir etki yaratırken, uzun periyotlu bir dalga (uzaktaki bir fırtınadan gelen "swell") daha yumuşak ve düzenli hissettirir.</p>
    </div>
    <div class="sss-madde">
      <h3>"Fetch" nedir, neden önemli?</h3>
      <p>Fetch, rüzgarın su üzerinde kesintisiz estiği mesafedir. Aynı rüzgar hızı, açık bir denizde uzun mesafe boyunca estiğinde çok daha büyük dalga üretirken, korunaklı bir körfez veya koyda çok daha küçük dalga üretir — çünkü rüzgarın suya enerji aktarabileceği mesafe kısıtlıdır. Bu yüzden SeaDataWave, sadece ham rüzgar tahminine değil, tıkladığın noktanın kıyı şekline (açık deniz mi, korunaklı bir koy mu, bir liman mı) göre ince ayar yapılmış bir hesaba bakar.</p>
    </div>
    <div class="sss-madde">
      <h3>Kademe renkleri (çarşaf/iyi/orta/tehlikeli) nasıl belirleniyor?</h3>
      <p>Her kademe, dalga yüksekliği ve rüzgar hızı için belirlenmiş eşik değerlere dayanır. Bu eşikler bölgeye göre de değişir — örneğin açık ve derin bir Karadeniz'de "orta" sayılan bir dalga yüksekliği, daha korunaklı bir Ege koyunda "tehlikeli" sayılan bir eşiğe denk gelebilir, çünkü aynı kıyı orada normalde çok daha sakin bir denize alışkındır.</p>
    </div>
    <div class="sss-madde">
      <h3>Tahmin ile sahadan gelen yorumlar neden bazen uyuşmuyor?</h3>
      <p>Tahmin, modellerin bir olasılık hesabıdır; sahadan gelen bildirimler ise o an sahilde olan gerçek kullanıcıların doğrudan gözlemidir. Deniz hızlı değişebileceği için ikisi arasında fark olabilir — bu yüzden gitmeden hemen önce ikisine birden bakmanı öneririz.</p>
    </div>
    <div class="sss-madde">
      <h3>Daha fazla bilgi</h3>
      <p>Mavi Bayrak rozetlerinin ne anlama geldiği için <a href="/mavi-bayrak-nedir/">Mavi Bayrak Nedir?</a> sayfamıza, denize girmeden önce bilmen gerekenler için <a href="/deniz-guvenligi-rehberi/">Deniz Güvenliği Rehberi</a>'mize bakabilirsin.</p>
    </div>`;

  return statikMakaleSayfasiUret({ slug: "ruzgar-dalga-verisi-rehberi", title, metaAciklama, jsonLd, gorunenBaslik: "Rüzgar ve Dalga Verisi Nasıl Okunur?", icerikHtml, navHtml });
}

function iletisimSayfasiUret({ navHtml }) {
  const title = "İletişim — SeaDataWave";
  const metaAciklama = "SeaDataWave hakkında soru, öneri veya bildirmek istediğin bir sorun mu var? İletişim bilgilerimiz burada.";
  const jsonLd = `{ "@context": "https://schema.org", "@type": "ContactPage", "name": ${JSON.stringify(title)}, "url": "https://www.seadatawave.com/iletisim/", "isPartOf": { "@id": "https://www.seadatawave.com/#website" }, "publisher": { "@id": "https://www.seadatawave.com/#organization" } }`;

  const icerikHtml = `
    <div class="sss-madde">
      <h3>Soru veya öneri</h3>
      <p>SeaDataWave hakkında bir sorun, önerin ya da bildirmek istediğin bir hata mı var? <a href="mailto:dogayldz5555@gmail.com">dogayldz5555@gmail.com</a> adresinden bize ulaşabilirsin.</p>
    </div>
    <div class="sss-madde">
      <h3>Site içi değerlendirme</h3>
      <p>Uygulamayı nasıl bulduğunu, ana sayfanın en altındaki yıldız değerlendirme ve yorum formundan da paylaşabilirsin — buradan gelen görüşler doğrudan geliştirmemize katkı sağlıyor.</p>
    </div>
    <div class="sss-madde">
      <h3>Veri veya konum düzeltmesi</h3>
      <p>Haritada yanlış bir plaj konumu, eksik bir ilçe ya da güncel olmayan bir bilgi fark edersen, aynı e-posta adresinden bildirebilirsin — bu tür geri bildirimler sayesinde plaj ve konum verilerimiz sürekli güncelleniyor.</p>
    </div>`;

  return statikMakaleSayfasiUret({ slug: "iletisim", title, metaAciklama, jsonLd, gorunenBaslik: "İletişim", icerikHtml, navHtml });
}

module.exports = { sayfaIskeleti, ilceSayfasiUret, ilSayfasiUret, sssSayfasiUret, hakkimizdaSayfasiUret, denizGuvenligiSayfasiUret, maviBayrakSayfasiUret, veriRehberiSayfasiUret, iletisimSayfasiUret, navHtmlUret, escapeHtml };
