// === SUPABASE BAĞLANTI BİLGİLERİ ===
// Buraya kendi Supabase projenin Project URL ve anon/publishable key'ini yapıştır.
// Settings > API Keys sayfasından alabilirsin. Bu key tarayıcıda görünür olabilir,
// güvenlik RLS politikalarıyla sağlanıyor (yukarıdaki SQL dosyasına bak).
const SUPABASE_URL = "https://conejfwwcwjtvvzzdqad.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_VtilBtvDJOyBZ2vwP5MQCg_aXGyOy1x";

let supabaseClient = null;
const supabaseHazir = SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20;
if (supabaseHazir) {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn("Supabase bağlantı bilgileri girilmedi — geri bildirimler bu oturumda yerel olarak saklanacak.");
}

// === TR/EN dil desteği ===
// Sunucu tarafında ayrı sayfa/derleme yok (tek bir statik index.html), bu yüzden çeviri
// tamamen istemci tarafında: tüm metinler bu sözlükten okunuyor, dil değişince statik
// metinler yeniden basılıyor VE o an ekranda açık olan dinamik içerik (kart, balonlar,
// yan panel, yorumlar) yeniden çiziliyor. Seçim localStorage'da kalıcı.
const DIL_ANAHTARI = 'deniz-durumu-dil';
function kayitliDiliGetir() {
  try {
    const kayitli = localStorage.getItem(DIL_ANAHTARI);
    if (kayitli === 'tr' || kayitli === 'en') return kayitli;
  } catch (e) {}
  // Kayıtlı tercih yoksa (ör. ilk ziyaret, ya da Googlebot gibi tarayıcı dili İngilizce
  // gelen bir tarama botu) varsayılan olarak Türkçe'ye düşüyoruz — site zaten Türkçe
  // içerik ağırlıklı, ve tarayıcı diline göre otomatik İngilizce'ye geçmek Google'ın
  // sayfayı İngilizce olarak indekslemesine yol açıyordu (bkz. kullanıcı geri bildirimi
  // 2026-07-06). İngilizce isteyen kullanıcı EN düğmesine basınca tercihi kalıcı olur.
  return 'tr';
}
let AKTIF_DIL = kayitliDiliGetir();

const CEVIRI = {
  tr: {
    site_baslik: "SeaDataWave",
    sub_tagline: "Haritada bir noktaya tıkla, o bölgenin rüzgar ve dalga durumunu gör.",
    yer_arama_placeholder: "Ara",
    isim_baslik: "İsim / rumuzunu gir",
    isim_alt: "Bir kere yeter — hem deniz durumu yorumların hem site değerlendirmen bu isimle yapılır.",
    isim_placeholder: "İsim / rumuz",
    isim_kaydet: "Kaydet",
    isim_degistir: "değiştir",
    isim_yapacaksin: (isim) => `${isim} olarak yorum/değerlendirme yapacaksın`,
    isim_gerekli_uyari: "Devam etmek için önce bir isim gir.",
    konumum: "Konumum",
    konum_bulunuyor: "Bulunuyor…",
    konum_desteklenmiyor: "Tarayıcı desteklemiyor",
    konum_izin_yok: "Konum izni verilmedi.",
    veri_paneli_kapat: "Veri panelini kapat",
    tahminimiz: "Tahminimiz (rüzgar + dalga verisi)",
    harita_placeholder: "Haritada bir noktaya tıkla.",
    veri_aliniyor: "Rüzgar ve dalga verisi alınıyor…",
    simdi_gercek_veri: (saat) => `Şimdi · ${saat} — gerçek zamanlı veri`,
    tahmin_etiketi: "Tahmin",
    tahmin_aciklama: "Bu bir tahmindir, gerçekleşen bir ölçüm değil. Sahadan gelen yorumlar sadece \"Şimdi\" görünümünde gösterilir.",
    saatlik_tahmin_basligi: "Saatlik tahmin",
    onceki_gun: "Önceki gün",
    sonraki_gun: "Sonraki gün",
    gun_kaydir_ipucu: "Kaydırarak ertesi günün dalga ve hava tahminlerini görebilirsin.",
    sahadan_gelenler: "Sahadan gelenler",
    deniz_nasil_baslik: "Şu an oradaysan deniz nasıl?",
    durum_carsaf: "Çok iyi",
    durum_hafif: "Orta",
    durum_fazla: "Kötü",
    durum_tehlikeli: "Tehlikeli",
    foto_ekle: "Fotoğraf ekle (opsiyonel)",
    foto_onizleme_alt: "Seçilen fotoğraf önizlemesi",
    foto_kaldir: "Fotoğrafı kaldır",
    foto_sadece_resim: "Sadece resim dosyası seçebilirsin.",
    foto_boyut_limit: (mb) => `Fotoğraf en fazla ${mb}MB olabilir.`,
    not_placeholder: "İsteğe bağlı not (örn. dip akıntısı var)",
    gonder: "Gönder",
    bildirim_kaydedildi: "Bildiriminiz kaydedildi, teşekkürler.",
    gonderilemedi: "Gönderilemedi, lütfen tekrar dene.",
    cok_sik_bildirim: (dk) => `Çok sık bildirim gönderiyorsun, ${dk} dakika sonra tekrar dene.`,
    footnote: "Rüzgar ve dalga verisi Open-Meteo'dan alınır, anlık ve tahminidir. Geri bildirimler herkese açık şekilde paylaşılır ve aynı çevredeki herkes birbirinin yorumunu görebilir.",
    site_feedback_baslik: "Bu uygulamayı nasıl buldun?",
    site_feedback_alt: "Deniz durumuyla ilgili değil; sitenin kendisi hakkındaki görüşün. Haritada görünmez, yalnızca geliştirmemize katkı sağlar.",
    site_feedback_mesaj_placeholder: "İsteğe bağlı: ne eksik, ne beğendin, ne değiştirilmeli?",
    site_feedback_yildiz_sec: "Lütfen önce bir yıldız seç.",
    site_feedback_gonderiliyor: "Gönderiliyor…",
    site_feedback_tesekkur: "Teşekkürler! Görüşünüz kaydedildi.",
    yildiz_aria: (n) => `${n} yıldız`,
    sayfa_baslik: "SeaDataWave — Bugün Deniz Nasıl?",
    meta_aciklama: "Denize girmeden önce havanın ve denizin uygun olup olmadığını gör. Türkiye kıyılarında anlık rüzgar ve dalga durumu — haritadan bir nokta seç, denizin bugün keyifli mi yoksa dalgalı mı olduğunu öğren, sahadan gelen gerçek kullanıcı yorumlarını oku.",
    og_aciklama: "Denize girmeden önce o bölgede deniz keyifli mi yoksa dalgalı mı, anlık olarak öğren.",
    seo_baslik: "Denize girmeden önce deniz durumunu öğren",
    seo_metin: "SeaDataWave, denize girmeden önce o gün havanın ve denizin müsait olup olmadığını evinden görebileceğin ücretsiz bir site — Karadeniz, Marmara, Ege ve Akdeniz kıyılarındaki her noktada (Samsun, Atakum, Trabzon, Sinop, İstanbul, İzmir, Antalya ve diğer tüm sahil bölgeleri dahil) geçerli. Haritada herhangi bir sahil noktasına tıklayarak denizin bugün keyifli mi, yoksa dalgalı/tehlikeli mi olacağını anlık rüzgar ve dalga verisiyle öğrenebilir, aynı zamanda sahildeki diğer kullanıcıların gerçek zamanlı yorumlarını okuyabilirsin.",
    sss_git_baslik: "Sıkça sorulan sorular",
    sss_git_metin: "SeaDataWave nasıl çalışır, Mavi Bayrak ne demek, veriler ne sıklıkla güncelleniyor? Tüm cevaplar SSS sayfasında.",
    sss_git_buton: "Sıkça Sorulan Sorular →",
    yan_panel_baslik: "Denize girilen yerler",
    yan_panel_alt: "Son 2 saatte yorum alan noktalar, çoğunluk görüşüne göre",
    yan_panel_yakinlastir: "Yakınlaştırınca haritada görünen noktalardaki yorumlar burada listelenir.",
    yan_panel_bos: "Bu bölgede henüz yorum yok. İlk yorumu sen bırak.",
    yakin_yorumlar_baslik: "Yakındaki Yorumlar",
    yakin_yorumlar_alt: "Haritada bir yere yaklaşınca, oradaki kullanıcı yorumlarını burada görebilirsin.",
    yakin_yorumlar_gor: "Sadece yorumları gör",
    yakin_yorumlar_gizle: "Yorumları gizle",
    site_yorumlar_baslik: "Kullanıcı yorumları",
    site_yorumlar_alt: "Uygulamayı kullananların bıraktığı görüşler.",
    yorumlar_yukleniyor: "Yorumlar yükleniyor…",
    yorumlar_yuklenemedi: "Yorumlar şu an yüklenemiyor.",
    gizlilik_politikasi_link: "Gizlilik Politikası",
    yorumlar_ilk_sen: "Henüz yorum bırakılmamış. İlk yorum senin olsun!",
    harita_buyut: "Haritayı büyüt",
    harita_kucult: "Haritayı küçült",
    bildir_tooltip: "Şüpheli/uygunsuz bildir",
    bildirildi_tooltip: "Bildirildi, teşekkürler",
    begen: "Beğen",
    begenme: "Beğenme",
    oyunu_geri_al: "Oyunu geri al",
    az_once: "az önce",
    dk_once: (n) => `${n} dk önce`,
    sa_once: (n) => `${n} sa önce`,
    simdi: "Şimdi",
    trend_artiyor: "artıyor",
    trend_azaliyor: "azalıyor",
    trend_sabit: "sabit",
    trend_son_24_dalga: "Son 24 saat (dalga)",
    trend_son_24_ruzgar: "Son 24 saat (rüzgar)",
    ruzgar_birim: "rüzgar",
    dalga_birim: "dalga",
    hamle: "Hamle",
    periyot: "Periyot",
    hava: "Hava",
    deniz_sicaklik: "Deniz",
    dan: (yon) => `(${yon}'dan)`,
    ruzgar_dalgasi_notu: (periyot) => `Dalganın büyük kısmı yerel rüzgarın az önce oluşturduğu kısa, çırpıntılı dalga (periyot ${periyot} sn) — bu yüzden tahmin biraz daha temkinli.`,
    fetch_notu_kiyidan_ruzgar: (km) => `Rüzgar şu an karadan esiyor (bu yönde açık su mesafesi yalnızca <b>${km} km</b>) — bu geçici bir durum, rüzgar yönü değişince fetch mesafesi de değişir. Kara rüzgarında dalga oluşumu çok sınırlı kalır, deniz rüzgar hızından bağımsız olarak sakin görünür.`,
    fetch_notu_korunakli: (km) => `Açık deniz mesafesi (fetch) yaklaşık <b>${km} km</b> — koy/körfez gibi korunaklı bir bölge, eşikler buna göre gevşetildi.`,
    fetch_notu_acik: (km) => `Açık deniz mesafesi (fetch) yaklaşık <b>${km} km</b> — açık kıyı, standart bölgesel eşikler kullanıldı.`,
    fetch_notu_bekleniyor: "Kıyı şekli inceleniyor, birkaç saniye içinde eşik ince ayarı gelebilir…",
    fetch_farkli_sonuc_uyarisi: (durum) => `Kıyı şekli analizi tamamlandı: gerçek koşullar yukarıdakinden belirgin şekilde farklı, "${durum}" kademesine daha yakın olabilir.`,
    swell_notu: (m, sn) => `Ayrıca <b>${m} m</b>, ${sn} sn periyotlu bir swell (uzaktaki başka bir fırtınadan gelen, yerel rüzgardan bağımsız dalga) tespit edildi — bu yerel kıyı şeklinden etkilenmediği için dalga eşiği buna göre gevşetilmedi.`,
    canli_kamera_link: (ad) => `🔴 Yakında canlı kamera var (${ad}) — belediyenin yayın sayfasını aç`,
    mavi_bayrak_rozeti: (ad) => `🏳️ ${ad} — Halka Açık Mavi Bayraklı Plaj (TÜRÇEV sertifikalı)`,
    halk_plaji_rozeti: (ad) => `🏖️ ${ad} — Halka Açık Plaj`,
    kuvvetli_ruzgar_uyarisi: "Kuvvetli rüzgar — bu kendi verimize dayanan bir gözlem, resmi uyarı değil",
    kara_uzerinde: "Bu nokta kara üzerinde görünüyor — dalga bilgisi yalnızca kıyı/deniz noktalarında gösterilir.",
    kiyidan_ruzgar_bilgisi: "Kıyıdan rüzgar bilgisi",
    paylas: "Paylaş",
    yenile: "Yenile",
    paylas_metni: (yer, durum, link) => `${yer} şu an: ${durum}\nDeniz durumu için: ${link}`,
    son_bilinen_durum: (zaman) => `<b>Son bilinen durum</b> (${zaman}, bağlantı yokken):`,
    veri_alinamadi: "Veri alınamadı. Bağlantını kontrol edip yeniden dene.",
    yeniden_dene: "Yeniden dene",
    bu_cevrede_bildirim_yok: "Son 2 saatte bu çevrede kimse bildirim bırakmadı. Aşağıdaki butonlardan birini seçerek ilk bildirimi sen yap. ↓",
    sahadan_bildirim_yuklenemedi: "Sahadan gelen bildirimler şu an yüklenemedi.",
    cogunluga_gore: (durum, yuzde) => `Çoğunluğa göre deniz ${durum} <span style="opacity:0.65;font-weight:600;">(%${yuzde})</span>`,
    tahminimiz_uyusuyor: (durum) => `Tahminimiz de <b>${durum}</b> diyor — sahayla uyuşuyor`,
    tahminimiz_uyusmuyor: (bizim, saha) => `Tahminimiz <b>${bizim}</b>, sahadaki çoğunluk <b>${saha}</b> diyor`,
    catisma_notu: (bizim, saha) => `Tahminimize göre deniz <b>${bizim}</b>, ama sahadan gelen bildirimlere göre çoğunlukla <b>${saha}</b>. Deniz hızlı değişebilir, gitmeden hemen önce kontrol et.`,
    kisi_bildirdi: (n) => `${n} kişi bildirdi`,
    yorum_sayisi: (n) => `${n} yorum`,
    sikayetli_yorum: "⚠ Bu yorum birden fazla kişi tarafından şüpheli/uygunsuz bulundu.",
    foto_gizlendi: "Fotoğraf, birden fazla bildirim nedeniyle gizlendi.",
    kullanici_fotografi: "Kullanıcı fotoğrafı",
    anonim: "Anonim",
    etiket_carsaf: "Deniz çok iyi görünüyor",
    etiket_hafif: "Hafif dalgalı",
    etiket_fazla: "Fazla dalga var",
    etiket_tehlikeli: "Tehlikeli, denize girmeyin",
    etiket_kisa_carsaf: "çok iyi",
    etiket_kisa_hafif: "orta",
    etiket_kisa_fazla: "kötü",
    etiket_kisa_tehlikeli: "tehlikeli",
    etiket_alt_carsaf: "Dalgasız, çarşaf gibi dümdüz bir deniz",
    etiket_alt_hafif: "Hâlâ rahatça girilir, sadece hafif bir dalga var",
    etiket_alt_fazla: "Girmek riskli olabilir, dikkatli ol",
    etiket_alt_tehlikeli: "Denize girmeyin",
  },
  en: {
    site_baslik: "SeaDataWave",
    sub_tagline: "Tap a point on the map to see the wind and wave conditions there.",
    yer_arama_placeholder: "Search",
    isim_baslik: "Enter your name / nickname",
    isim_alt: "Only needed once — used for both your sea-condition comments and your site review.",
    isim_placeholder: "Name / nickname",
    isim_kaydet: "Save",
    isim_degistir: "change",
    isim_yapacaksin: (isim) => `You'll comment/review as ${isim}`,
    isim_gerekli_uyari: "Please enter a name first to continue.",
    konumum: "My location",
    konum_bulunuyor: "Locating…",
    konum_desteklenmiyor: "Not supported by your browser",
    konum_izin_yok: "Location permission denied.",
    veri_paneli_kapat: "Close data panel",
    tahminimiz: "Our estimate (wind + wave data)",
    harita_placeholder: "Tap a point on the map.",
    veri_aliniyor: "Fetching wind and wave data…",
    simdi_gercek_veri: (saat) => `Now · ${saat} — live data`,
    tahmin_etiketi: "Forecast",
    tahmin_aciklama: "This is a forecast, not a live measurement. Field reports are only shown in the \"Now\" view.",
    saatlik_tahmin_basligi: "Hourly forecast",
    onceki_gun: "Previous day",
    sonraki_gun: "Next day",
    gun_kaydir_ipucu: "Swipe to see tomorrow's wave and weather forecast.",
    sahadan_gelenler: "From the field",
    deniz_nasil_baslik: "If you're there right now, how's the sea?",
    durum_carsaf: "Very good",
    durum_hafif: "Light",
    durum_fazla: "Rough",
    durum_tehlikeli: "Dangerous",
    foto_ekle: "Add photo (optional)",
    foto_onizleme_alt: "Selected photo preview",
    foto_kaldir: "Remove photo",
    foto_sadece_resim: "You can only select an image file.",
    foto_boyut_limit: (mb) => `Photo can be at most ${mb}MB.`,
    not_placeholder: "Optional note (e.g. there's a rip current)",
    gonder: "Send",
    bildirim_kaydedildi: "Your report was saved, thank you.",
    gonderilemedi: "Couldn't send, please try again.",
    cok_sik_bildirim: (dk) => `You're sending reports too often, try again in ${dk} minutes.`,
    footnote: "Wind and wave data comes from Open-Meteo and is live/forecast data. Reports are shared publicly and everyone nearby can see each other's comments.",
    site_feedback_baslik: "How did you find this app?",
    site_feedback_alt: "Not about the sea conditions — your opinion about the site itself. Not shown on the map, only helps us improve.",
    site_feedback_mesaj_placeholder: "Optional: what's missing, what did you like, what should change?",
    site_feedback_yildiz_sec: "Please pick a star rating first.",
    site_feedback_gonderiliyor: "Sending…",
    site_feedback_tesekkur: "Thanks! Your feedback was saved.",
    yildiz_aria: (n) => `${n} star${n === 1 ? '' : 's'}`,
    sayfa_baslik: "SeaDataWave — What's the sea like today?",
    meta_aciklama: "Check whether the weather and sea are good for swimming before you even leave home. Live wind and wave conditions on Turkey's coasts — pick a point on the map, find out whether the sea is calm or choppy today, and read real user reports from the field.",
    og_aciklama: "See whether the sea is calm or choppy in that area, live, before you head to the beach.",
    seo_baslik: "See if the sea is good for swimming before you go",
    seo_metin: "SeaDataWave is a free site where you can check, before heading to the beach, whether the weather and sea are good for swimming that day — covering any point along Turkey's Black Sea, Marmara, Aegean and Mediterranean coasts (including Samsun, Atakum, Trabzon, Sinop, Istanbul, Izmir, Antalya and every other coastal area). Tap any coastal point on the map to see live wind and wave data and find out whether the sea will be pleasant or choppy today, plus real-time reports from other people at that spot.",
    sss_git_baslik: "Frequently asked questions",
    sss_git_metin: "How does SeaDataWave work, what does Blue Flag mean, how often is data updated? All the answers are on the FAQ page.",
    sss_git_buton: "Frequently Asked Questions →",
    yan_panel_baslik: "Places people are swimming",
    yan_panel_alt: "Points with reports in the last 2 hours, by majority verdict",
    yan_panel_yakinlastir: "Zoom in to see reports at points visible on the map here.",
    yan_panel_bos: "No reports here yet. Be the first to leave one.",
    yakin_yorumlar_baslik: "Nearby Comments",
    yakin_yorumlar_alt: "Zoom in on a spot on the map to see user comments from there.",
    yakin_yorumlar_gor: "View comments only",
    yakin_yorumlar_gizle: "Hide comments",
    site_yorumlar_baslik: "User reviews",
    site_yorumlar_alt: "What people using the app have said.",
    yorumlar_yukleniyor: "Loading reviews…",
    yorumlar_yuklenemedi: "Reviews can't be loaded right now.",
    yorumlar_ilk_sen: "No reviews yet. Be the first!",
    gizlilik_politikasi_link: "Privacy Policy",
    harita_buyut: "Expand map",
    harita_kucult: "Shrink map",
    bildir_tooltip: "Report suspicious/inappropriate",
    bildirildi_tooltip: "Reported, thank you",
    begen: "Like",
    begenme: "Dislike",
    oyunu_geri_al: "Undo your vote",
    az_once: "just now",
    dk_once: (n) => `${n} min ago`,
    sa_once: (n) => `${n}h ago`,
    simdi: "Now",
    trend_artiyor: "rising",
    trend_azaliyor: "falling",
    trend_sabit: "steady",
    trend_son_24_dalga: "Last 24h (wave)",
    trend_son_24_ruzgar: "Last 24h (wind)",
    ruzgar_birim: "wind",
    dalga_birim: "wave",
    hamle: "Gusts",
    periyot: "Period",
    hava: "Air",
    deniz_sicaklik: "Sea",
    dan: (yon) => `(from ${yon})`,
    ruzgar_dalgasi_notu: (periyot) => `Most of the wave is short, choppy wind-wave generated locally just now (period ${periyot} s) — so the estimate is a bit more cautious.`,
    fetch_notu_kiyidan_ruzgar: (km) => `The wind is currently blowing off the land (open-water distance in this direction is only <b>${km} km</b>) — this is temporary and changes with wind direction. Wave formation stays very limited during an offshore wind, so the sea looks calm regardless of wind speed.`,
    fetch_notu_korunakli: (km) => `Open-water distance (fetch) is about <b>${km} km</b> — a sheltered area like a bay/cove, thresholds were relaxed accordingly.`,
    fetch_notu_acik: (km) => `Open-water distance (fetch) is about <b>${km} km</b> — open coast, standard regional thresholds used.`,
    fetch_notu_bekleniyor: "Analyzing the coastline shape, a fine-tuned threshold may arrive in a few seconds…",
    fetch_farkli_sonuc_uyarisi: (durum) => `Coastline analysis finished: actual conditions may be notably different from above, closer to "${durum}".`,
    swell_notu: (m, sn) => `A <b>${m} m</b> swell with a ${sn} s period was also detected (waves from a distant storm, independent of the local wind) — since this isn't affected by the local coastline shape, the wave threshold wasn't relaxed for it.`,
    canli_kamera_link: (ad) => `🔴 A live camera is nearby (${ad}) — open the city's live stream page`,
    mavi_bayrak_rozeti: (ad) => `🏳️ ${ad} — Public Blue Flag Beach (TÜRÇEV certified)`,
    halk_plaji_rozeti: (ad) => `🏖️ ${ad} — Public Beach`,
    kuvvetli_ruzgar_uyarisi: "Strong wind — this is our own data-based observation, not an official warning",
    kara_uzerinde: "This point appears to be on land — wave info is only shown for coastal/sea points.",
    kiyidan_ruzgar_bilgisi: "Coastal wind info",
    paylas: "Share",
    yenile: "Refresh",
    paylas_metni: (yer, durum, link) => `${yer} right now: ${durum}\nFor sea conditions: ${link}`,
    son_bilinen_durum: (zaman) => `<b>Last known status</b> (${zaman}, while offline):`,
    veri_alinamadi: "Couldn't fetch data. Check your connection and try again.",
    yeniden_dene: "Try again",
    bu_cevrede_bildirim_yok: "No one has reported here in the last 2 hours. Pick one of the buttons below to leave the first report. ↓",
    sahadan_bildirim_yuklenemedi: "Field reports can't be loaded right now.",
    cogunluga_gore: (durum, yuzde) => `Majority says the sea is ${durum} <span style="opacity:0.65;font-weight:600;">(${yuzde}%)</span>`,
    tahminimiz_uyusuyor: (durum) => `Our estimate also says <b>${durum}</b> — matches the field`,
    tahminimiz_uyusmuyor: (bizim, saha) => `Our estimate is <b>${bizim}</b>, the field majority says <b>${saha}</b>`,
    catisma_notu: (bizim, saha) => `Our estimate says the sea is <b>${bizim}</b>, but field reports mostly say <b>${saha}</b>. The sea can change fast — check right before you go.`,
    kisi_bildirdi: (n) => `${n} people reported`,
    yorum_sayisi: (n) => `${n} reports`,
    sikayetli_yorum: "⚠ Multiple people flagged this comment as suspicious/inappropriate.",
    foto_gizlendi: "Photo hidden due to multiple reports.",
    kullanici_fotografi: "User photo",
    anonim: "Anonymous",
    etiket_carsaf: "Sea looks great",
    etiket_hafif: "Slightly choppy",
    etiket_fazla: "Quite rough",
    etiket_tehlikeli: "Dangerous, don't swim",
    etiket_kisa_carsaf: "very good",
    etiket_kisa_hafif: "slightly choppy",
    etiket_kisa_fazla: "quite rough",
    etiket_kisa_tehlikeli: "dangerous",
    etiket_alt_carsaf: "Flat, calm water with no waves",
    etiket_alt_hafif: "Still fine to swim, just a light wave",
    etiket_alt_fazla: "Getting in may be risky, be careful",
    etiket_alt_tehlikeli: "Don't go in the water",
  },
};
function t(key, ...args) {
  const val = (CEVIRI[AKTIF_DIL] && CEVIRI[AKTIF_DIL][key] !== undefined) ? CEVIRI[AKTIF_DIL][key] : CEVIRI.tr[key];
  return typeof val === "function" ? val(...args) : val;
}

// Dört kademe net bir yeşil/sarı/turuncu/kırmızı trafik-ışığı sırası izliyor. Eskiden
// "carsaf" (mavi, dalgasız/dümdüz deniz) ve "hafif" (yeşil, az bir dalga ama hâlâ rahatça
// girilir) ayrı, net bir mavi/yeşil/turuncu/kırmızı ilerleme izliyor — sarı kasıtlı olarak
// kullanılmıyor, çünkü "hafif dalgalı" gibi aslında hâlâ iyi bir durumun sarı (uyarı rengi)
// görünmesi kullanıcıyı yanlışlıkla tedirgin ediyordu (bkz. proje notları, 2026-07-08).
const RENK_GUNDUZ = {
  carsaf:    { bg: "#DCEEFB", border: "#1D7FC2", text900: "#0A2E42", text600: "#155D82", marker: "#1D7FC2" },
  hafif:     { bg: "#DFF5E4", border: "#1FA35C", text900: "#0B3D22", text600: "#177A45", marker: "#1FA35C" },
  fazla:     { bg: "#FCE6CE", border: "#E07B1E", text900: "#472000", text600: "#95500D", marker: "#E07B1E" },
  tehlikeli: { bg: "#FADAD6", border: "#D9362E", text900: "#4A0F0B", text600: "#A3271F", marker: "#D9362E" },
  notr:      { bg: "#F1EFE8", border: "#888780", text900: "#2C2C2A", text600: "#5F5E5A", marker: "#888780" },
};
const RENK_GECE = {
  carsaf:    { bg: "#122A3D", border: "#4FB3E8", text900: "#BEE6FB", text600: "#7FCBEF", marker: "#4FB3E8" },
  hafif:     { bg: "#123321", border: "#3ECB7A", text900: "#AEECC7", text600: "#66DC9B", marker: "#3ECB7A" },
  fazla:     { bg: "#3A2A12", border: "#E8963D", text900: "#FCDFB4", text600: "#F2BC79", marker: "#E8963D" },
  tehlikeli: { bg: "#3A1712", border: "#E85A4A", text900: "#FCC9C0", text600: "#F4917F", marker: "#E85A4A" },
  notr:      { bg: "#22293A", border: "#6E7FA0", text900: "#D5DCEC", text600: "#9FAEC8", marker: "#6E7FA0" },
};
function aktifTema() {
  return document.documentElement.getAttribute('data-tema-hazirlik') || 'sabah';
}
function aktifRenkler() {
  return aktifTema() === 'gece' ? RENK_GECE : RENK_GUNDUZ;
}
// Dile göre değiştiği için sabit obje değil, fonksiyon — çağıran kod ETIKET(durum) /
// ETIKET_KISA(durum) şeklinde kullanır, dil değişince otomatik doğru dile döner.
function ETIKET(durum) { return t('etiket_' + durum); }
function ETIKET_KISA(durum) { return t('etiket_kisa_' + durum); }
// Ana başlığın (ör. "Deniz çok iyi görünüyor") hemen altında, parantez içinde gösterilen
// kısa açıklama — her kademenin ne anlama geldiğini (girilebilir mi, dikkat mi gerekir)
// tek bakışta netleştirir (kullanıcı isteği, 2026-07-08).
function ETIKET_ALT(durum) { return t('etiket_alt_' + durum); }

// Yorum balonlarında isim rengi, o kişinin seçtiği duruma göre DEĞİL sabit koyu bir
// renkle gösterilir — böylece "kim yazmış" her zaman aynı, tutarlı, okunaklı renkte
// kalır; durumu ise ayrı bir rozetle (bkz. durumRozetiSvg) zaten belirtiyoruz.
const YORUM_ISIM_RENGI = "#181818";

// Oy butonlarındaki (gb-btn) ikonlarla birebir aynı — yorum balonundaki durum rozeti
// gerçekten "oy vermişim gibi" görünsün diye aynı ikonografiyi tekrar kullanıyoruz.
const DURUM_IKON_PATH = {
  carsaf: '<line x1="3" y1="12" x2="21" y2="12"/>',
  hafif: '<path d="M2 12c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0"/>',
  fazla: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  tehlikeli: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
};
function durumRozetiSvg(durum) {
  const yol = DURUM_IKON_PATH[durum] || "";
  return `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${yol}</svg>`;
}

// === Şüpheli/uygunsuz yorum bildirme ===
// Anon kullanıcılara kalıcı silme yetkisi BİLEREK verilmedi (bkz. schema.sql) — bu yüzden
// topluluk kendi kendini denetlesin diye sadece bir sayaç artıran güvenli bir "bildir"
// düğmesi koyuyoruz. Sayaç bir eşiği geçince yorum burada (istemci tarafında) soluklaştırılır;
// fotoğraf İSE daha düşük bir eşikte tamamen gizlenir — görsel içerik metne göre daha riskli,
// bu yüzden daha az bildirimle kayboluyor. Gerçekten silmek istersen (proje sahibi olarak)
// Supabase Table Editor/Storage'dan kendin silebilirsin.
const SIKAYET_ESIK_YORUM = 3;
const SIKAYET_ESIK_FOTO = 2;
const SIKAYET_ANAHTARI = 'deniz-durumu-sikayet-edilenler';

function sikayetEdilenIdleriGetir() {
  try { return JSON.parse(localStorage.getItem(SIKAYET_ANAHTARI) || "[]"); } catch (e) { return []; }
}
function sikayetEdildiIsaretle(id) {
  try {
    const liste = sikayetEdilenIdleriGetir();
    if (!liste.includes(id)) { liste.push(id); localStorage.setItem(SIKAYET_ANAHTARI, JSON.stringify(liste)); }
  } catch (e) {}
}

const BAYRAK_IKON = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>';

// gb.id yoksa (ör. konum_metni gibi bu kolon da henüz migration'ı çalıştırılmamışsa) hiçbir
// şey göstermiyoruz — tıklanacak, RPC'ye gönderilecek bir kimlik olmaz.
function bildirButonuHtml(gb) {
  if (gb.id == null) return "";
  const bildirilmis = sikayetEdilenIdleriGetir().includes(gb.id);
  const bildirEtiket = bildirilmis ? t('bildirildi_tooltip') : t('bildir_tooltip');
  return `<button type="button" class="gb-bildir-btn" data-id="${gb.id}" ${bildirilmis ? "disabled" : ""} aria-label="${bildirEtiket}" title="${bildirEtiket}" style="background:none;border:none;padding:2px;margin:0;cursor:${bildirilmis ? "default" : "pointer"};color:${bildirilmis ? "#D9362E" : "#B7C2CC"};flex-shrink:0;display:flex;align-items:center;">${BAYRAK_IKON}</button>`;
}

// === Beğen / beğenme ===
// Bir yorum haritada BİRDEN FAZLA yerde gösterilebiliyor (hem yorum grubunun küçük
// balonunda, hem tıkladığın noktanın üstündeki balonda) — sayaç bu ikisi arasında PAYLAŞILAN
// tek bir kaynaktan (geri_bildirimler.faydali_sayisi/begenmedi_sayisi) geliyor, her yerde aynı
// sayıyı gösteriyor. "Bu tarayıcıdan zaten oy verildi mi" bilgisini de TEK bir yerde
// (localStorage) tutuyoruz ki aynı yorum iki farklı balondan ayrı ayrı oylanamasın.
const OY_ANAHTARI = 'deniz-durumu-oylanan-yorumlar'; // { [id]: 'begeni' | 'begenmedi' }
function oylananlariGetir() {
  try { return JSON.parse(localStorage.getItem(OY_ANAHTARI) || "{}"); } catch (e) { return {}; }
}
function oyKaydet(id, tur) {
  try {
    const oylar = oylananlariGetir();
    oylar[id] = tur;
    localStorage.setItem(OY_ANAHTARI, JSON.stringify(oylar));
  } catch (e) {}
}
function oySil(id) {
  try {
    const oylar = oylananlariGetir();
    delete oylar[id];
    localStorage.setItem(OY_ANAHTARI, JSON.stringify(oylar));
  } catch (e) {}
}

const IKON_BEGENI = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>';
const IKON_BEGENMEDI = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/></svg>';

// Oy verdiğin buton kilitlenMİYOR — tekrar tıklayınca oyunu geri alabilesin diye. Sadece
// KARŞI buton (aynı anda hem beğenip hem beğenmemeni önlemek için) kilitleniyor; oyunu geri
// alınca o da tekrar tıklanabilir hale geliyor (bkz. tıklama işleyicisi).
function begeniButonlariHtml(gb) {
  if (gb.id == null) return "";
  const oyDurumu = oylananlariGetir()[gb.id]; // undefined | "begeni" | "begenmedi"
  const begeniKilitli = oyDurumu === "begenmedi";
  const begenmediKilitli = oyDurumu === "begeni";
  return `<span style="display:flex;align-items:center;gap:10px;margin-top:5px;">
    <button type="button" class="gb-begeni-btn" data-id="${gb.id}" ${begeniKilitli ? "disabled" : ""} aria-label="${t('begen')}" title="${oyDurumu === "begeni" ? t('oyunu_geri_al') : t('begen')}" style="display:flex;align-items:center;gap:3px;background:none;border:none;padding:2px;margin:0;cursor:${begeniKilitli ? "default" : "pointer"};color:${oyDurumu === "begeni" ? "#1FA35C" : "#9AAEBA"};font-size:10.5px;font-weight:600;">${IKON_BEGENI}<span>${gb.faydali || 0}</span></button>
    <button type="button" class="gb-begenmedi-btn" data-id="${gb.id}" ${begenmediKilitli ? "disabled" : ""} aria-label="${t('begenme')}" title="${oyDurumu === "begenmedi" ? t('oyunu_geri_al') : t('begenme')}" style="display:flex;align-items:center;gap:3px;background:none;border:none;padding:2px;margin:0;cursor:${begenmediKilitli ? "default" : "pointer"};color:${oyDurumu === "begenmedi" ? "#D9362E" : "#9AAEBA"};font-size:10.5px;font-weight:600;">${IKON_BEGENMEDI}<span>${gb.begenmedi || 0}</span></button>
  </span>`;
}

// Türkiye kıyılarını saran denizler için kabaca bölgesel sınırlar (basit dikdörtgen yaklaşımı).
// Karadeniz fetch mesafesi çok uzun olduğundan aynı rüzgarda daha büyük dalga oluşur;
// bu yüzden eşikler denize göre değişir. Her bölge için DÖRT kademe tanımlı:
// carsaf(çok iyi) / hafif_dalgali / fazla_dalgali / tehlikeli — yani 3 sınır değeri.
// (Eskiden "iyi" diye ayrı bir beşinci kademe vardı; 2026-07-08'de "carsaf" ile birleştirildi
// çünkü sarı renkli "hafif dalgalı" ile çok yakın durup gerçek kullanıcı deneyiminde kafa
// karıştırıyordu — bkz. durumNormallestir().)
// Referans: Beaufort/Douglas Sea State skalasındaki resmi dalga yüksekliği kademeleri
// (0.1m calm/sakin, 0.2m hafif esinti, 0.5-0.6m nazik esinti, 1-1.25m orta esinti) — ama bu
// gemi güvenliği için tasarlanmış bir skala; biz "yüzücü konforu" için daha hassas (daha düşük)
// eşikler kullanıyoruz, çünkü bir yüzücü için rahatsız edici olan dalga, bir tekne için "orta" sayılır.
// Karadeniz'in fetch'i uzun olduğu için diğer denizlere göre eşikleri biraz daha yüksek tutuyoruz.
//
// Ege ikiye ayrıldı: Türkiye kıyı şeridine yakın kısım (Ayvalık, Çeşme, Kuşadası, Bodrum gibi
// bölgeler) çok sayıda ada ve koyla çevrili olduğundan rüzgarın önü kesiliyor, fetch kısalıyor,
// dalga genelde daha düşük kalıyor. Bu basit bir boylam sınırına dayanıyor (kesin bir kıyı/ada
// haritası değil), yaklaşık bir ayrım — kıyıya yakın (lon < 27.0) "korunaklı", daha açıkta
// kalan kısım (lon >= 27.0) "açık Ege" sayılıyor.
const DENIZ_BOLGELERI = [
  { id: "karadeniz", ad: "Karadeniz", adEn: "Black Sea", latMin: 40.9, latMax: 46, lonMin: 27.3, lonMax: 42,
    esikDalga:  { carsaf: 0.35, hafif: 0.6, fazla: 1.0 },
    esikRuzgar: { carsaf: 7,    hafif: 14,  fazla: 22  } },
  { id: "marmara",   ad: "Marmara",   adEn: "Sea of Marmara",   latMin: 40.3, latMax: 41.2, lonMin: 26.0, lonMax: 30.0,
    esikDalga:  { carsaf: 0.4,  hafif: 0.7, fazla: 1.2 },
    esikRuzgar: { carsaf: 10,   hafif: 18,  fazla: 28  } },
  { id: "ege_koy",   ad: "Ege (adalar/koy)", adEn: "Aegean (islands/coves)", latMin: 36.0, latMax: 40.5, lonMin: 23.0, lonMax: 27.0,
    esikDalga:  { carsaf: 0.5,  hafif: 0.9, fazla: 1.5 },
    esikRuzgar: { carsaf: 13,   hafif: 22,  fazla: 32  } },
  { id: "ege_acik",  ad: "Açık Ege", adEn: "Open Aegean", latMin: 36.0, latMax: 40.5, lonMin: 27.0, lonMax: 28.0,
    esikDalga:  { carsaf: 0.4,  hafif: 0.75, fazla: 1.3 },
    esikRuzgar: { carsaf: 10,   hafif: 18,   fazla: 28  } },
  { id: "akdeniz",   ad: "Akdeniz",   adEn: "Mediterranean",   latMin: 34.0, latMax: 37.5, lonMin: 27.5, lonMax: 36.7,
    esikDalga:  { carsaf: 0.35, hafif: 0.7, fazla: 1.2 },
    esikRuzgar: { carsaf: 10,   hafif: 18,  fazla: 28  } },
];
const VARSAYILAN_ESIK_DALGA  = { carsaf: 0.45, hafif: 0.8, fazla: 1.3 };
const VARSAYILAN_ESIK_RUZGAR = { carsaf: 10,   hafif: 18, fazla: 26  };

// Limanlar/marinalar mendirek ve dalgakıranlarla korunduğu için açık denizden çok daha sakin
// kalır — bu insan yapımı yapılar hiçbir koordinat veri setinde otomatik tespit edilemediği
// için (Nominatim/is-on-water bunu güvenilir vermiyor), bilinen limanları elle, koordinat +
// yarıçap (km) olarak tanımlıyoruz. Şimdilik Samsun bölgesiyle başlıyoruz, zamanla genişletilebilir.
// Kaynak: Samsun Limanı koordinatı (41°18'00"K, 36°22'00"D) akademik kaynaktan alındı.
const LIMANLAR = [
  { ad: "Samsun Limanı", adEn: "Port of Samsun", lat: 41.30, lon: 36.367, yaricapKm: 1.2,
    esikDalga:  { carsaf: 0.6, hafif: 1.0, fazla: 1.6 },
    esikRuzgar: { carsaf: 16,  hafif: 26,  fazla: 38  } },
];
// Kurupelit/Atakum'daki Körfez Marina'yı BURAYA sabit/gevşek eşikli bir liman olarak
// eklemedik — test ettiğimizde (bkz. proje notları) o havza güney/batıdan tam korunaklı
// ama kuzeydoğu/doğudan (denize açılan ağzından) gerçekten açık çıktı. Yani gerçek fetch
// hesabı zaten doğru sonucu veriyor; sabit "her zaman sakin" varsayımı yanlış olurdu.
// Bu nokta da her nokta gibi aşağıdaki genel fetch mesafesi hesabına bırakılıyor.
// Bölge/liman adını aktif dile göre döndürür — 'ad' TR, 'adEn' varsa EN, yoksa TR'ye düşer.
function bolgeAdi(bolgeVeyaLiman) {
  if (!bolgeVeyaLiman) return null;
  return AKTIF_DIL === 'en' && bolgeVeyaLiman.adEn ? bolgeVeyaLiman.adEn : bolgeVeyaLiman.ad;
}

// Kullanıcıya gösterilecek her metni (yorumlar, isimler VE Nominatim/OSM'den gelen yer adları)
// innerHTML'e basmadan önce kaçışlıyoruz. Yer adları herkesin düzenleyebildiği OpenStreetMap
// verisinden geldiği için, kötü niyetli biri bir bölgenin adına HTML/script gömüp o noktaya
// tıklayan/o bölgeyi gören kullanıcılarda kod çalıştırabilir (stored/reflected XSS) — bu yüzden
// sadece kullanıcı yorumları değil, yer adı alanları da mutlaka kaçışlanmalı.
function escapeHtml(deger) {
  if (deger == null) return "";
  return String(deger)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ETIKET_KISA değerleri hep küçük harfle yazılı ("hafif dalgalı" gibi). Bunları bir
// cümlenin başında göstereceğimiz zaman JS'in standart toUpperCase()'ine güvenemeyiz —
// Türkçe'de küçük "i" büyüdüğünde noktalı "İ" olur, toUpperCase() bunu bilmeden düz "I"
// yapar (klasik Türkçe/JS tuzağı). Bu yüzden ilk harfi elle, doğru şekilde büyütüyoruz.
function ilkHarfBuyuk(metin) {
  if (!metin) return "";
  if (AKTIF_DIL === 'en') return metin.charAt(0).toUpperCase() + metin.slice(1);
  const ilkHarf = metin.charAt(0) === "i" ? "İ" : metin.charAt(0).toLocaleUpperCase("tr-TR");
  return ilkHarf + metin.slice(1);
}

function kmMesafe(lat1, lon1, lat2, lon2) {
  // Haversine formülü — küçük mesafeler için yeterince hassas.
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function limanBul(lat, lon) {
  return LIMANLAR.find(l => kmMesafe(lat, lon, l.lat, l.lon) <= l.yaricapKm) || null;
}

function denizBolgesi(lat, lon) {
  const liman = limanBul(lat, lon);
  if (liman) return { id: "liman", ad: liman.ad, adEn: liman.adEn, esikDalga: liman.esikDalga, esikRuzgar: liman.esikRuzgar };
  return DENIZ_BOLGELERI.find(b => lat >= b.latMin && lat <= b.latMax && lon >= b.lonMin && lon <= b.lonMax) || null;
}

// Samsun Büyükşehir Belediyesi'nin resmi YouTube kanalından yayınlanan, denize bakan canlı
// yayınlar (samsun.bel.tr/canli). Belediyenin diğer kameraları (Opera, Saathane Meydanı, Onur
// Anıtı) denize bakmadığı için ALINMADI — Onur Anıtı özellikle: zamanla yapılan dolgularla
// artık kıyıdan uzakta kaldığı doğrulandı. Kanal embed'i kapattığı için videoyu sayfaya
// gömemiyoruz. ÖNEMLİ: belirli bir video ID'sine değil, doğrudan belediyenin kendi canlı
// yayın sayfasına LİNK VERİYORUZ — tek tek video ID'lerini denedik, birkaç saat içinde
// "video özel/kullanılamıyor" hâline gelebiliyorlar (yayın bittiğinde/yeniden başladığında
// ID değişmese bile erişilebilirlik değişebiliyor). samsun.bel.tr/canli sayfası belediye
// tarafından güncel tutulduğu için asla bayatlamıyor.
const SAMSUN_CANLI_YAYIN_SAYFASI = "https://samsun.bel.tr/canli";
const CANLI_KAMERALAR = [
  // Eski koordinat (41.343, 36.279) Çobanlı MAHALLESİ'nin genel merkeziydi, iskelenin
  // kendisi değil — kullanıcı haritada gerçek iskeleye İKİ AYRI noktadan tıklayıp doğru
  // koordinatı doğruladı (5 Temmuz 2026, 41.345/36.262 ve 41.344/36.263).
  { ad: "Çobanlı İskelesi", adEn: "Çobanlı Pier", lat: 41.345, lon: 36.262, yaricapKm: 0.4 },
  { ad: "Tütün İskelesi", adEn: "Tütün Pier", lat: 41.2929, lon: 36.3403, yaricapKm: 0.4 },
  { ad: "Amisos Tepesi", adEn: "Amisos Hill", lat: 41.31889, lon: 36.32306, yaricapKm: 0.4 },
  // OSM'den aldığımız ilk koordinat (41.3446, 36.2617) tamamen yanlış çıkmıştı (Çobanlı
  // İskelesi'nin yerine denk geliyordu) — kullanıcı haritada gerçek yeri (Baruthane
  // Mahallesi civarı) gösterip doğruladı (5 Temmuz 2026).
  { ad: "Batıpark", adEn: "Batıpark", lat: 41.325, lon: 36.328, yaricapKm: 0.4 },
];
function kameraBul(lat, lon) {
  // Çobanlı İskelesi ve Batıpark birbirine ~1.5km mesafede, yarıçapları çakışabiliyor —
  // ilk eşleşeni değil, EN YAKIN kamerayı döndürüyoruz.
  let enYakin = null, enYakinMesafe = Infinity;
  for (const k of CANLI_KAMERALAR) {
    const mesafe = kmMesafe(lat, lon, k.lat, k.lon);
    if (mesafe <= k.yaricapKm && mesafe < enYakinMesafe) { enYakin = k; enYakinMesafe = mesafe; }
  }
  return enYakin;
}

// Samsun'daki (TÜRÇEV) resmi Mavi Bayraklı plajlar — kaynak: cevrekoruma.samsun.bel.tr'nin
// yayınladığı liste, her plajın koordinatı mavibayrak.org.tr'nin kendi plaj detay
// sayfalarından (harita verisi JSON içine gömülü, "Lat"/"Lng" ya da düz ondalık biçimde)
// tek tek çekildi ve km işaretleriyle (Atakum sahilinin X. km'si) coğrafi sırayla
// tutarlılığı doğrulandı (5 Temmuz 2026).
const MAVI_BAYRAK_PLAJLAR = [
  { ad: "Golf Plajı", adEn: "Golf Beach", lat: 41.3291894, lon: 36.3008906, yaricapKm: 0.3, il: "Samsun", ilce: "Atakum" },
  { ad: "Denizevleri Plajı", adEn: "Denizevleri Beach", lat: 41.3311356, lon: 36.2932918, yaricapKm: 0.3, il: "Samsun", ilce: "Atakum" },
  { ad: "Dantel Plajı", adEn: "Dantel Beach", lat: 41.3336246, lon: 36.2854474, yaricapKm: 0.3, il: "Samsun", ilce: "Atakum" },
  { ad: "İnci Plajı", adEn: "İnci Beach", lat: 41.336843, lon: 36.276125, yaricapKm: 0.3, il: "Samsun", ilce: "Atakum" },
  { ad: "Nazar Plajı", adEn: "Nazar Beach", lat: 41.339581, lon: 36.268591, yaricapKm: 0.3, il: "Samsun", ilce: "Atakum" },
  { ad: "Palmiye Plajı", adEn: "Palmiye Beach", lat: 41.341226, lon: 36.264639, yaricapKm: 0.3, il: "Samsun", ilce: "Atakum" },
  { ad: "Denizkızı Plajı", adEn: "Denizkızı Beach", lat: 41.343829, lon: 36.259209, yaricapKm: 0.3, il: "Samsun", ilce: "Atakum" },
  { ad: "Mercan Plajı", adEn: "Mercan Beach", lat: 41.346655, lon: 36.253422, yaricapKm: 0.3, il: "Samsun", ilce: "Atakum" },
  { ad: "Gençlik Plajı", adEn: "Gençlik Beach", lat: 41.349270, lon: 36.248508, yaricapKm: 0.3, il: "Samsun", ilce: "Atakum" },
  { ad: "Marina Plajı", adEn: "Marina Beach", lat: 41.362696, lon: 36.233654, yaricapKm: 0.3, il: "Samsun", ilce: "Atakum" },
  { ad: "Körfez Plajı", adEn: "Körfez Beach", lat: 41.375486, lon: 36.227218, yaricapKm: 0.3, il: "Samsun", ilce: "Atakum" },
  { ad: "Omtel Plajı", adEn: "Omtel Beach", lat: 41.379905, lon: 36.220617, yaricapKm: 0.3, il: "Samsun", ilce: "Atakum" },
  { ad: "İncesu Plajı", adEn: "İncesu Beach", lat: 41.386054, lon: 36.212525, yaricapKm: 0.3, il: "Samsun", ilce: "Atakum" },
  { ad: "Altınkum Plajı", adEn: "Altınkum Beach", lat: 41.391935, lon: 36.205599, yaricapKm: 0.3, il: "Samsun", ilce: "Atakum" },
  { ad: "Miliç Çevre Eğitim Plajı", adEn: "Miliç Çevre Eğitim Beach", lat: 41.183968, lon: 37.037558, yaricapKm: 0.3, il: "Samsun", ilce: "Terme" },
  { ad: "Terme Karavan Kampı Plajı", adEn: "Terme Karavan Kampı Beach", lat: 41.181547, lon: 37.041092, yaricapKm: 0.3, il: "Samsun", ilce: "Terme" },

  // Antalya'daki (TÜRÇEV 2024 resmi listesi) halka açık Mavi Bayraklı plajlar — otel/tesis özel
  // plajları hariç tutuldu. Koordinatlar mavibayrak.org.tr plaj detay sayfalarından (plaj_refno)
  // çekildi, ilçe merkezine göre coğrafi makullük kontrolünden geçirildi (5 Temmuz 2026).
  // Konyaaltı Halk Plajı 11/12/13 mavibayrak.org.tr'de bulunamadığı için eklenmedi.
  { ad: "Gazipaşa Koru Halk Plajı", adEn: "Gazipaşa Koru Beach", lat: 36.245046, lon: 32.291667, yaricapKm: 0.3, il: "Antalya", ilce: "Gazipaşa" },
  { ad: "Gazipaşa Selinus Halk Plajı", adEn: "Gazipaşa Selinus Beach", lat: 36.268089, lon: 32.280252, yaricapKm: 0.3, il: "Antalya", ilce: "Gazipaşa" },
  { ad: "Gençlik Merkezi Önü Halk Plajı", adEn: "Youth Center Beach", lat: 36.537868, lon: 32.028011, yaricapKm: 0.3, il: "Antalya", ilce: "Alanya" },
  { ad: "Keykubat Doğu Halk Plajı", adEn: "Keykubat East Beach", lat: 36.537467, lon: 32.028708, yaricapKm: 0.3, il: "Antalya", ilce: "Alanya" },
  { ad: "Keykubat Batı Halk Plajı", adEn: "Keykubat West Beach", lat: 36.542995, lon: 32.015733, yaricapKm: 0.3, il: "Antalya", ilce: "Alanya" },
  { ad: "Damlataş Halk Plajı", adEn: "Damlataş Beach", lat: 36.543986, lon: 31.985183, yaricapKm: 0.3, il: "Antalya", ilce: "Alanya" },
  { ad: "Alanya Engelsiz Halk Plajı", adEn: "Alanya Accessible Beach", lat: 36.541965, lon: 31.987667, yaricapKm: 0.3, il: "Antalya", ilce: "Alanya" },
  { ad: "Kleopatra Doğu Halk Plajı", adEn: "Cleopatra East Beach", lat: 36.551038, lon: 31.976159, yaricapKm: 0.3, il: "Antalya", ilce: "Alanya" },
  // Kleopatra Batı: mavibayrak.org.tr'de ayrı refno bulunamadı, bağımsız kaynaktan yaklaşık konum (düşük güven).
  { ad: "Kleopatra Batı Halk Plajı", adEn: "Cleopatra West Beach", lat: 36.5545, lon: 31.9719, yaricapKm: 0.3, il: "Antalya", ilce: "Alanya" },
  { ad: "Manavgat Kızılot Halk Plajı", adEn: "Manavgat Kızılot Beach", lat: 36.701991, lon: 31.581923, yaricapKm: 0.3, il: "Antalya", ilce: "Manavgat" },
  { ad: "Manavgat Halk Plajı", adEn: "Manavgat Public Beach", lat: 36.729491, lon: 31.515961, yaricapKm: 0.3, il: "Antalya", ilce: "Manavgat" },
  { ad: "Manavgat Boğaz Otel Halk Plajı", adEn: "Manavgat Boğaz Otel Beach", lat: 36.745442, lon: 31.470044, yaricapKm: 0.3, il: "Antalya", ilce: "Manavgat" },
  { ad: "Nar Beach 3", adEn: "Nar Beach 3", lat: 36.765539, lon: 31.390422, yaricapKm: 0.3, il: "Antalya", ilce: "Manavgat" },
  { ad: "Nar Beach 1", adEn: "Nar Beach 1", lat: 36.767116, lon: 31.386629, yaricapKm: 0.3, il: "Antalya", ilce: "Manavgat" },
  { ad: "Manavgat Ilıca Halk Plajı", adEn: "Manavgat Ilıca Beach", lat: 36.800052, lon: 31.357252, yaricapKm: 0.3, il: "Antalya", ilce: "Manavgat" },
  { ad: "Evrenseki Halk Plajı", adEn: "Evrenseki Beach", lat: 36.764977, lon: 31.386629, yaricapKm: 0.3, il: "Antalya", ilce: "Manavgat" },
  { ad: "Serik Boğazkent Halk Plajı", adEn: "Serik Boğazkent Beach", lat: 36.835450, lon: 31.126131, yaricapKm: 0.3, il: "Antalya", ilce: "Serik" },
  // Belek Halk Plajı: mavibayrak.org.tr'deki enleme (36.503098) güvenilmedi (~40km hatalı çıkıyordu),
  // bağımsız kaynaktan doğrulanan koordinat kullanıldı.
  { ad: "Belek Halk Plajı", adEn: "Belek Public Beach", lat: 36.842724, lon: 31.078667, yaricapKm: 0.3, il: "Antalya", ilce: "Serik" },
  { ad: "Kadriye Halk Plajı", adEn: "Kadriye Public Beach", lat: 36.858079, lon: 31.005691, yaricapKm: 0.3, il: "Antalya", ilce: "Serik" },
  { ad: "Lara Halk Plajı Lazlo Beach", adEn: "Lara Lazlo Beach", lat: 36.850316, lon: 30.844921, yaricapKm: 0.3, il: "Antalya", ilce: "Muratpaşa" },
  { ad: "Lara Halk Plajı 2", adEn: "Lara Public Beach 2", lat: 36.848870, lon: 30.831980, yaricapKm: 0.3, il: "Antalya", ilce: "Muratpaşa" },
  { ad: "Lara Halk Plajı 1", adEn: "Lara Public Beach 1", lat: 36.848126, lon: 30.823076, yaricapKm: 0.3, il: "Antalya", ilce: "Muratpaşa" },
  { ad: "Lara Red&White Beach", adEn: "Lara Red&White Beach", lat: 36.847141, lon: 30.809415, yaricapKm: 0.3, il: "Antalya", ilce: "Muratpaşa" },
  { ad: "Konserve Halk Plajı", adEn: "Konserve Beach", lat: 36.853347, lon: 30.745549, yaricapKm: 0.3, il: "Antalya", ilce: "Muratpaşa" },
  { ad: "Mobil Halk Plajı", adEn: "Mobil Beach", lat: 36.856043, lon: 30.735245, yaricapKm: 0.3, il: "Antalya", ilce: "Muratpaşa" },
  { ad: "İnciraltı Halk Plajı", adEn: "İnciraltı Beach", lat: 36.859809, lon: 30.728946, yaricapKm: 0.3, il: "Antalya", ilce: "Muratpaşa" },
  { ad: "Erdal İnönü Kent Parkı Plajı", adEn: "Erdal İnönü City Park Beach", lat: 36.861506, lon: 30.727119, yaricapKm: 0.3, il: "Antalya", ilce: "Muratpaşa" },
  { ad: "Erenkuş Halk Plajı", adEn: "Erenkuş Beach", lat: 36.866191, lon: 30.723382, yaricapKm: 0.3, il: "Antalya", ilce: "Muratpaşa" },
  { ad: "Sarısu Plajı", adEn: "Sarısu Beach", lat: 36.827103, lon: 30.600031, yaricapKm: 0.3, il: "Antalya", ilce: "Konyaaltı" },
  { ad: "Kadınlar Plajı", adEn: "Women's Beach", lat: 36.821241, lon: 30.595053, yaricapKm: 0.3, il: "Antalya", ilce: "Konyaaltı" },
  { ad: "Beldibi Bahçecik Halk Plajı", adEn: "Beldibi Bahçecik Beach", lat: 36.733217, lon: 30.564634, yaricapKm: 0.3, il: "Antalya", ilce: "Kemer" },
  // Çifteçeşmeler: mavibayrak.org.tr Çamyuva ile aynı (hatalı, kopya) koordinatı vermişti; adres
  // kaydı "Beldibi Mah." olduğu için Beldibi Bahçecik'e yakın, yaklaşık konum kullanıldı (düşük güven).
  { ad: "Çifteçeşmeler Halk Plajı", adEn: "Çifteçeşmeler Beach", lat: 36.7300, lon: 30.5680, yaricapKm: 0.3, il: "Antalya", ilce: "Kemer" },
  // Göynük: mavibayrak.org.tr'de ayrı refno bulunamadı, bağımsız kaynaktan yaklaşık konum (düşük güven).
  { ad: "Göynük Halk Plajı", adEn: "Göynük Beach", lat: 36.670104, lon: 30.566990, yaricapKm: 0.3, il: "Antalya", ilce: "Kemer" },
  { ad: "Mustafa Ertuğrul Aker Halk Plajı", adEn: "Mustafa Ertuğrul Aker Beach", lat: 36.600838, lon: 30.569479, yaricapKm: 0.3, il: "Antalya", ilce: "Kemer" },
  { ad: "Çamyuva Halk Plajı", adEn: "Çamyuva Beach", lat: 36.682015, lon: 30.570035, yaricapKm: 0.3, il: "Antalya", ilce: "Kemer" },
  { ad: "Tekirova Halk Plajı", adEn: "Tekirova Beach", lat: 36.491425, lon: 30.526505, yaricapKm: 0.3, il: "Antalya", ilce: "Kemer" },
  { ad: "Kumluca Beykent Halk Plajı", adEn: "Kumluca Beykent Beach", lat: 36.307046, lon: 30.305658, yaricapKm: 0.3, il: "Antalya", ilce: "Kumluca" },
  { ad: "Kumluca Kent Parkı Halk Plajı", adEn: "Kumluca City Park Beach", lat: 36.314450, lon: 30.282530, yaricapKm: 0.3, il: "Antalya", ilce: "Kumluca" },
  { ad: "Kumluca Fener Halk Plajı", adEn: "Kumluca Fener Beach", lat: 36.314841, lon: 30.271617, yaricapKm: 0.3, il: "Antalya", ilce: "Kumluca" },
  { ad: "Demre Taşdibi Plajı", adEn: "Demre Taşdibi Beach", lat: 36.221269, lon: 29.987026, yaricapKm: 0.3, il: "Antalya", ilce: "Demre" },
  { ad: "Kaş İnceboğaz Halk Plajı 1", adEn: "Kaş İnceboğaz Beach 1", lat: 36.198289, lon: 29.618485, yaricapKm: 0.3, il: "Antalya", ilce: "Kaş" },
  { ad: "Kaş İnceboğaz Plajı 2", adEn: "Kaş İnceboğaz Beach 2", lat: 36.200703, lon: 29.624452, yaricapKm: 0.3, il: "Antalya", ilce: "Kaş" },
  { ad: "Kaş Acısu Halk Plajı", adEn: "Kaş Acısu Beach", lat: 36.207269, lon: 29.617614, yaricapKm: 0.3, il: "Antalya", ilce: "Kaş" },
  { ad: "Kalkan Halk Plajı", adEn: "Kalkan Beach", lat: 36.261806, lon: 29.417022, yaricapKm: 0.3, il: "Antalya", ilce: "Kaş" },

  // Muğla'daki (TÜRÇEV 2024 resmi listesi) halka açık Mavi Bayraklı plajlar — otel/tesis özel
  // plajları hariç tutuldu (5 Temmuz 2026). Bodrum'daki 4 plaj (Yelken, Kumbahçe, Kumbahçe
  // Giritli, Monakus) için mavibayrak.org.tr'nin kendi verisinde ciddi bir kopyalama hatası
  // bulundu (dördü de Gölköy Plajı ile birebir aynı koordinatı veriyordu) — bunlar için
  // Yandex Maps + OpenStreetMap çapraz doğrulamasıyla bağımsız koordinat kullanıldı.
  { ad: "Belceğiz Plajı", adEn: "Belceğiz Beach", lat: 36.545777, lon: 29.123850, yaricapKm: 0.3, il: "Muğla", ilce: "Fethiye" },
  { ad: "Kumburnu Plajı", adEn: "Kumburnu Beach", lat: 36.549976, lon: 29.112008, yaricapKm: 0.3, il: "Muğla", ilce: "Fethiye" },
  { ad: "Macera Parkı Plajı", adEn: "Adventure Park Beach", lat: 36.849270, lon: 28.283160, yaricapKm: 0.3, il: "Muğla", ilce: "Marmaris" },
  { ad: "Marmaris Halk Plajı", adEn: "Marmaris Public Beach", lat: 36.849242, lon: 28.262948, yaricapKm: 0.3, il: "Muğla", ilce: "Marmaris" },
  { ad: "Turaş İçmeler Plajı", adEn: "Turaş İçmeler Beach", lat: 36.808629, lon: 28.235898, yaricapKm: 0.3, il: "Muğla", ilce: "Marmaris" },
  { ad: "İçmeler Halk Plajı", adEn: "İçmeler Public Beach", lat: 36.806176, lon: 28.233316, yaricapKm: 0.3, il: "Muğla", ilce: "Marmaris" },
  { ad: "Martı Marina Plajı", adEn: "Martı Marina Beach", lat: 36.720900, lon: 28.126108, yaricapKm: 0.3, il: "Muğla", ilce: "Marmaris" },
  { ad: "Akyaka Halk Plajı", adEn: "Akyaka Public Beach", lat: 37.051197, lon: 28.324341, yaricapKm: 0.3, il: "Muğla", ilce: "Ula" },
  { ad: "Yalıçiftlik Plajı", adEn: "Yalıçiftlik Beach", lat: 36.992685, lon: 27.528772, yaricapKm: 0.3, il: "Muğla", ilce: "Bodrum" },
  // Yelken, Kumbahçe Giritli, Kumbahçe, Monakus: mavibayrak.org.tr'de kopyalama hatası vardı, bağımsız kaynaktan (düşük/orta güven).
  { ad: "Yelken Plajı", adEn: "Yelken Beach", lat: 37.019446, lon: 27.444765, yaricapKm: 0.3, il: "Muğla", ilce: "Bodrum" },
  { ad: "Kumbahçe Giritli Plajı", adEn: "Kumbahçe Giritli Beach", lat: 37.029900, lon: 27.439500, yaricapKm: 0.3, il: "Muğla", ilce: "Bodrum" },
  { ad: "Kumbahçe Plajı", adEn: "Kumbahçe Beach", lat: 37.027052, lon: 27.440175, yaricapKm: 0.3, il: "Muğla", ilce: "Bodrum" },
  { ad: "Gümbet Plajı", adEn: "Gümbet Beach", lat: 37.030042, lon: 27.407702, yaricapKm: 0.3, il: "Muğla", ilce: "Bodrum" },
  { ad: "Özgür Plajı", adEn: "Özgür Beach", lat: 37.026641, lon: 27.372955, yaricapKm: 0.3, il: "Muğla", ilce: "Bodrum" },
  { ad: "Ortakent Plajı", adEn: "Ortakent Beach", lat: 37.016590, lon: 27.336118, yaricapKm: 0.3, il: "Muğla", ilce: "Bodrum" },
  { ad: "Monakus Plajı", adEn: "Monakus Beach", lat: 37.101118, lon: 27.281337, yaricapKm: 0.3, il: "Muğla", ilce: "Bodrum" },
  { ad: "Gündoğan Plajı", adEn: "Gündoğan Beach", lat: 37.131401, lon: 27.341754, yaricapKm: 0.3, il: "Muğla", ilce: "Bodrum" },
  { ad: "Göltürkbükü Plajı", adEn: "Göltürkbükü Beach", lat: 37.129511, lon: 27.376486, yaricapKm: 0.3, il: "Muğla", ilce: "Bodrum" },
  { ad: "Gölköy Plajı", adEn: "Gölköy Beach", lat: 37.119294, lon: 27.394975, yaricapKm: 0.3, il: "Muğla", ilce: "Bodrum" },

  // İzmir'deki (TÜRÇEV 2024 resmi listesi) halka açık Mavi Bayraklı plajlar — otel/tesis özel
  // plajları hariç tutuldu (5 Temmuz 2026). Çandarlı Kale Önü Halk Plajı için mavibayrak.org.tr
  // Dikili Belediye Plajı'yla birebir aynı (kopyalanmış, hatalı) koordinat veriyordu — bağımsız
  // kaynaktan (Çandarlı Kalesi konumu) düzeltildi. Çamlıçay Halk Plajı'nın mavibayrak'ta refno'su
  // bulunamadı, bağımsız harita kaynağı kullanıldı.
  { ad: "Çukuraltı Halk Plajı", adEn: "Çukuraltı Beach", lat: 38.017802, lon: 27.090352, yaricapKm: 0.3, il: "İzmir", ilce: "Menderes" },
  { ad: "Orta Mahalle Halk Plajı", adEn: "Orta Mahalle Beach", lat: 38.050627, lon: 27.045496, yaricapKm: 0.3, il: "İzmir", ilce: "Menderes" },
  { ad: "Gümüldür Halk Plajı", adEn: "Gümüldür Beach", lat: 38.062236, lon: 27.004594, yaricapKm: 0.3, il: "İzmir", ilce: "Menderes" },
  { ad: "Ürkmez Sağlık Ocağı Halk Plajı", adEn: "Ürkmez Health Center Beach", lat: 38.076328, lon: 26.955231, yaricapKm: 0.3, il: "İzmir", ilce: "Seferihisar" },
  { ad: "Bengiler Mahallesi Halk Plajı", adEn: "Bengiler Beach", lat: 38.075231, lon: 26.947090, yaricapKm: 0.3, il: "İzmir", ilce: "Seferihisar" },
  { ad: "Doğanbey Havacılar Sitesi Halk Plajı", adEn: "Doğanbey Havacılar Beach", lat: 38.073087, lon: 26.934307, yaricapKm: 0.3, il: "İzmir", ilce: "Seferihisar" },
  { ad: "Doğanbey Sakız Ağacı Halk Plajı", adEn: "Doğanbey Sakız Ağacı Beach", lat: 38.059619, lon: 26.894512, yaricapKm: 0.3, il: "İzmir", ilce: "Seferihisar" },
  { ad: "Ömür Beldesi Halk Plajı", adEn: "Ömür Beach", lat: 38.062667, lon: 26.853479, yaricapKm: 0.3, il: "İzmir", ilce: "Seferihisar" },
  { ad: "Bahadır Mevkii Halk Plajı", adEn: "Bahadır Beach (Akarca)", lat: 38.138625, lon: 26.830658, yaricapKm: 0.3, il: "İzmir", ilce: "Seferihisar" },
  { ad: "İztur Sertur Halk Plajı", adEn: "İztur-Sertur Beach (Akarca)", lat: 38.171926, lon: 26.801207, yaricapKm: 0.3, il: "İzmir", ilce: "Seferihisar" },
  { ad: "Akarca Halk Plajı", adEn: "Akarca Beach", lat: 38.1691067, lon: 26.8065134, yaricapKm: 0.3, il: "İzmir", ilce: "Seferihisar" },
  { ad: "Gemisuyu Mevkii Halk Plajı", adEn: "Gemisuyu Beach (Akarca)", lat: 38.149055, lon: 26.823379, yaricapKm: 0.3, il: "İzmir", ilce: "Seferihisar" },
  { ad: "Büyük Akkum Halk Plajı", adEn: "Büyük Akkum Beach (Sığacık)", lat: 38.191355, lon: 26.773892, yaricapKm: 0.3, il: "İzmir", ilce: "Seferihisar" },
  { ad: "Tekke Halk Plajı", adEn: "Tekke Beach", lat: 38.328352, lon: 26.297090, yaricapKm: 0.3, il: "İzmir", ilce: "Çeşme" },
  { ad: "Dalyan Kocakarı Halk Plajı", adEn: "Dalyan Kocakarı Beach", lat: 38.360044, lon: 26.315991, yaricapKm: 0.3, il: "İzmir", ilce: "Çeşme" },
  { ad: "Ilıca Halk Plajı", adEn: "Ilıca Beach", lat: 38.308554, lon: 26.374403, yaricapKm: 0.3, il: "İzmir", ilce: "Çeşme" },
  { ad: "Kuyucak Halk Plajı", adEn: "Kuyucak Beach", lat: 38.650289, lon: 26.507476, yaricapKm: 0.3, il: "İzmir", ilce: "Karaburun" },
  { ad: "İncirlikoy Halk Plajı", adEn: "İncirlikoy Beach", lat: 38.649587, lon: 26.520459, yaricapKm: 0.3, il: "İzmir", ilce: "Karaburun" },
  { ad: "Bodrum Halk Plajı", adEn: "Bodrum Beach (Karaburun)", lat: 38.635694, lon: 26.523495, yaricapKm: 0.3, il: "İzmir", ilce: "Karaburun" },
  { ad: "Gelinkaya Halk Plajı", adEn: "Gelinkaya Beach", lat: 38.372921, lon: 26.762355, yaricapKm: 0.3, il: "İzmir", ilce: "Urla" },
  { ad: "Kum Denizi Halk Plajı", adEn: "Kum Denizi Beach", lat: 38.361536, lon: 26.782770, yaricapKm: 0.3, il: "İzmir", ilce: "Urla" },
  // Çamlıçay: mavibayrak.org.tr'de refno bulunamadı, bağımsız harita kaynağı (orta güven).
  { ad: "Çamlıçay Halk Plajı", adEn: "Çamlıçay Beach", lat: 38.370953, lon: 26.849657, yaricapKm: 0.3, il: "İzmir", ilce: "Urla" },
  { ad: "Kalabak Halk Plajı", adEn: "Kalabak Beach", lat: 38.355661, lon: 26.807218, yaricapKm: 0.3, il: "İzmir", ilce: "Urla" },
  { ad: "Zeytinalanı Halk Plajı", adEn: "Zeytinalanı Beach", lat: 38.370693, lon: 26.839490, yaricapKm: 0.3, il: "İzmir", ilce: "Urla" },
  { ad: "2. Liman Halk Plajı", adEn: "2nd Harbor Beach", lat: 38.373781, lon: 26.862489, yaricapKm: 0.3, il: "İzmir", ilce: "Güzelbahçe" },
  { ad: "Karakum Halk Plajı", adEn: "Karakum Beach", lat: 38.663881, lon: 26.742175, yaricapKm: 0.3, il: "İzmir", ilce: "Foça" },
  { ad: "Sosyal Tesisler Önü Plajı", adEn: "Sosyal Tesisler Beach", lat: 38.665410, lon: 26.752049, yaricapKm: 0.3, il: "İzmir", ilce: "Foça" },
  { ad: "Kumburnu Halk Plajı", adEn: "Kumburnu Beach", lat: 38.691714, lon: 26.731687, yaricapKm: 0.3, il: "İzmir", ilce: "Foça" },
  { ad: "Yenifoça Halk Plajı", adEn: "Yenifoça Beach", lat: 38.7425, lon: 26.8356, yaricapKm: 0.3, il: "İzmir", ilce: "Foça" },
  { ad: "Çandarlı Doğu Halk Plajı", adEn: "Çandarlı East Beach", lat: 38.938873, lon: 26.940629, yaricapKm: 0.3, il: "İzmir", ilce: "Dikili" },
  // Çandarlı Kale Önü: mavibayrak.org.tr Dikili Belediye Plajı'yla birebir aynı (kopya, hatalı)
  // koordinat vermişti; Çandarlı Kalesi'nin bağımsız doğrulanan konumu kullanıldı (düşük/orta güven).
  { ad: "Çandarlı Kale Önü Halk Plajı", adEn: "Çandarlı Castle Beach", lat: 38.939977, lon: 26.937861, yaricapKm: 0.3, il: "İzmir", ilce: "Dikili" },
  { ad: "Dikili Belediye Plajı", adEn: "Dikili Municipal Beach", lat: 39.077798, lon: 26.887171, yaricapKm: 0.3, il: "İzmir", ilce: "Dikili" },
  { ad: "Dikili Belediye Plajı 2", adEn: "Dikili Municipal Beach 2", lat: 39.07587, lon: 26.88702, yaricapKm: 0.3, il: "İzmir", ilce: "Dikili" },
  { ad: "Dikili Plaj Sporları Halk Plajı", adEn: "Dikili Beach Sports Beach", lat: 39.0912, lon: 26.8812, yaricapKm: 0.3, il: "İzmir", ilce: "Dikili" },

  // Aydın'daki (TÜRÇEV 2024 resmi listesi) halka açık Mavi Bayraklı plajlar (5 Temmuz 2026).
  // Güvercinada Plajı için mavibayrak.org.tr'nin kendi sayfası ~4km hatalı koordinat veriyordu
  // (Wikipedia'daki gerçek Güvercinada konumuyla uyuşmuyordu) — Yandex Maps'ten doğrulanan
  // koordinat kullanıldı.
  { ad: "Didim Oteller Önü Plajı", adEn: "Didim Hotels Front Beach", lat: 37.356924, lon: 27.287326, yaricapKm: 0.3, il: "Aydın", ilce: "Didim" },
  { ad: "Didim Altınkum Plajı", adEn: "Didim Altınkum Beach", lat: 37.355216, lon: 27.277679, yaricapKm: 0.3, il: "Aydın", ilce: "Didim" },
  { ad: "Didim 2. Koy Plajı", adEn: "Didim 2nd Cove Beach", lat: 37.346728, lon: 27.269814, yaricapKm: 0.3, il: "Aydın", ilce: "Didim" },
  { ad: "Didim 3. Koy Plajı", adEn: "Didim 3rd Cove Beach", lat: 37.343306, lon: 27.262710, yaricapKm: 0.3, il: "Aydın", ilce: "Didim" },
  { ad: "Tavşanburnu Tabiat Parkı Plajı", adEn: "Tavşanburnu Nature Park Beach", lat: 37.418843, lon: 27.220435, yaricapKm: 0.3, il: "Aydın", ilce: "Didim" },
  { ad: "Ada Kum Plajı", adEn: "Ada Kum Beach", lat: 37.741157, lon: 27.249020, yaricapKm: 0.3, il: "Aydın", ilce: "Kuşadası" },
  { ad: "Sevgi Plajı", adEn: "Sevgi (Love) Beach", lat: 37.743979, lon: 27.250982, yaricapKm: 0.3, il: "Aydın", ilce: "Kuşadası" },
  { ad: "Kadınlar Denizi Plajı", adEn: "Ladies Beach", lat: 37.845499, lon: 27.243245, yaricapKm: 0.3, il: "Aydın", ilce: "Kuşadası" },
  // Güvercinada: mavibayrak.org.tr'nin verdiği koordinat ~4km hatalıydı, bağımsız kaynaktan düzeltildi.
  { ad: "Güvercinada Plajı", adEn: "Pigeon Island Beach", lat: 37.866896, lon: 27.260813, yaricapKm: 0.3, il: "Aydın", ilce: "Kuşadası" },
  { ad: "Kuştur Plajı", adEn: "Kuştur Beach", lat: 37.901987, lon: 27.272597, yaricapKm: 0.3, il: "Aydın", ilce: "Kuşadası" },

  // Balıkesir'deki (TÜRÇEV 2024 resmi listesi) halka açık Mavi Bayraklı plajlar (5 Temmuz 2026).
  // Bu ilde mavibayrak.org.tr'nin kendi verisinde alışılmadık sayıda hata bulundu (6/30) — bazı
  // koordinatlar açık denizde/komşu ilçede çıkıyordu; bunlar Yandex Maps/Vikipedi ile düzeltildi
  // veya komşu plaj kümesine göre düşük güvenle tahmin edildi (aşağıda işaretli).
  { ad: "Uzungöl Plajı", adEn: "Uzungöl Beach", lat: 39.205, lon: 26.740, yaricapKm: 0.3, il: "Balıkesir", ilce: "Ayvalık" }, // DÜŞÜK GÜVEN - mavibayrak açık denizde çıkıyordu, komşu kümeye göre tahmini
  { ad: "Siteler Plajı", adEn: "Siteler Beach", lat: 39.197720, lon: 26.743582, yaricapKm: 0.3, il: "Balıkesir", ilce: "Ayvalık" },
  { ad: "Kumadası Plajı", adEn: "Kumadası Beach", lat: 39.208653, lon: 26.733489, yaricapKm: 0.3, il: "Balıkesir", ilce: "Ayvalık" },
  { ad: "Sarımsaklı 3 Halk Plajı", adEn: "Sarımsaklı 3 Public Beach", lat: 39.264, lon: 26.643, yaricapKm: 0.3, il: "Balıkesir", ilce: "Ayvalık" }, // DÜŞÜK GÜVEN - mavibayrak açık denizde çıkıyordu, komşu kümeye göre tahmini
  { ad: "Oteller Önü Sarımsaklı Halk Plajı", adEn: "Oteller Önü Sarımsaklı Public Beach", lat: 39.267368, lon: 26.658614, yaricapKm: 0.3, il: "Balıkesir", ilce: "Ayvalık" },
  { ad: "Sarımsaklı 2 Halk Plajı", adEn: "Sarımsaklı 2 Public Beach", lat: 39.267013, lon: 26.645770, yaricapKm: 0.3, il: "Balıkesir", ilce: "Ayvalık" },
  { ad: "Paşalimanı Tesisleri", adEn: "Paşalimanı Facility Beach", lat: 39.299734, lon: 26.662429, yaricapKm: 0.3, il: "Balıkesir", ilce: "Ayvalık" },
  { ad: "Kapri Plajı", adEn: "Kapri Beach", lat: 39.312178, lon: 26.676241, yaricapKm: 0.3, il: "Balıkesir", ilce: "Ayvalık" },
  { ad: "Ayvalık Halk Plajı (Duba)", adEn: "Ayvalık Public Beach (Duba)", lat: 39.344187, lon: 26.695901, yaricapKm: 0.3, il: "Balıkesir", ilce: "Ayvalık" },
  { ad: "Gömeç Dalış Köyü Plajı", adEn: "Gömeç Diving Village Beach", lat: 39.4256, lon: 26.8616, yaricapKm: 0.3, il: "Balıkesir", ilce: "Gömeç" }, // ORTA GÜVEN - mavibayrak hatalıydı, Karaağaç Mahallesi merkezine göre düzeltildi
  { ad: "Gadana Halk Plajı", adEn: "Gadana Public Beach", lat: 39.445078, lon: 26.857126, yaricapKm: 0.3, il: "Balıkesir", ilce: "Burhaniye" },
  { ad: "Bağlar Burnu Halk Plajı", adEn: "Bağlar Burnu Public Beach", lat: 39.471574, lon: 26.858014, yaricapKm: 0.3, il: "Balıkesir", ilce: "Burhaniye" },
  { ad: "Yalı Plajı", adEn: "Yalı Beach", lat: 39.475259, lon: 26.869634, yaricapKm: 0.3, il: "Balıkesir", ilce: "Burhaniye" },
  { ad: "Burhaniye Marina Plajı", adEn: "Burhaniye Marina Beach", lat: 39.482770, lon: 26.923536, yaricapKm: 0.3, il: "Balıkesir", ilce: "Burhaniye" },
  { ad: "Öğretmenler Mahallesi Halk Plajı", adEn: "Öğretmenler District Public Beach", lat: 39.487709, lon: 26.931363, yaricapKm: 0.3, il: "Balıkesir", ilce: "Burhaniye" },
  { ad: "Ören Mahallesi Halk Plajı", adEn: "Ören District Public Beach", lat: 39.498165, lon: 26.932162, yaricapKm: 0.3, il: "Balıkesir", ilce: "Burhaniye" },
  { ad: "Edremit Altınkum Halk Plajı", adEn: "Edremit Altınkum Public Beach", lat: 39.569343, lon: 26.942685, yaricapKm: 0.3, il: "Balıkesir", ilce: "Edremit" },
  { ad: "Akçay Sarıkız Halk Plajı", adEn: "Akçay Sarıkız Public Beach", lat: 39.582415, lon: 26.924834, yaricapKm: 0.3, il: "Balıkesir", ilce: "Edremit" },
  { ad: "Melek Hanım Sitesi Plajı", adEn: "Melek Hanım Sitesi Beach", lat: 39.583840, lon: 26.891565, yaricapKm: 0.3, il: "Balıkesir", ilce: "Edremit" },
  { ad: "İğdeli Plajı", adEn: "İğdeli Beach", lat: 39.581679, lon: 26.873252, yaricapKm: 0.3, il: "Balıkesir", ilce: "Edremit" },
  { ad: "Özdemir Sitesi Önü Plajı", adEn: "Özdemir Sitesi Önü Beach", lat: 39.570841, lon: 26.770263, yaricapKm: 0.3, il: "Balıkesir", ilce: "Edremit" },
  { ad: "Antandros Halk Plajı", adEn: "Antandros Public Beach", lat: 39.564449, lon: 26.760499, yaricapKm: 0.3, il: "Balıkesir", ilce: "Edremit" },
  { ad: "Vali Konağı Plajı", adEn: "Vali Konağı Beach", lat: 39.563724, lon: 26.756611, yaricapKm: 0.3, il: "Balıkesir", ilce: "Edremit" },
  { ad: "Kurbağalı Dere Halk Plajı", adEn: "Kurbağalı Dere Public Beach", lat: 40.389993, lon: 27.796992, yaricapKm: 0.3, il: "Balıkesir", ilce: "Erdek" },
  { ad: "Ocaklar Halk Plajı", adEn: "Ocaklar Public Beach", lat: 40.441898, lon: 27.755319, yaricapKm: 0.3, il: "Balıkesir", ilce: "Erdek" }, // ORTA GÜVEN - mavibayrak Moda Plajı ile birebir aynı (kopya) koordinat vermişti, bağımsız kaynaktan düzeltildi
  { ad: "Moda Plajı", adEn: "Moda Beach", lat: 40.440, lon: 27.750, yaricapKm: 0.3, il: "Balıkesir", ilce: "Erdek" }, // DÜŞÜK GÜVEN - mavibayrak Ocaklar ile birebir aynı (kopya) koordinat vermişti, bağımsız kaynak yok, Ocaklar'a yakın tahmini
  { ad: "Bakraç Plajı", adEn: "Bakraç Beach", lat: 40.412321, lon: 27.931808, yaricapKm: 0.3, il: "Balıkesir", ilce: "Erdek" },
  { ad: "Dalyan Plajı", adEn: "Dalyan Beach", lat: 40.411891, lon: 27.926533, yaricapKm: 0.3, il: "Balıkesir", ilce: "Erdek" },
  { ad: "Abroz Plajı", adEn: "Abroz Beach", lat: 40.649443, lon: 27.660605, yaricapKm: 0.3, il: "Balıkesir", ilce: "Marmara (Adası)" }, // ORTA-İYİ GÜVEN - mavibayrak hatalıydı, Yandex Maps'ten düzeltildi
  { ad: "Avşa Halk Plajı", adEn: "Avşa Public Beach", lat: 40.5067, lon: 27.5114, yaricapKm: 0.3, il: "Balıkesir", ilce: "Marmara (Adası)" }, // ORTA GÜVEN - mavibayrak hatalıydı, ada merkez koordinatı kullanıldı
];
function maviBayrakBul(lat, lon) {
  let enYakin = null, enYakinMesafe = Infinity;
  for (const p of MAVI_BAYRAK_PLAJLAR) {
    const mesafe = kmMesafe(lat, lon, p.lat, p.lon);
    if (mesafe <= p.yaricapKm && mesafe < enYakinMesafe) { enYakin = p; enYakinMesafe = mesafe; }
  }
  return enYakin;
}

// Resmi Mavi Bayrak sertifikası OLMAYAN, ama gerçekten var olan halka açık plajlar/sahiller —
// TÜRÇEV listesinde yer almadığı için MAVI_BAYRAK_PLAJLAR'dan AYRI tutuluyor: buradaki hiçbir
// nokta "TÜRÇEV sertifikalı" rozetini tetiklemez, sadece "Halka Açık Plaj" olarak işaretlenir.
// Koordinatlar OpenStreetMap (natural=beach poligonları, Overpass) ve/veya Nominatim üzerinden
// gerçek yerleşim/plaj adlarından türetildi, uydurulmadı (2026-07-08).
const HALK_PLAJLARI = [
  { ad: "Mert Plajı", adEn: "Mert Beach", lat: 41.2817297, lon: 36.3522963, yaricapKm: 0.3, il: "Samsun", ilce: "İlkadım" },
  { ad: "Fener Plajı", adEn: "Fener Beach", lat: 41.3156559, lon: 36.3371924, yaricapKm: 0.3, il: "Samsun", ilce: "İlkadım" },
  { ad: "Kumcağız Plajı", adEn: "Kumcağız Beach", lat: 41.4987586, lon: 36.1191845, yaricapKm: 0.6, il: "Samsun", ilce: "19 Mayıs" }, // OSM natural=coastline'dan Kumcağız Mahallesi'ne en yakın nokta (~1km), köy merkezi karada kaldığı için sahile kaydırıldı
  { ad: "Dereköy Plajı", adEn: "Dereköy Beach", lat: 41.4771024, lon: 36.1235011, yaricapKm: 0.6, il: "Samsun", ilce: "19 Mayıs" }, // aynı yöntem, Dereköy'e en yakın gerçek sahil noktası (~0.5km)
  { ad: "Çaltı Plajı", adEn: "Çaltı Beach", lat: 41.303664, lon: 36.5736606, yaricapKm: 0.6, il: "Samsun", ilce: "Çarşamba" }, // aynı yöntem, Çaltı köyüne en yakın gerçek sahil noktası (~4km, bölge OSM'de seyrek haritalanmış)
  { ad: "Yakakent Sahili", adEn: "Yakakent Beach", lat: 41.634951, lon: 35.5315896, yaricapKm: 1.2, il: "Samsun", ilce: "Yakakent" },
  { ad: "Göçkün Plajı", adEn: "Göçkün Beach", lat: 41.6369763, lon: 35.6268500, yaricapKm: 0.4, il: "Samsun", ilce: "Alaçam" },
  { ad: "Etyemez Plajı", adEn: "Etyemez Beach", lat: 41.6328058, lon: 35.5768190, yaricapKm: 0.4, il: "Samsun", ilce: "Alaçam" },
];
function halkPlajiBul(lat, lon) {
  let enYakin = null, enYakinMesafe = Infinity;
  for (const p of HALK_PLAJLARI) {
    const mesafe = kmMesafe(lat, lon, p.lat, p.lon);
    if (mesafe <= p.yaricapKm && mesafe < enYakinMesafe) { enYakin = p; enYakinMesafe = mesafe; }
  }
  return enYakin;
}

const SIRA_DURUM = ["carsaf", "hafif", "fazla", "tehlikeli"];

function tekOlcutDurumu(deger, esik) {
  if (deger == null) return null;
  if (deger < esik.carsaf) return "carsaf";
  if (deger < esik.hafif) return "hafif";
  if (deger < esik.fazla) return "fazla";
  return "tehlikeli";
}

// Her ölçütü 0 (çarşaf) ile 4 (tehlikeli) arası bir puana çeviriyoruz.
function durumPuani(durum) {
  return durum == null ? null : SIRA_DURUM.indexOf(durum);
}

// Dalga, rüzgar ve hamle AYRI AYRI değerlendirilip puanlanıyor, sonra AĞIRLIKLI ORTALAMASI
// alınıyor — "en kötüsü kazanır" yerine bu yöntemi kullanıyoruz, çünkü tek bir ölçütün
// (özellikle anlık hamle gibi kısa süreli bir değerin) tek başına genel sonucu belirlemesi
// gerçek durumu olduğundan kötü gösterebilir. Ağırlıklar:
//  - Dalga yüksekliği (0.55): asıl, doğrudan gözle görülen gösterge — en güvenilir ölçüt.
//  - Rüzgar hızı (0.30): dalgayı oluşturan sürekli sebep, ama dalga zaten bunu yansıtıyor.
//  - Hamle (0.15): anlık, henüz dalgaya yansımamış olabilir — düşük ama sıfır değil ağırlık.
//
// Rüzgar dalgası vs swell ayrımı: Open-Meteo toplam dalga yüksekliğinin yanında, onu oluşturan
// iki bileşeni de ayrı veriyor — "wind_wave" (yerel rüzgarın az önce ürettiği, kısa periyotlu,
// huysuz dalga) ve "swell" (uzaktan gelen, uzun periyotlu, düzgün/yumuşak dalga). Aynı toplam
// yükseklikte bile, bu ikisinin oranı denizin "hissini" değiştirir: rüzgar dalgası baskınsa ve
// kısa periyotluysa (4 saniyenin altı — kaynaklı: deniz güvenliği literatüründe 4-5sn altı
// "çırpıntılı/tehlikeli" sayılıyor, bkz. NOAA Dominant Wave Period rehberi), deniz gerçekte
// daha rahatsız edici olur — bu yüzden böyle durumlarda yarım puan ekliyoruz. Ama bunu SADECE
// dalga zaten bir miktar varken (0.25m üstü) uyguluyoruz; yoksa çok küçük dalgalarda bile
// yanlış alarm verir.
function durumDenizden(dalgaM, kmh, gustKmh, windWaveM, windWavePeriyot, lat, lon, ozelEsik, swellM, swellPeriyot) {
  // ozelEsik varsa (gerçek zamanlı fetch hesabından geldiyse) onu kullan; yoksa elle
  // tanımlı liman/bölge sistemine düş. Liman gibi KESİN bilinen noktalar her zaman
  // fetch tahmininden daha güvenilir kabul edilip önceliklidir (limanBul kontrolü
  // çağıran kodda zaten yapılıyor, ozelEsik sadece liman DEĞİLSE gönderiliyor).
  const bolge = denizBolgesi(lat, lon);
  // ÖNEMLİ: fetch hesabı SADECE yerel rüzgarın o an estiği yöndeki açık su mesafesine
  // bakar — rüzgar karadan esiyorsa (bkz. yukarıdaki not) bu mesafe gerçekten sıfıra
  // yakın olur ve dalga eşiklerini haklı olarak gevşetir. AMA "swell" (uzaktaki, farklı
  // yönde esen bir fırtınanın ürettiği, yerel rüzgardan bağımsız, uzun periyotlu dalga)
  // bu yerel engelden hiç etkilenmez — zaten açık sudan gelip kıyıya ulaşmıştır. Belirgin
  // bir swell varken yerel fetch'e göre gevşetilmiş eşiği kullanmak, "kara rüzgarı esiyor,
  // deniz sakin olmalı" varsayımıyla gerçek swell'i gözden kaçırabilir — bu yüzden swell
  // belirginse (>=0.15m VE >=6sn periyot, kısa/huysuz yerel dalgadan ayırt etmek için)
  // dalga eşiği için bölgenin standart (gevşetilmemiş) değerine dönüyoruz.
  const esikDalga = (ozelEsik && !swellBelirginMi(swellM, swellPeriyot)) ? ozelEsik.esikDalga : (bolge ? bolge.esikDalga : VARSAYILAN_ESIK_DALGA);
  const esikRuzgar = ozelEsik ? ozelEsik.esikRuzgar : (bolge ? bolge.esikRuzgar : VARSAYILAN_ESIK_RUZGAR);
  // Hamle eşiği, ortalama rüzgar eşiğinden biraz daha gevşek tutuluyor — kısa süreli ani
  // esintiler ortalama rüzgar kadar belirleyici olmasın, ama tamamen göz ardı edilmesin.
  const esikHamle = {
    carsaf: esikRuzgar.carsaf * 1.6,
    hafif: esikRuzgar.hafif * 1.4, fazla: esikRuzgar.fazla * 1.3,
  };

  const puanDalga = durumPuani(tekOlcutDurumu(dalgaM, esikDalga));
  const puanRuzgar = durumPuani(tekOlcutDurumu(kmh, esikRuzgar));
  const puanHamle = durumPuani(tekOlcutDurumu(gustKmh, esikHamle));

  const agirlikli = [
    { puan: puanDalga, agirlik: 0.55 },
    { puan: puanRuzgar, agirlik: 0.30 },
    { puan: puanHamle, agirlik: 0.15 },
  ].filter(x => x.puan != null);

  if (agirlikli.length === 0) return "hafif"; // hiç veri yoksa temkinli ol

  const toplamAgirlik = agirlikli.reduce((s, x) => s + x.agirlik, 0);
  const agirlikliOrtalama = agirlikli.reduce((s, x) => s + x.puan * x.agirlik, 0) / toplamAgirlik;
  let puanSonuc = Math.round(agirlikliOrtalama);
  puanSonuc = Math.max(0, Math.min(SIRA_DURUM.length - 1, puanSonuc));
  let sonuc = SIRA_DURUM[puanSonuc];

  // Rüzgar dalgası (huysuz bileşen) zaten hissedilir büyüklükteyse (0.25m üstü) VE periyodu
  // kısaysa (4 saniyenin altı), bir kademe daha temkinli ol — "swell" değil gerçekten yerel
  // rüzgarın az önce ürettiği çırpıntılı bir deniz olduğu anlamına gelir.
  if (windWaveM != null && windWaveM >= 0.25 && windWavePeriyot != null && windWavePeriyot < 4) {
    const indeks = Math.min(SIRA_DURUM.indexOf(sonuc) + 1, SIRA_DURUM.length - 1);
    sonuc = SIRA_DURUM[indeks];
  }

  return sonuc;
}

const state = {
  marker: null,
  durumCircle: null,
  lat: null,
  lon: null,
  geriBildirimlerYerel: {},
  veriCekSayac: 0,
  konumMetni: null,
  secilenGB: null,
  bizimDurum: null,
  gunOfset: 0, // 0 = bugün/şimdi (gerçek veri), 1..GUN_SAYISI-1 = ileri günlerin tahmini
};

// SAYFA_KONUM, sadece il/ilçe sayfalarında (bkz. generate-pages.js) tanımlanan bir global —
// tanımlıysa harita doğrudan o bölgede açılır, Türkiye geneli gösterip sonra "zıplamaz".
const map = L.map('map', {
  zoomControl: true,
  center: window.SAYFA_KONUM ? [window.SAYFA_KONUM.lat, window.SAYFA_KONUM.lon] : [39.0, 35.5],
  zoom: window.SAYFA_KONUM ? (window.SAYFA_KONUM.zoom || 12) : 6,
});
// Stilize (çizilmiş) haritalarda kumsal/deniz/beton gibi alanlar hep TEK TİP, kategoriye
// göre boyanmış renkte görünür — "gerçek renk" diye bir şey yoktur, hepsi aynı sarı/mavi
// kod. Bunun yerine Esri'nin ücretsiz, anahtar gerektirmeyen uydu görüntüsü katmanını
// kullanıyoruz: kumsal gerçekte ne renkse o, deniz gerçek tonunda, beton/kırsal alanlar
// gerçek dokusuyla görünür — ve yakınlaştıkça gerçek çözünürlük arttığı için görüntü zaten
// doğal olarak daha canlı/detaylı olur. Üstüne, yer isimleri için ayrı bir etiket katmanı
// (Reference/World_Boundaries_and_Places) ekliyoruz — bu SADECE il/ilçe/mahalle/su adları
// içerir, yol ağını vurgulamaz (önceki isteğimiz: yol haritası gibi görünmesin).
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  maxZoom: 19,
}).addTo(map);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19,
  opacity: 0.85,
}).addTo(map);
// Haritayı tüm ekranı kaplayacak şekilde büyütüp küçültme kontrolü — telefonda ve
// bilgisayarda haritayı çok daha büyük kullanabilmek için (bkz. #map.map-tam-ekran CSS'i).
const IKON_BUYUT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
const IKON_KUCULT = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3v3a2 2 0 0 1-2 2H4M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/></svg>';
let haritaTamEkranAktif = false;
function haritaTamEkranAcKapat() {
  haritaTamEkranAktif = !haritaTamEkranAktif;
  document.getElementById('map').classList.toggle('map-tam-ekran', haritaTamEkranAktif);
  document.body.classList.toggle('harita-tam-ekran-acik', haritaTamEkranAktif);
  const btn = document.getElementById('map-buyut-btn');
  if (btn) {
    btn.innerHTML = haritaTamEkranAktif ? IKON_KUCULT : IKON_BUYUT;
    btn.title = haritaTamEkranAktif ? t('harita_kucult') : t('harita_buyut');
    btn.setAttribute('aria-label', btn.title);
  }
  if (haritaTamEkranAktif) {
    // Harita büyütülünce, altta kalıp görünmeyen veri kartını haritanın içinde sağ üstte
    // yüzen bir panel olarak gösteriyoruz (zaten bir veri varsa).
    if (state.lat != null) tamEkranVeriGoster();
  } else {
    // Küçültürken zamanlayıcıyı ve gizli durumunu temizliyoruz ki bir sonraki büyütmede
    // kart baştan görünür başlasın.
    clearTimeout(tamEkranVeriTimeout);
    document.getElementById('status-card').classList.remove('tam-ekran-gizli');
    document.getElementById('tam-ekran-veri-kapat').classList.remove('tam-ekran-gizli');
  }
  // Tam ekran kenar sekmesinin görünürlüğü de (bkz. yakinYorumlariDurumGuncelle)
  // haritaTamEkranAktif'e bağlı olduğu için, büyüt/küçült her tıklamada hemen güncellenir.
  yakinYorumlariDurumGuncelle();
  // CSS boyut değişimi bir sonraki karede tamamlanır, harita boyutunu ondan sonra tazeliyoruz.
  setTimeout(() => map.invalidateSize(), 150);
}

// Tam ekran haritada veri kartını gösterir ve 13sn etkileşimsiz kalırsa otomatik gizler —
// kullanıcı çarpıya basarak da istediği an elle kapatabilir (bkz. #tam-ekran-veri-kapat).
let tamEkranVeriTimeout = null;
// Kullanıcı çarpıya basıp paneli kapattıktan SONRA, aynı nokta için arka planda bitmiş bir
// kıyı şekli (fetch mesafesi) hesabı kartı yeniden çizerse (bkz. kartiCiz -> tamEkranVeriGoster
// her render'da çağrılıyor), panel istemeden tekrar açılıyordu — "1. tıklamada tekrar açılıyor"
// diye bildirilen hata buydu. Bu bayrak, kullanıcı BİLEREK kapattıysa yeni bir nokta
// seçilene kadar (bkz. noktayaGit) otomatik yeniden açılmayı engelliyor.
let tamEkranPanelKapatildiMi = false;
function tamEkranVeriGoster() {
  if (!haritaTamEkranAktif || tamEkranPanelKapatildiMi) return;
  document.getElementById('status-card').classList.remove('tam-ekran-gizli');
  document.getElementById('tam-ekran-veri-kapat').classList.remove('tam-ekran-gizli');
  clearTimeout(tamEkranVeriTimeout);
  tamEkranVeriTimeout = setTimeout(() => {
    document.getElementById('status-card').classList.add('tam-ekran-gizli');
    document.getElementById('tam-ekran-veri-kapat').classList.add('tam-ekran-gizli');
  }, 13000);
}
document.getElementById('tam-ekran-veri-kapat').addEventListener('click', () => {
  tamEkranPanelKapatildiMi = true;
  clearTimeout(tamEkranVeriTimeout);
  document.getElementById('status-card').classList.add('tam-ekran-gizli');
  document.getElementById('tam-ekran-veri-kapat').classList.add('tam-ekran-gizli');
});
const buyutKontrol = L.control({ position: 'topright' });
buyutKontrol.onAdd = function () {
  const div = L.DomUtil.create('div', 'leaflet-bar map-buyut-kontrol');
  div.innerHTML = `<a href="#" id="map-buyut-btn" title="${t('harita_buyut')}" aria-label="${t('harita_buyut')}" role="button">${IKON_BUYUT}</a>`;
  L.DomEvent.disableClickPropagation(div);
  L.DomEvent.on(div, 'click', (e) => {
    L.DomEvent.preventDefault(e);
    haritaTamEkranAcKapat();
  });
  return div;
};
buyutKontrol.addTo(map);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && haritaTamEkranAktif) haritaTamEkranAcKapat();
});

function konumAnahtari(lat, lon) {
  return lat.toFixed(2) + "," + lon.toFixed(2);
}

function svgDalgaPattern(renkHex, yogunluk) {
  const dalgaSayisi = 3;
  let paths = "";
  for (let i = 0; i < dalgaSayisi; i++) {
    const y = 22 + i * 6;
    const amp = 10 + i * 4 - yogunluk;
    paths += `<path d="M0,${y} Q37.5,${amp} 75,${y} T150,${y} T225,${y} T300,${y}" fill="none" stroke="${renkHex}" stroke-width="2.5" stroke-linecap="round" opacity="${1 - i * 0.28}"/>`;
  }
  return `<svg class="wavepattern" viewBox="0 0 300 44" aria-hidden="true">${paths}</svg>`;
}

// "Çarşaf gibi" kartına özel: diğer 4 durumun hepsi aynı dalgalı çizgiyi kullandığından,
// bu kartın (rengi sayfanın kendi mavi zeminine en yakın olan) sayfadan ayrışması zorlaşıyordu.
// Renk paletine dokunmadan, sadece bu tek durum için düz/yatay çizgiler çiziyoruz — "çarşaf"
// (ütülü, kırışıksız yatak çarşafı) fikrini doğrudan şekle taşıyıp diğerlerinden şekil
// olarak da ayırt edilmesini sağlıyor.
function svgDuzCizgiPattern(renkHex) {
  const cizgiSayisi = 3;
  let paths = "";
  for (let i = 0; i < cizgiSayisi; i++) {
    const y = 20 + i * 8;
    paths += `<path d="M0,${y} L300,${y}" fill="none" stroke="${renkHex}" stroke-width="2" stroke-linecap="round" opacity="${0.9 - i * 0.28}"/>`;
  }
  return `<svg class="wavepattern" viewBox="0 0 300 44" aria-hidden="true">${paths}</svg>`;
}

function zamanFormat(ts) {
  const fark = Math.round((Date.now() - ts) / 60000);
  if (fark < 1) return t('az_once');
  if (fark < 120) return t('dk_once', fark);
  return t('sa_once', Math.round(fark / 60));
}

// Bugünün kalan saatleri için kısa bir rüzgar+dalga şeridi oluşturur (sadece şu andan sonraki saatler).
// suAndakiZamanStr: API'nin "current.time" alanı (örn. "2026-07-01T22:15") — TIKLANAN
// NOKTANIN yerel saatini verir. Bunun yerine new Date().getHours() kullanmak tarayıcının
// KENDİ saat dilimini kullanır; tıklanan nokta tarayıcıdan farklı bir saat diliminde ise
// (örn. yurt dışından bir Türkiye kıyısına bakan biri) "şimdi" yanlış saate denk gelirdi.
// hourly.time de aynı "YYYY-MM-DDTHH:mm" biçiminde, aynı yerel saatte geldiği için Date
// nesnesine hiç çevirmeden, doğrudan metinden saat basamağını okuyoruz — belirsizlik yok.
// ÖNEMLİ: past_days=1 eklediğimizden beri dizi DÜNÜN saatlerini de içeriyor — bu yüzden
// artık sadece "saat >= şimdiki saat" diye bakmıyoruz (dünün öğleden sonrası da bu koşulu
// sağlar ve yanlışlıkla "bugünmüş" gibi gösterilirdi); tam tarih+saat eşleşen index'i bulup
// oradan İLERİ doğru sayıyoruz.
function saatlikSeritOlustur(havaSaatlik, denizSaatlik, lat, lon, renkVarsayilan, suAndakiZamanStr) {
  if (!havaSaatlik || !havaSaatlik.time) return "";
  const simdiAnahtari = suAndakiZamanStr ? suAndakiZamanStr.slice(0, 13) : null;
  let baslangicIndex = simdiAnahtari ? havaSaatlik.time.findIndex(t => t.slice(0, 13) === simdiAnahtari) : -1;
  if (baslangicIndex < 0) baslangicIndex = 0;
  const gosterilecekSaatSayisi = 6;

  let hucreler = "";
  for (let i = baslangicIndex; i < havaSaatlik.time.length && hucreler.split('class="hour-cell"').length - 1 < gosterilecekSaatSayisi; i++) {
    const saatStr = havaSaatlik.time[i];
    const saat = parseInt(saatStr.slice(11, 13), 10);

    const kmh = havaSaatlik.wind_speed_10m ? havaSaatlik.wind_speed_10m[i] : null;
    const dalgaM = denizSaatlik && denizSaatlik.wave_height ? denizSaatlik.wave_height[i] : null;
    const durum = durumDenizden(dalgaM, kmh, null, null, null, lat, lon);
    const r = aktifRenkler()[durum] || renkVarsayilan;
    const saatEtiketi = i === baslangicIndex ? t('simdi') : (saat + ":00");

    hucreler += `<div class="hour-cell">
      <span class="hour-time">${saatEtiketi}</span>
      <span class="hour-dot" style="background:${r.border}"></span>
      <span class="hour-val">${kmh != null ? Math.round(kmh) : "—"}</span>
    </div>`;
  }

  if (!hucreler) return "";
  return `<div class="hourly-strip">${hucreler}</div>`;
}

// Tahmin günleri için: o günün TÜM saatlerini (00:00-23:00) yan yana, kaydırılabilir bir
// şerit olarak gösterir — "bugün" görünümündeki (yukarıdaki fonksiyon) sabit 6 hücrelik
// "kalan saatler" şeridinden farklı olarak, burada sığmayan hücreler CSS ile yatay kaydırma
// (touch/mouse) ile gezilir (bkz. .hourly-strip-kaydirilabilir). hedefTarih: "YYYY-MM-DD".
function gunlukTumSaatlerSeridi(havaSaatlik, denizSaatlik, lat, lon, renkVarsayilan, hedefTarih) {
  if (!havaSaatlik || !havaSaatlik.time) return "";
  let hucreler = "";
  for (let saat = 0; saat < 24; saat++) {
    const saatStr = `${hedefTarih}T${String(saat).padStart(2, '0')}:00`;
    const i = havaSaatlik.time.indexOf(saatStr);
    if (i < 0) continue;
    const kmh = havaSaatlik.wind_speed_10m ? havaSaatlik.wind_speed_10m[i] : null;
    const dalgaM = denizSaatlik && denizSaatlik.wave_height ? denizSaatlik.wave_height[i] : null;
    const durum = durumDenizden(dalgaM, kmh, null, null, null, lat, lon);
    const r = aktifRenkler()[durum] || renkVarsayilan;
    hucreler += `<div class="hour-cell">
      <span class="hour-time">${saat}:00</span>
      <span class="hour-dot" style="background:${r.border}"></span>
      <span class="hour-val">${kmh != null ? Math.round(kmh) : "—"}</span>
    </div>`;
  }
  if (!hucreler) return "";
  return `
    <div class="saatlik-tahmin-baslik" style="color:${renkVarsayilan.text600}">${t('saatlik_tahmin_basligi')}</div>
    <div class="hourly-strip hourly-strip-kaydirilabilir">${hucreler}</div>`;
}

// Son 24 saatte (past_days=1 ile aldığımız GERÇEK, tahmin değil geçmiş veriyle) asıl ölçüt
// (denizdeysek dalga, değilsek rüzgar) nasıl değişmiş — küçük bir sparkline + kısa özet
// olarak gösteriyoruz. "Şu an 0.4 mi, dün de mi 0.4'tü yoksa yeni mi arttı" sorusuna cevap.
function sonSaatlerTrendOlustur(havaSaatlik, denizSaatlik, denizdeyiz, suAndakiZamanStr, renk) {
  if (!havaSaatlik || !havaSaatlik.time || !suAndakiZamanStr) return "";
  const simdiAnahtari = suAndakiZamanStr.slice(0, 13);
  const simdiIndex = havaSaatlik.time.findIndex(t => t.slice(0, 13) === simdiAnahtari);
  if (simdiIndex < 1) return ""; // geçmiş veri yoksa (past_days desteklenmediyse) gösterme

  const baslangic = Math.max(0, simdiIndex - 23);
  const kaynakDizi = denizdeyiz && denizSaatlik && denizSaatlik.wave_height
    ? denizSaatlik.wave_height
    : havaSaatlik.wind_speed_10m;
  if (!kaynakDizi) return "";
  const dizi = kaynakDizi.slice(baslangic, simdiIndex + 1);
  const gecerliDegerler = dizi.filter(v => v != null);
  if (gecerliDegerler.length < 2) return "";

  const birim = denizdeyiz ? "m" : "km/sa";
  const ondalik = denizdeyiz ? 1 : 0;
  const min = Math.min(...gecerliDegerler);
  const max = Math.max(...gecerliDegerler);
  const aralik = Math.max(max - min, 0.001);
  const genislik = 100, yukseklik = 28;
  const adim = dizi.length > 1 ? genislik / (dizi.length - 1) : genislik;

  let noktalar = "";
  dizi.forEach((v, i) => {
    if (v == null) return;
    const x = (i * adim).toFixed(1);
    const y = (yukseklik - 2 - ((v - min) / aralik) * (yukseklik - 4)).toFixed(1);
    noktalar += `${x},${y} `;
  });

  const ilkDeger = gecerliDegerler[0];
  const sonDeger = gecerliDegerler[gecerliDegerler.length - 1];
  const fark = sonDeger - ilkDeger;
  const esik = denizdeyiz ? 0.05 : 2; // bu kadarlık değişim "sabit" sayılır, gürültü ile karışmasın
  const yonMetni = fark > esik ? t('trend_artiyor') : fark < -esik ? t('trend_azaliyor') : t('trend_sabit');
  const yonOk = fark > esik ? "↑" : fark < -esik ? "↓" : "→";

  return `
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(40,40,30,0.08);">
      <div style="font-size:10.5px;color:${renk.text600};margin-bottom:4px;">${denizdeyiz ? t('trend_son_24_dalga') : t('trend_son_24_ruzgar')}</div>
      <svg width="100%" height="${yukseklik}" viewBox="0 0 ${genislik} ${yukseklik}" preserveAspectRatio="none" style="display:block;" aria-hidden="true">
        <polyline points="${noktalar.trim()}" fill="none" stroke="${renk.border}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div style="font-size:11px;color:${renk.text900};margin-top:3px;">${ilkDeger.toFixed(ondalik)}${birim} → ${sonDeger.toFixed(ondalik)}${birim} <b>${yonOk} ${yonMetni}</b></div>
    </div>`;
}

// === Gerçek zamanlı fetch hesabı ===
// Elle binlerce koy/burun tanımlamak yerine, her tıklamada "rüzgarın estiği yönde ne kadar
// uzakta kara başlıyor" sorusunu otomatik hesaplıyoruz. Bu, Türkiye'nin HER noktası için
// (elle tanımlamaya gerek kalmadan) korunaklı/açık ayrımını otomatik yapar.
// ÖNEMLİ: gerçek "fetch" tanımı rüzgarın KESİNTİSİZ ESTİĞİ açık su mesafesidir — bu yüzden
// SADECE rüzgarın o an geldiği yönü ölçüyoruz (bkz. fetchMesafesiHesapla'ya verilen
// ruzgarYonu). Eskiden 8 sabit pusula yönünü (K/KD/D/GD/G/GB/B/KB) ölçüp ortalamasını
// alıyorduk — bu, rüzgarın gerçekte hangi yönden estiğini hiç hesaba katmıyordu; ör. rüzgar
// tam açık denizden esiyorsa bile, karaya yakın diğer yönler ortalamayı düşürüp yanlışlıkla
// "korunaklı" gösterebiliyordu. Tek yöne inince hem daha doğru hem çok daha az istek atıyoruz.
// Yöntem: önce 10km adımlarla kaba bir tarama yapıp en yakın karayı buluyoruz, sonra o dar
// aralıkta ikili arama (binary search) ile en fazla 4 sorgu daha atıp mesafeyi inceltiyoruz.
const FETCH_MAX_KM = 60; // bu mesafeden sonra "açık deniz" sayılır, daha fazla aramaya gerek yok

function koordinatKaydir(lat, lon, aciDerece, mesafeKm) {
  const R = 6371;
  const aci = aciDerece * Math.PI / 180;
  const dLat = (mesafeKm / R) * Math.cos(aci);
  const dLon = (mesafeKm / R) * Math.sin(aci) / Math.cos(lat * Math.PI / 180);
  return { lat: lat + dLat * 180 / Math.PI, lon: lon + dLon * 180 / Math.PI };
}

async function noktaSuMu(lat, lon, deneme) {
  deneme = deneme || 0;
  try {
    // is-on-water.balbona.me bazen hiç yanıt vermeyip isteği askıda bırakabiliyor —
    // fetch'in kendi başına zaman aşımı yok, bu yüzden AbortController ile 3sn sonra
    // kendimiz iptal ediyoruz (bkz. fetchMesafesiHesapla'daki genel zaman aşımı da).
    const controller = new AbortController();
    const zamanAsimi = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`https://is-on-water.balbona.me/api/v1/get/${lat}/${lon}`, { signal: controller.signal });
    clearTimeout(zamanAsimi);
    if (!res.ok) return deneme < 1 ? noktaSuMu(lat, lon, deneme + 1) : null;
    const data = await res.json();
    // API'nin kendi "isWater" alanına güveniyoruz — "feature" alanına (OCEAN/RIVER/LAKE/LAND)
    // bakıp elle karşılaştırmak YANLIŞ: API bazı noktalarda feature="UNKNOWN" ama isWater=true
    // döndürebiliyor (özellikle açık denizde, kıyıdan uzak noktalarda) — eski kod bunu "OCEAN/
    // RIVER/LAKE değil" diye KARA sayıyordu, bu da fetch hesabının açık denizde erken kesilmesine
    // VE gerçek deniz noktalarının yanlışlıkla "kara" sayılıp dalga verisinin gizlenmesine yol açıyordu.
    if (typeof data.isWater === "boolean") return data.isWater;
    return deneme < 1 ? noktaSuMu(lat, lon, deneme + 1) : null;
  } catch (e) { return deneme < 1 ? noktaSuMu(lat, lon, deneme + 1) : null; }
}

const FETCH_KABA_ADIM_KM = 10; // kaba tarama adımı — bkz. yonFetchMesafesi

// Tek bir yönde karanın başladığı mesafeyi bulur.
// ÖNEMLİ: sadece en uçtaki (60km) noktaya bakıp "deniz ise tüm hat açıktır" varsaymak
// YANLIŞ — Ege gibi ada/yarımada dolu bir kıyıda, o hattın ortasında bir kara parçası
// (ada, dar bir yarımadanın ucu) olabilir ve en uçtaki nokta yine de deniz çıkabilir;
// bu durumda aradaki kara tamamen gözden kaçar ve korunaklı bir nokta yanlışlıkla
// "tamamen açık deniz" sayılır. Bunun yerine hattı 10km'lik adımlarla baştan tarayıp
// karşılaşılan İLK (en yakın) karayı buluyoruz, sonra sadece o dar aralıkta ince ayar
// (ikili arama) yapıyoruz — rüzgar zaten en yakın engelde kesildiği için ötesi önemsiz.
async function yonFetchMesafesi(lat, lon, aciDerece) {
  // Kaba taramayı artık SIRAYLA değil PARALEL atıyoruz — eskiden her 10km'lik adım bir
  // öncekinin yanıtını bekliyordu (6 sıralı istek), bu da tıklama başına birkaç saniyelik
  // gereksiz beklemenin asıl sebebiydi. Sonuçları yine YAKINDAN UZAĞA sırayla değerlendirip
  // karşılaşılan İLK karayı buluyoruz — mantık aynı, sadece istekler artık aynı anda gidiyor.
  const mesafeler = [];
  for (let m = FETCH_KABA_ADIM_KM; m <= FETCH_MAX_KM; m += FETCH_KABA_ADIM_KM) mesafeler.push(m);
  const noktalar = mesafeler.map(m => koordinatKaydir(lat, lon, aciDerece, m));
  const sonuclar = await Promise.all(noktalar.map(n => noktaSuMu(n.lat, n.lon)));

  let sonBilinenSu = 0;
  for (let i = 0; i < mesafeler.length; i++) {
    const mesafe = mesafeler[i];
    const sonuc = sonuclar[i];
    if (sonuc === null) continue; // hata veren tek bir noktayı atla, taramaya devam et
    if (sonuc) {
      sonBilinenSu = mesafe;
      continue;
    }
    // Bu mesafede kara bulundu — sonBilinenSu ile bu nokta arasını ince ayarla daraltıyoruz.
    // Bu kısım SIRALI kalmalı çünkü her adım bir öncekinin sonucuna bağlı (ikili arama).
    let alt = sonBilinenSu, ust = mesafe;
    for (let j = 0; j < 4; j++) {
      const orta = (alt + ust) / 2;
      const incelenenNokta = koordinatKaydir(lat, lon, aciDerece, orta);
      const incelenenSonuc = await noktaSuMu(incelenenNokta.lat, incelenenNokta.lon);
      // Belirsiz kalırsa (API yine hata verdiyse) alt sınıra (en kötümser/en "korunaklı"
      // uca) çökmek yerine mevcut aralığın ortasını kaba bir tahmin olarak döndürüyoruz —
      // aksi halde tek bir başarısız istek fetch mesafesini yanlışlıkla 0'a indirip
      // eşikleri gereğinden fazla gevşetebiliyordu (bkz. sonBilinenSu başlangıcı 0).
      if (incelenenSonuc === null) return (alt + ust) / 2;
      if (incelenenSonuc) alt = orta; else ust = orta;
    }
    return alt;
  }
  return FETCH_MAX_KM; // taranan hiçbir noktada kara bulunamadı, açık deniz say
}

// Rüzgarın geldiği yöndeki (bkz. yukarısı) açık su mesafesini (km) döndürür. ruzgarYonu,
// meteorolojik gelenekle rüzgarın NEREDEN geldiğini belirtir (ör. 315° = KB'dan geliyor) —
// koordinatKaydir de aynı pusula yönü kuralını kullandığından, doğrudan o yönde
// yürüyerek "rüzgarın üstünden estiği" mesafeyi ölçmüş oluyoruz; bu tam olarak fetch'in
// tanımı.
//
// TEK bir ışına (çizgiye) güvenmek kırılgan: kıyı şeklindeki ufak bir pürüz (küçük bir ada,
// dar bir burun ucu, bir dalgakıranın ucu) tam o çizginin üstüne denk gelirse, gerçekte açık
// olan bir nokta yanlışlıkla "tamamen korunaklı" çıkabiliyordu. Bunun yerine ABD Sahil Koruma
// El Kitabı'nın (Shore Protection Manual, USACE) standart "etkili fetch" yöntemini
// kullanıyoruz: asıl rüzgar yönünün etrafına yayılmış birkaç ışın çekilip, her birinin
// fetch'i asıl yönden sapma açısının kosinüsüyle ağırlıklandırılıp ortalaması alınır:
//   F_etkili = Σ(Fᵢ · cos(αᵢ)) / Σcos(αᵢ)
// Tam yöntem 9-15 ışın kullanır (±42-45°). Samsun kıyısında rüzgar yönü kıyı çizgisine
// neredeyse PARALEL olduğunda (kıyı burada hafifçe kavis yapıyor) tek bir ışın onlarca km
// öteden bile kıyıya "değebiliyor" — dar açı aralıkları (önce ±20°, sonra ±40°) bunu HÂLÂ
// yeterince seyreltemiyordu: gerçekte açık, dümdüz bir sahil şeridi (İncesu Yalı, Kurupelit)
// yanlışlıkla "koy/körfez gibi korunaklı" çıkıyordu (bkz. proje notları, 5 Temmuz 2026
// kullanıcı geri bildirimi — iki ayrı noktada doğrulandı). 7 ışına, ±60°'ye çıkarmak bu
// paralel-kıyı durumunda ortalamayı gerçek açıklığa çok daha yakın veriyor; is-on-water
// isteği artıyor ama arka planda, tıklama başına bir kez.
const FETCH_ISIN_ACILARI = [-60, -40, -20, 0, 20, 40, 60];
async function fetchMesafesiHesapla(lat, lon, ruzgarYonu) {
  if (ruzgarYonu == null) return null;
  try {
    const isinSonuclari = await Promise.all(
      FETCH_ISIN_ACILARI.map(aci => yonFetchMesafesi(lat, lon, (ruzgarYonu + aci + 360) % 360))
    );
    let toplamAgirlik = 0, agirlikliToplam = 0;
    FETCH_ISIN_ACILARI.forEach((aci, i) => {
      const agirlik = Math.cos(aci * Math.PI / 180);
      toplamAgirlik += agirlik;
      agirlikliToplam += isinSonuclari[i] * agirlik;
    });
    return { km: agirlikliToplam / toplamAgirlik };
  } catch (e) {
    return null;
  }
}

// Belirgin bir swell (uzaktan gelen, yerel rüzgardan bağımsız, uzun periyotlu dalga) var mı?
// >=0.15m VE >=6sn periyot şartı, kısa/huysuz yerel rüzgar dalgasından (windWave) ayırt etmek
// için (bkz. durumDenizden'deki fetch-eşiği notu).
function swellBelirginMi(swellM, swellPeriyot) {
  return swellM != null && swellPeriyot != null && swellM >= 0.15 && swellPeriyot >= 6;
}

// fetchKm'e göre kullanıcıya gösterilecek notu seçer. 2km altı ayrı bir kademe: bu genelde
// coğrafi bir koy/körfez değil, o anki rüzgarın kıyıdan (karadan) esiyor olmasından
// kaynaklanır — rüzgar yönü değişince fetch de değişeceği için bunu "kalıcı korunaklı
// bölge" mesajından ayırıyoruz, yoksa kullanıcı "0 km" görünce bunu hata sanabilir.
function fetchNotuMetni(fetchKm) {
  if (fetchKm < 2) return t('fetch_notu_kiyidan_ruzgar', fetchKm.toFixed(1));
  if (fetchKm < 15) return t('fetch_notu_korunakli', fetchKm.toFixed(0));
  return t('fetch_notu_acik', fetchKm.toFixed(0));
}

// Hesaplanan fetch mesafesine göre dinamik bir eşik seti üretir. Mantık: az önce elle
// tanımladığımız "liman" ve "Karadeniz açık" eşiklerini iki uç nokta olarak alıp,
// gerçek fetch mesafesine göre aradan orantılı bir değer üretiyoruz — kısa fetch
// (korunaklı koy/liman) sakin eşiklere, uzun fetch (açık deniz) hassas eşiklere yakın olur.
function fetchTabanliEsik(fetchKm, esikDalgaAcik, esikRuzgarAcik) {
  // 3km ve altı tamamen korunaklı (liman/koy içi), 40km ve üstü tamamen açık sayılır.
  const oran = Math.max(0, Math.min(1, (fetchKm - 3) / (40 - 3)));
  const carpan = 1 + (1 - oran) * 1.4; // korunaklıysa eşikler ~2.4 kata kadar gevşer
  const carpVer = (esik) => ({
    carsaf: +(esik.carsaf * carpan).toFixed(2),
    hafif: +(esik.hafif * carpan).toFixed(2),
    fazla: +(esik.fazla * carpan).toFixed(2),
  });
  return { esikDalga: carpVer(esikDalgaAcik), esikRuzgar: carpVer(esikRuzgarAcik) };
}

// === Günlük tahmin gezinme (bugün dahil 1 hafta) ===
// GUN_SAYISI: bugün + kaç gün ileri gösterilecek. TEMSILI_SAAT: tahmin günlerinde
// (bugün DIŞINDA) o günü temsil eden saat — öğlen/plaj vakti, tek bir "günün özeti" olarak.
const GUN_SAYISI = 7;
const TEMSILI_SAAT = "13:00";

// aktifGunDegistir: en son çizilen kartın gün değiştirme fonksiyonuna işaret eder — kart
// her veriCekVeGoster çağrısında (yeni tıklamada) yeniden oluşturulduğu için, ok
// butonlarına/kaydırmaya tepki veren tek, KALICI bir olay dinleyicisinin (bkz. aşağıda,
// script sonunda) her zaman GÜNCEL kapanışı çağırabilmesi için bu değişkene atanıyor.
let aktifGunDegistir = null;

async function veriCekVeGoster(lat, lon) {
  // Race-condition koruması: her click kendi token'ını alır.
  // Yavaş bir istek geç dönerse (başka yere tıklandıysa) DOM'a dokunmadan durur.
  const benimToken = ++state.veriCekSayac;
  const tokenGecerli = () => benimToken === state.veriCekSayac;

  const card = document.getElementById('status-card');
  document.getElementById('our-label').style.display = "block";
  card.className = "card";
  card.innerHTML = `<div style="text-align:center;padding:20px 0;color:#6B6A60;font-size:14px;">${t('veri_aliniyor')}</div>`;

  document.getElementById('gb-section').style.display = "none";
  document.getElementById('community-label').style.display = "none";
  document.getElementById('community-summary-wrap').style.display = "none";
  document.getElementById('conflict-note').style.display = "none";

  try {
    const [havaRes, denizRes, yerRes, kiyidaMi] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_gusts_10m,wind_direction_10m,temperature_2m,uv_index&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m,temperature_2m,uv_index&forecast_days=${GUN_SAYISI}&past_days=1&wind_speed_unit=kmh&timezone=auto`),
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_period,swell_wave_height,swell_wave_period,sea_surface_temperature&hourly=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_period,swell_wave_height,swell_wave_period,sea_surface_temperature&forecast_days=${GUN_SAYISI}&past_days=1&timezone=auto`),
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2&zoom=16&accept-language=tr`).catch(() => null),
      noktaSuMu(lat, lon),
    ]);

    const havaJson = havaRes.ok ? await havaRes.json() : null;
    const hava = havaJson ? havaJson.current : null;
    const havaSaatlik = havaJson ? havaJson.hourly : null;
    const denizOk = denizRes.ok;
    const denizJson = denizOk ? await denizRes.json() : null;
    const deniz = denizJson ? denizJson.current : null;
    const denizSaatlik = denizJson ? denizJson.hourly : null;
    let dalgaM = deniz ? deniz.wave_height : null;

    if (!hava && dalgaM == null) throw new Error("no data");

    // Başka bir noktaya tıklandıysa bu sonucu gösterme.
    if (!tokenGecerli()) return;

    // Nominatim'den dönen adres bilgisini SADECE görüntülenecek yer adı için kullanıyoruz.
    let yerAdi = null;
    let konumMetni = null;
    if (yerRes && yerRes.ok) {
      const yerData = await yerRes.json();
      const adr = yerData.address || {};
      // Nominatim Türkiye formatı: quarter/neighbourhood = mahalle, suburb/district/county = ilçe, city/province/state = il
      const mahalle = adr.quarter || adr.neighbourhood || null;
      const ilce    = adr.suburb || adr.city_district || adr.district || adr.county || adr.town || null;
      const il      = adr.city || adr.state || adr.province || null;
      yerAdi = mahalle || ilce || il || null;
      // "Mimar Sinan Mah., Atakum, Samsun" formatı
      const parcalar = [mahalle, ilce, il].filter(Boolean);
      const tekrarsiz = parcalar.filter((v, i, a) => a.indexOf(v) === i);
      konumMetni = tekrarsiz.length > 0 ? tekrarsiz.join(", ") : (yerData.display_name ? yerData.display_name.split(",").slice(0, 3).join(",").trim() : null);
    }

    // Kara/deniz kararı: Open-Meteo'nun deniz (marine) modeli GRID çözünürlüklü olduğu için
    // kıyıya yakın kara noktalarında bile (yanındaki deniz hücresinden) geçerli bir dalga
    // değeri döndürebiliyor — bu yüzden TEK BAŞINA marine modeline güvenmek, karaya
    // tıklandığında bile yanlışlıkla dalga verisi gösterilmesine yol açıyordu. Bunu
    // is-on-water'ın 30m çözünürlüklü gerçek kara/deniz sınıflandırmasıyla (bkz. noktaSuMu,
    // aynı fonksiyon fetch mesafesi hesabında da kullanılıyor) DOĞRULUYORUZ: is-on-water net
    // bir şekilde "kara" derse (false), marine modeli ne dönerse dönsün dalga verisini
    // GİZLİYORUZ — sınır artık kumsalın gerçek ıslak ucu. is-on-water'ın kendisi hata verir/
    // bilinmez dönerse (null), eski davranışa (marine modelinin kendi verisine güven) düşüyoruz.
    let denizdeyiz = denizOk && dalgaM != null && kiyidaMi !== false;

    let kmh = hava ? hava.wind_speed_10m : null;
    let gust = hava ? hava.wind_gusts_10m : null;
    let temp = hava ? hava.temperature_2m : null;
    let ruzgarYonu = hava ? hava.wind_direction_10m : null;
    let uvIndex = hava ? hava.uv_index : null;
    let dalgaPeriyodu = deniz ? deniz.wave_period : null;
    let dalgaYonu = deniz ? deniz.wave_direction : null;
    let windWaveM = deniz ? deniz.wind_wave_height : null;
    let windWavePeriyot = deniz ? deniz.wind_wave_period : null;
    let swellM = deniz ? deniz.swell_wave_height : null;
    let swellPeriyot = deniz ? deniz.swell_wave_period : null;
    let deniztSicaklik = deniz ? deniz.sea_surface_temperature : null;

    // Bugünün GERÇEK (şu anki) ölçümünün anlık görüntüsü — kullanıcı ileri/geri gün
    // gezinip "bugüne" döndüğünde buradan geri yükleniyor (bkz. gunVerisiUygula).
    const gercekVeriSimdi = {
      denizdeyiz, kmh, gust, temp, ruzgarYonu, uvIndex, dalgaPeriyodu, dalgaYonu,
      windWaveM, windWavePeriyot, swellM, swellPeriyot, deniztSicaklik, dalgaM,
      zamanStr: hava ? hava.time : (deniz ? deniz.time : null),
    };
    state.gunOfset = 0;

    // "YYYY-MM-DD" tarihine gunSayisi gün ekler — takvim aritmetiği (UTC ile inşa edip
    // geri okumak, tarayıcının kendi saat dilimini karıştırmadan sadece takvim günü
    // ilerletir; noktanın gerçek saat dilimiyle hiç ilgisi yok, bkz. dosyadaki diğer
    // "new Date() ile saat dilimi karıştırmayın" notları).
    function tarihEkle(tarihStr, gunSayisi) {
      const [yil, ay, gun] = tarihStr.split('-').map(Number);
      const d = new Date(Date.UTC(yil, ay - 1, gun));
      d.setUTCDate(d.getUTCDate() + gunSayisi);
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    }

    // gunOfset=0 -> bugünün GERÇEK/anlık verisine döner. gunOfset>0 -> o günün
    // TEMSILI_SAAT'teki (13:00) TAHMİNİ değerlerini saatlik dizilerden okur. Fetch tabanlı
    // eşik ince ayarı SADECE bugün için geçerli (bkz. çağıran kod) — tahmin günlerinde
    // rüzgar yönü değişeceğinden bugünün fetch sonucunu diğer günlere taşımıyoruz,
    // bölgenin standart eşiğine dönüyoruz.
    function gunVerisiUygula(gunOfset) {
      state.gunOfset = gunOfset;
      if (gunOfset === 0 || !gercekVeriSimdi.zamanStr) {
        ({ denizdeyiz, kmh, gust, temp, ruzgarYonu, uvIndex, dalgaPeriyodu, dalgaYonu,
           windWaveM, windWavePeriyot, swellM, swellPeriyot, deniztSicaklik, dalgaM } = gercekVeriSimdi);
        return { zamanStr: gercekVeriSimdi.zamanStr, gercekMi: true };
      }
      const bugunTarih = gercekVeriSimdi.zamanStr.split('T')[0];
      const hedefZamanStr = `${tarihEkle(bugunTarih, gunOfset)}T${TEMSILI_SAAT}`;
      const i = havaSaatlik && havaSaatlik.time ? havaSaatlik.time.indexOf(hedefZamanStr) : -1;
      const j = denizSaatlik && denizSaatlik.time ? denizSaatlik.time.indexOf(hedefZamanStr) : -1;
      kmh = i >= 0 && havaSaatlik.wind_speed_10m ? havaSaatlik.wind_speed_10m[i] : null;
      gust = i >= 0 && havaSaatlik.wind_gusts_10m ? havaSaatlik.wind_gusts_10m[i] : null;
      temp = i >= 0 && havaSaatlik.temperature_2m ? havaSaatlik.temperature_2m[i] : null;
      ruzgarYonu = i >= 0 && havaSaatlik.wind_direction_10m ? havaSaatlik.wind_direction_10m[i] : null;
      uvIndex = i >= 0 && havaSaatlik.uv_index ? havaSaatlik.uv_index[i] : null;
      dalgaM = j >= 0 && denizSaatlik.wave_height ? denizSaatlik.wave_height[j] : null;
      dalgaPeriyodu = j >= 0 && denizSaatlik.wave_period ? denizSaatlik.wave_period[j] : null;
      dalgaYonu = j >= 0 && denizSaatlik.wave_direction ? denizSaatlik.wave_direction[j] : null;
      windWaveM = j >= 0 && denizSaatlik.wind_wave_height ? denizSaatlik.wind_wave_height[j] : null;
      windWavePeriyot = j >= 0 && denizSaatlik.wind_wave_period ? denizSaatlik.wind_wave_period[j] : null;
      swellM = j >= 0 && denizSaatlik.swell_wave_height ? denizSaatlik.swell_wave_height[j] : null;
      swellPeriyot = j >= 0 && denizSaatlik.swell_wave_period ? denizSaatlik.swell_wave_period[j] : null;
      deniztSicaklik = j >= 0 && denizSaatlik.sea_surface_temperature ? denizSaatlik.sea_surface_temperature[j] : null;
      denizdeyiz = denizOk && dalgaM != null && kiyidaMi !== false;
      return { zamanStr: hedefZamanStr, gercekMi: false };
    }

    // Gün başlığını (tarih + "Şimdi"/"Tahmin" rozeti) oluşturur.
    function gunBasligiOlustur(zamanStr, gercekMi) {
      if (!zamanStr) return "";
      const [tarihKismi, saatKismi] = zamanStr.split('T');
      const [yil, ay, gun] = tarihKismi.split('-').map(Number);
      const haftaGunu = new Date(Date.UTC(yil, ay - 1, gun)).getUTCDay();
      const tarihMetni = `${gun} ${AY_ADLARI()[ay - 1]}, ${GUN_ADLARI()[haftaGunu]}`;
      const etiketHtml = gercekMi
        ? `<span class="gun-etiket gun-etiket-simdi">${t('simdi_gercek_veri', saatKismi ? saatKismi.slice(0, 5) : '')}</span>`
        : `<span class="gun-etiket gun-etiket-tahmin">${t('tahmin_etiketi')}</span>`;
      return `<div class="gun-tarih">${tarihMetni}</div>${etiketHtml}`;
    }

    // Eğer bilinen bir liman içindeysek o zaten kesin/güvenilir bir eşik veriyor, fetch
    // hesabına gerek yok. Değilsek, gerçek zamanlı fetch hesabı yapıp ona göre eşikleri
    // otomatik ayarlıyoruz — bu, Türkiye'nin her koyu/burnu için elle tanımlama yapmadan
    // otomatik bir "korunaklı mı açık mı" tahmini sağlar.
    const bolgeGenel = (denizdeyiz && !limanBul(lat, lon)) ? denizBolgesi(lat, lon) : null;

    const yonAdi = (derece) => {
      if (derece == null) return null;
      const yonlerDil = AKTIF_DIL === 'en'
        ? ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
        : ["K", "KKD", "KD", "DKD", "D", "DGD", "GD", "GGD", "G", "GGB", "GB", "BGB", "B", "BKB", "KB", "KKB"];
      return yonlerDil[Math.round(derece / 22.5) % 16];
    };
    // Meteorolojik yön "nereden geldiği"ni belirtir (örn. 315° = KB'dan geliyor).
    // Ok ikonunu hareket yönünü gösterecek şekilde çiziyoruz, yani 180° ters döndürüyoruz.
    const yonOku = (derece) => {
      if (derece == null) return "";
      const aci = (derece + 180) % 360;
      return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-left:3px;transform:rotate(${aci}deg)" aria-hidden="true"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>`;
    };

    // Kartı ÇİZEN fonksiyon: rüzgar/dalga verisi gelir gelmez (bölgenin varsayılan
    // eşikleriyle) HEMEN bir kez, sonra kıyı şekli (fetch mesafesi) hesabı arka planda
    // bitince (varsa, hâlâ aynı noktadaysak) ince ayarlı eşikle TEKRAR çağrılır. Böylece
    // kullanıcı rüzgar/dalga rakamlarını görmek için o yavaş, çok istekli hesabın
    // bitmesini beklemek zorunda kalmaz — dalga verisi hemen gelir, fetch mesafesi notu
    // (varsa) birkaç saniye sonra ayrıca belirir.
    async function kartiCiz(ozelEsik, fetchKm) {
      if (!tokenGecerli()) return;
      const { zamanStr: gunZamanStr, gercekMi: gunGercekMi } = gunVerisiUygula(state.gunOfset);
      const durum = denizdeyiz ? durumDenizden(dalgaM, kmh, gust, windWaveM, windWavePeriyot, lat, lon, ozelEsik, swellM, swellPeriyot) : null;
      const r = durum ? aktifRenkler()[durum] : aktifRenkler().notr;
      const yogunluk = dalgaM != null ? Math.min(dalgaM * 9, 20) : (kmh ? Math.min(kmh / 2, 18) : 6);

      card.style.background = r.bg;
      card.style.borderColor = r.border;
      durumHalkasiniGuncelle(lat, lon, r.marker);

      // metrics-item: ikon kutusu + büyük değer + küçük etiket (öne-çıkan-veri kart tasarımı,
      // 2026-07-07 kullanıcı referans görseline göre) — içerik/veri aynı, sadece görünüm.
      const metricsKutu = (iconSvg, deger, etiket) => `<div class="metrics-item"><div class="metrics-icon">${iconSvg}</div><div><div class="metrics-value">${deger}</div><div class="metrics-label">${etiket}</div></div></div>`;
      let metricsHtml = "";
      if (kmh != null) {
        const ikon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 7.5h13c2.2 0 2.2-3.5 0-3.5-1.4 0-2.2 1-2.5 2"/><path d="M2 12.5h16c2.5 0 2.5-4 0-4-1.6 0-2.5 1.2-2.8 2.3"/><path d="M2 17.5h9c1.8 0 1.8-3 0-3-1.1 0-1.7.8-2 1.6"/></svg>`;
        const etiket = `${t('ruzgar_birim')}${ruzgarYonu != null ? ` ${t('dan', yonAdi(ruzgarYonu))}${yonOku(ruzgarYonu)}` : ""}`;
        metricsHtml += metricsKutu(ikon, `${Math.round(kmh)} km/sa`, etiket);
      }
      if (gust != null) {
        const ikon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/><polyline points="18 20 12 14 6 20"/></svg>`;
        metricsHtml += metricsKutu(ikon, `${Math.round(gust)} km/sa`, t('hamle'));
      }
      if (denizdeyiz && dalgaM != null) {
        const ikon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0"/><path d="M2 14c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0"/><path d="M4 19c1 1 2 1 3 0" opacity="0.6"/></svg>`;
        const etiket = `${t('dalga_birim')}${dalgaYonu != null ? ` ${t('dan', yonAdi(dalgaYonu))}${yonOku(dalgaYonu)}` : ""}`;
        metricsHtml += metricsKutu(ikon, `${dalgaM.toFixed(1)} m`, etiket);
      }
      if (denizdeyiz && dalgaPeriyodu != null) {
        const ikon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>`;
        metricsHtml += metricsKutu(ikon, `${dalgaPeriyodu.toFixed(1)} sn`, t('periyot'));
      }
      if (temp != null) {
        const ikon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>`;
        metricsHtml += metricsKutu(ikon, `${Math.round(temp)}°C`, t('hava'));
      }
      if (denizdeyiz && deniztSicaklik != null) {
        const ikon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>`;
        metricsHtml += metricsKutu(ikon, `${Math.round(deniztSicaklik)}°C`, t('deniz_sicaklik'));
      }
      if (uvIndex != null && uvIndex > 0) {
        const uvRenk = (v) => v < 3 ? "#1D9E75" : v < 6 ? "#C9A227" : v < 8 ? "#BA7517" : v < 11 ? "#D85A30" : "#8B3FBA";
        const ikon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
        metricsHtml += metricsKutu(ikon, `<span style="color:${uvRenk(uvIndex)}">${Math.round(uvIndex)}</span>`, "UV");
      }

      const ruzgarDalgasiBaskin = denizdeyiz && windWaveM != null && windWaveM >= 0.25 && windWavePeriyot != null && windWavePeriyot < 4;
      const ruzgarDalgasiNotu = ruzgarDalgasiBaskin
        ? `<div style="font-size:12px;color:${r.text600};margin-top:6px;">${t('ruzgar_dalgasi_notu', windWavePeriyot.toFixed(1))}</div>`
        : "";

      // fetch-notu-alani / fetch-uyari-alani: fetch hesabı arka planda bittiğinde (bkz.
      // aşağıdaki kartiCiz çağrısının dışı) bu iki alan, kartı BAŞTAN çizmeden, sadece
      // içeriklerini değiştirerek güncellenebiliyor — böylece küçük bir eşik ince ayarı
      // için ana başlığı/rengi yeniden çizmeye gerek kalmıyor.
      const swellNotu = (fetchKm != null && swellBelirginMi(swellM, swellPeriyot))
        ? ` ${t('swell_notu', swellM.toFixed(1), swellPeriyot.toFixed(0))}`
        : "";
      const fetchNotuIcerik = !gunGercekMi ? "" : (fetchKm != null
        ? fetchNotuMetni(fetchKm) + swellNotu
        : (bolgeGenel ? t('fetch_notu_bekleniyor') : ""));
      const fetchNotu = `<div id="fetch-notu-alani" style="font-size:12px;color:${r.text600};margin-top:6px;">${fetchNotuIcerik}</div><div id="fetch-uyari-alani"></div>`;

      // Belediyenin YouTube kanalı embed'i kapattığı için videoyu gömemiyoruz, ayrıca tek tek
      // video ID'leri bayatlayabildiği için (bkz. CANLI_KAMERALAR tanımı) doğrudan belediyenin
      // güncel tuttuğu canlı yayın sayfasına link veriyoruz.
      const kamera = kameraBul(lat, lon);
      const kameraHtml = kamera
        ? `<div style="font-size:12px;margin-top:6px;"><a href="${SAMSUN_CANLI_YAYIN_SAYFASI}" target="_blank" rel="noopener" style="color:${r.text600};text-decoration:underline;">${t('canli_kamera_link', bolgeAdi(kamera))}</a></div>`
        : "";

      // TÜRÇEV'in resmi listesi — tahmine dayalı değil, doğrulanmış/sertifikalı bir bilgi.
      const maviBayrakPlaj = maviBayrakBul(lat, lon);
      const maviBayrakHtml = maviBayrakPlaj
        ? `<div style="font-size:12px;margin-top:6px;color:${r.text600};">${t('mavi_bayrak_rozeti', bolgeAdi(maviBayrakPlaj))}</div>`
        : "";

      // Mavi Bayrak sertifikası olmayan ama gerçekten var olan halka açık plaj/sahil — ayrı
      // rozet, "TÜRÇEV sertifikalı" iddiası YOK (bkz. HALK_PLAJLARI tanımı).
      const halkPlaji = !maviBayrakPlaj ? halkPlajiBul(lat, lon) : null;
      const halkPlajiHtml = halkPlaji
        ? `<div style="font-size:12px;margin-top:6px;color:${r.text600};">${t('halk_plaji_rozeti', bolgeAdi(halkPlaji))}</div>`
        : "";

      // Resmi bir meteoroloji uyarı servisine (MGM, OpenWeather Alerts vb.) ücretsiz/anahtar
      // gerektirmeden bağlanan bir kaynak bulunamadı; bu yüzden kendi hamle verimize dayanan
      // basit bir "kuvvetli rüzgar" uyarısı gösteriyoruz — resmi bir uyarı DEĞİL, sadece
      // elimizdeki veriden türetilen bir gözlem.
      const kuvvetliRuzgarUyarisi = (gust != null && gust >= 40) || (kmh != null && kmh >= 35);
      const ruzgarUyariHtml = kuvvetliRuzgarUyarisi
        ? `<div class="wind-warning"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>${t('kuvvetli_ruzgar_uyarisi')}</div>`
        : "";

      const bolge = denizBolgesi(lat, lon);
      const baslikYer = yerAdi || bolgeAdi(bolge);
      const durumBasligi = denizdeyiz ? ETIKET(durum) : t('kiyidan_ruzgar_bilgisi');
      const durumAltyazi = denizdeyiz ? ETIKET_ALT(durum) : "";

      const saatlikSeritHtml = gunGercekMi
        ? saatlikSeritOlustur(havaSaatlik, denizSaatlik, lat, lon, r, hava ? hava.time : null)
        : gunlukTumSaatlerSeridi(havaSaatlik, denizSaatlik, lat, lon, r, gunZamanStr.split('T')[0]);
      const trendHtml = gunGercekMi ? sonSaatlerTrendOlustur(havaSaatlik, denizSaatlik, denizdeyiz, hava ? hava.time : null, r) : "";
      const gunNavHtml = `
        <div class="gun-nav-row" style="color:${r.text600}">
          <button type="button" class="gun-ok" id="gun-onceki" aria-label="${t('onceki_gun')}" ${state.gunOfset <= 0 ? 'disabled' : ''}>&lsaquo;</button>
          <div class="gun-nav-bilgi">${gunBasligiOlustur(gunZamanStr, gunGercekMi)}<div class="gun-nav-ipucu">${t('gun_kaydir_ipucu')}</div></div>
          <button type="button" class="gun-ok" id="gun-sonraki" aria-label="${t('sonraki_gun')}" ${state.gunOfset >= GUN_SAYISI - 1 ? 'disabled' : ''}>&rsaquo;</button>
        </div>`;
      const tahminNotHtml = gunGercekMi ? "" : `<div class="tahmin-not" style="color:${r.text600}">${t('tahmin_aciklama')}</div>`;

      card.innerHTML = `
        ${ruzgarUyariHtml}
        ${gunNavHtml}
        <div class="card-top">
          <div>
            <div class="loc-label" style="color:${r.text600}">${baslikYer ? escapeHtml(baslikYer) + " · " : ""}${lat.toFixed(3)}, ${lon.toFixed(3)}</div>
            <div class="status-label" style="color:${r.text900}">${durumBasligi}</div>
            ${durumAltyazi ? `<div class="status-alt" style="color:${r.text600}">(${escapeHtml(durumAltyazi)})</div>` : ""}
          </div>
          <div style="display:flex;gap:4px;">
            <button class="refresh-btn" id="share-btn" aria-label="${t('paylas')}" style="color:${r.text600}">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            </button>
            <button class="refresh-btn" id="refresh-btn" aria-label="${t('yenile')}" style="color:${r.text600}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            </button>
          </div>
        </div>
        <div class="metrics" style="color:${r.text900}">${metricsHtml}</div>
        ${ruzgarDalgasiNotu}
        ${fetchNotu}
        ${kameraHtml}
        ${maviBayrakHtml}
        ${halkPlajiHtml}
        ${denizdeyiz ? (durum === 'carsaf' ? svgDuzCizgiPattern(r.border) : svgDalgaPattern(r.border, yogunluk)) : `<div style="font-size:12px;color:${r.text600};margin-top:8px;">${t('kara_uzerinde')}</div>`}
        ${denizdeyiz ? saatlikSeritHtml : ""}
        ${trendHtml}
        ${tahminNotHtml}
      `;

      document.getElementById('refresh-btn').onclick = () => veriCekVeGoster(lat, lon);

      document.getElementById('share-btn').onclick = async () => {
        const yerMetni = baslikYer || `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
        const metin = t('paylas_metni', yerMetni, durumBasligi, window.location.href);
        if (navigator.share) {
          try { await navigator.share({ text: metin }); } catch (e) {}
        } else {
          try {
            await navigator.clipboard.writeText(metin);
            const btn = document.getElementById('share-btn');
            const eskiSvg = btn.innerHTML;
            btn.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
            setTimeout(() => { btn.innerHTML = eskiSvg; }, 1500);
          } catch (e) {}
        }
      };

      state.lat = lat;
      state.lon = lon;
      state.bizimDurum = durum;
      state.denizdeyiz = denizdeyiz;
      state.yerAdi = baslikYer;
      state.konumMetni = konumMetni;
      yakinYorumlariDurumGuncelle();
      await gbAlaniniGuncelle();

      // Offline/bağlantı koptuğunda gösterebilmek için son başarılı sonucu sakla.
      try {
        localStorage.setItem('deniz-durumu-son-veri', JSON.stringify({
          lat, lon, baslikYer, durum, durumBasligi, kmh, dalgaM, zaman: Date.now()
        }));
      } catch (e) {}

      tamEkranVeriGoster(); // harita tam ekrandaysa kartı göster ve 13sn'lik zamanlayıcıyı başlat/tazele
    }

    // Bugün için fetch hesabı bitince (aşağıda) burada saklanıyor — kullanıcı tahmin
    // günlerine gidip "bugüne" geri döndüğünde eşiği yeniden hesaplamadan geri getirebilelim.
    let sonOzelEsikDegeri = null, sonFetchKmDegeri = null;

    // Sağ/sol ok butonları ve kaydırma (swipe) BUNU çağırır (bkz. aktifGunDegistir, script
    // sonundaki kalıcı dinleyici). Bugün (0) dışına çıkarken fetch ince ayarı uygulanmıyor
    // (bkz. gunVerisiUygula'daki not); bugüne dönünce varsa hesaplanmış eşik geri gelir.
    function gunDegistir(delta) {
      const yeni = Math.max(0, Math.min(GUN_SAYISI - 1, state.gunOfset + delta));
      if (yeni === state.gunOfset) return;
      state.gunOfset = yeni;
      kartiCiz(yeni === 0 ? sonOzelEsikDegeri : null, yeni === 0 ? sonFetchKmDegeri : null);
    }
    aktifGunDegistir = gunDegistir;

    await kartiCiz(null, null);

    // Kıyı şekli (fetch mesafesi) hesabını ARKA PLANDA başlatıyoruz — kullanıcı rüzgar/dalga
    // rakamlarını görmek için bu yavaş, çok istekli hesabın bitmesini beklemiyor. Sonuç
    // gelince (hâlâ aynı noktadaysak) ilk gösterilen kademeyle karşılaştırılıyor:
    // - Fark yoksa ya da komşu bir kademeyse (ör. Mükemmel↔İyi), kart sessizce, TAMAMEN
    //   güncellenir (bkz. kartiCiz) — küçük bir ince ayar, göze batacak bir "değişim" değil.
    // - Fark birden fazla kademeyse (ör. Mükemmel'den Kötü'ye), ana başlık/renk KASITLI
    //   OLARAK değiştirilmiyor — kullanıcının tıklayınca gördüğü karar aniden "başka bir
    //   şeye" dönüşmesin diye. Bunun yerine sadece fetch notu güncellenir ve ayrı, göze
    //   batan bir uyarı eklenir; isteyen "yenile"ye basıp güncel kademeyi görebilir.
    if (bolgeGenel) {
      fetchMesafesiHesapla(lat, lon, ruzgarYonu).then((fetchSonuc) => {
        if (!fetchSonuc || !tokenGecerli()) return;
        const ozelEsik = fetchTabanliEsik(fetchSonuc.km, bolgeGenel.esikDalga, bolgeGenel.esikRuzgar);
        sonOzelEsikDegeri = ozelEsik;
        sonFetchKmDegeri = fetchSonuc.km;
        // Kullanıcı bu sırada başka bir güne (tahmine) geçmişse, "bugünün" kartını arkadan
        // değiştirme — sonuç sonOzelEsikDegeri'de saklı kaldı, bugüne dönünce uygulanır.
        if (state.gunOfset !== 0) return;
        const yeniDurum = denizdeyiz ? durumDenizden(dalgaM, kmh, gust, windWaveM, windWavePeriyot, lat, lon, ozelEsik, swellM, swellPeriyot) : null;
        const eskiPuan = durumPuani(state.bizimDurum);
        const yeniPuan = durumPuani(yeniDurum);
        const fark = (eskiPuan != null && yeniPuan != null) ? Math.abs(yeniPuan - eskiPuan) : 0;
        if (fark <= 1) {
          kartiCiz(ozelEsik, fetchSonuc.km);
          return;
        }
        const notuAlani = document.getElementById('fetch-notu-alani');
        const uyariAlani = document.getElementById('fetch-uyari-alani');
        if (notuAlani) {
          const swellNotu = swellBelirginMi(swellM, swellPeriyot) ? ` ${t('swell_notu', swellM.toFixed(1), swellPeriyot.toFixed(0))}` : "";
          notuAlani.innerHTML = fetchNotuMetni(fetchSonuc.km) + swellNotu;
        }
        if (uyariAlani) {
          uyariAlani.innerHTML = `<div class="fetch-fark-uyari">${t('fetch_farkli_sonuc_uyarisi', ilkHarfBuyuk(ETIKET_KISA(yeniDurum)))}</div>`;
        }
      }).catch(() => {});
    }
  } catch (e) {
    let onbellekHtml = "";
    try {
      const kayit = localStorage.getItem('deniz-durumu-son-veri');
      if (kayit) {
        const o = JSON.parse(kayit);
        if (Math.abs(o.lat - lat) < 0.01 && Math.abs(o.lon - lon) < 0.01) {
          const dakika = Math.round((Date.now() - o.zaman) / 60000);
          const zamanMetni = dakika < 60 ? t('dk_once', dakika) : t('sa_once', Math.round(dakika / 60));
          onbellekHtml = `
            <div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(80,30,10,0.15);font-size:12.5px;color:#7A4530;text-align:left;">
              ${t('son_bilinen_durum', zamanMetni)} ${o.baslikYer || ""} — ${o.durumBasligi || ""}
              ${o.kmh != null ? ` · ${Math.round(o.kmh)} km/sa ${t('ruzgar_birim')}` : ""}${o.dalgaM != null ? ` · ${o.dalgaM.toFixed(1)} m ${t('dalga_birim')}` : ""}
            </div>`;
        }
      }
    } catch (err) {}

    card.className = "card";
    card.style.background = "#FAECE7";
    card.style.borderColor = "#D85A30";
    card.innerHTML = `
      <div style="text-align:center;padding:12px 0;color:#4A1B0C;font-size:14px;">
        ${t('veri_alinamadi')}
        <div style="margin-top:10px;">
          <button id="retry-btn" style="background:transparent;border:1px solid #D85A30;border-radius:8px;padding:6px 14px;font-size:13px;color:#4A1B0C;cursor:pointer;">${t('yeniden_dene')}</button>
        </div>
      </div>
      ${onbellekHtml}`;
    document.getElementById('retry-btn').onclick = () => veriCekVeGoster(lat, lon);
  }
}

const SIRA = ["carsaf", "hafif", "fazla", "tehlikeli"];

// "iyi" kademesi kaldırılıp "carsaf" ile birleştirildi (2026-07-08, kullanıcı isteği —
// "çarşaf gibi" sarı renkli "hafif dalgalı"ya çok yakın durup kafa karıştırıyordu, ayrıca
// beşli skala gereksiz ince bulundu). Supabase'te bu değişiklikten ÖNCE gönderilmiş
// yorumlar hâlâ durum='iyi' olarak saklı olabilir — bunları okurken 'carsaf'a eşitliyoruz,
// böylece eski veriler için ayrı bir DB migration'a gerek kalmıyor.
function durumNormallestir(durum) {
  return durum === 'iyi' ? 'carsaf' : durum;
}

const GB_PENCERE_SAAT = 2; // deniz durumu birkaç saatte değişebileceği için bildirimler bu süre sonra "eski" sayılır — 2 saat 1 dk'lık bir yorum artık hiçbir yerde (harita/panel) gösterilmez

// Bir noktanın YAKININDAKİ bildirimleri getirir (~1.3 km yarıçaplı bir kutu, mahalle ölçeği —
// böylece Atakum'daki bir bildirim Canik'te görünmez, ama tam aynı pikselde tıklamak da gerekmez).
async function bildirimleriGetir(lat, lon) {
  const ARALIK = 0.012;
  if (supabaseClient) {
    const { data, error } = await supabaseClient
      .from('geri_bildirimler')
      .select('*')
      .gte('lat', lat - ARALIK).lte('lat', lat + ARALIK)
      .gte('lon', lon - ARALIK).lte('lon', lon + ARALIK)
      .gte('created_at', new Date(Date.now() - GB_PENCERE_SAAT * 3600 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) {
      console.error("Supabase okuma hatası:", error);
      return { liste: [], hata: true };
    }
    return { liste: data.map(d => ({ id: d.id, durum: durumNormallestir(d.durum), not: d.not_metni || "", zaman: new Date(d.created_at).getTime(), faydali: d.faydali_sayisi || 0, begenmedi: d.begenmedi_sayisi || 0, isim: d.kullanici_adi || t('anonim'), konum: d.konum_metni || null, foto: d.foto_url || null, sikayet: d.sikayet_sayisi || 0 })), hata: false };
  }
  // Supabase bağlı değilse: bu oturumdaki yerel hafızaya düş, ama yine de pencere dışı kalanları süzelim
  const key = konumAnahtari(lat, lon);
  const sinirZaman = Date.now() - GB_PENCERE_SAAT * 3600 * 1000;
  const liste = (state.geriBildirimlerYerel[key] || []).filter(gb => gb.zaman >= sinirZaman);
  return { liste, hata: false };
}

const GB_BEKLEME_SURESI_MS = 5 * 60 * 1000; // aynı tarayıcıdan iki bildirim arası en az 5 dakika

// === Haritada tüm yorum noktalarını gösterme ===
// Tek bir noktaya tıklamadan da, son 2 saatte birinin yorum bıraktığı TÜM noktaları
// haritada küçük işaretlerle gösteriyoruz. Konumları ~700m hassasiyetinde gruplayıp
// (tam aynı pikselde olmayan ama aynı mahalledeki bildirimleri birleştirip) her grup için
// tek bir işaret koyuyoruz, üstüne tıklayınca o noktanın yorumlarını gösteriyoruz.
let yorumNoktaIsaretleri = [];

// Uzaktan (tüm ülke/bölge ölçeğinde) yorum işaretlerinin görünmesi hem kalabalık hem de
// yanıltıcı oluyor. Ama eşik eskiden 16'ydı (sokak seviyesi) — bu KADAR yakınlaşmadan hiçbir
// yorum görünmüyordu, insanlar "yorumum kayboldu/görünmüyor" sanıyordu, oysa sadece
// yeterince yakınlaşmamıştı. Sayfa açılış zoom'u zaten 13-14 civarında olduğundan (bkz.
// map.setView çağrıları), eşiği de buna yakın (mahalle ölçeği) bir seviyeye indirdik.
const YORUM_ISARET_MIN_ZOOM = 13;

function yorumIsaretGorunurlukGuncelle() {
  const goster = map.getZoom() >= YORUM_ISARET_MIN_ZOOM;
  yorumNoktaIsaretleri.forEach(m => {
    const haritada = map.hasLayer(m);
    if (goster && !haritada) {
      m.addTo(map);
    } else if (!goster && haritada) {
      // Nokta kayboluyorsa üstünde açık kalmış bir balon varsa onu da kapat —
      // yoksa balon, bağlı olduğu nokta haritadan kalktıktan sonra da havada asılı kalır.
      m.closePopup();
      map.removeLayer(m);
    }
  });
}

function konumGrupAnahtari(lat, lon) {
  // ~0.007 derece ~ 700m; bu, bireysel tıklama hassasiyetinden (1.3km) daha sık gruplama yapar
  // çünkü burada amaç "haritada görünür ayrı noktalar", tek bir noktanın yorumlarını
  // toplama hassasiyeti değil.
  return Math.round(lat / 0.007) + "," + Math.round(lon / 0.007);
}

// Harita üzerindeki işaretlerin rengi artık deniz durumuna göre DEĞİL, konuma göre —
// her farklı nokta (ör. Mimar Sinan Mah. / İncesu Mah.) kendine has, sabit ama "rastgele"
// görünen bir renk alır; aynı konum her zaman aynı rengi alır (basit bir string hash'i),
// böylece sayfa yenilendiğinde renkler değişip kullanıcıyı şaşırtmaz. Durum (iyi/tehlikeli
// vb.) bilgisi zaten balon içindeki rozette ayrıca gösteriliyor, kaybolmuyor.
const KONUM_RENK_PALETI = [
  "#8E44AD", "#E67E22", "#16A085", "#D35400", "#2980B9",
  "#C0392B", "#27AE60", "#B8860B", "#DB4C8C", "#1ABC9C",
  "#6C5CE7", "#CD6133",
];
function konumRengi(anahtar) {
  let h = 0;
  for (let i = 0; i < anahtar.length; i++) h = (h * 31 + anahtar.charCodeAt(i)) >>> 0;
  return KONUM_RENK_PALETI[h % KONUM_RENK_PALETI.length];
}

// İki farklı işaret var: yorum yapılmış konumlar küçük bir NOKTA, o an sadece bakmak için
// tıklanan (henüz yorum yapılmamış olabilecek) tekil konum ise bir PİN — böylece "burada
// zaten yorumlar var" ile "şu an baktığım yer" haritada birbirinden ayırt edilebiliyor.
// İkisi de konuma göre renkleniyor (bkz. konumRengi).
function noktaIkonuOlustur(renkHex) {
  const boyut = 14;
  return L.divIcon({
    className: 'deniz-pin-wrap',
    html: `<span style="display:block;width:${boyut}px;height:${boyut}px;border-radius:50%;background:${renkHex};border:2px solid white;box-shadow:0 1px 3px rgba(20,56,74,0.45);"></span>`,
    iconSize: [boyut, boyut],
    iconAnchor: [boyut / 2, boyut / 2],
    popupAnchor: [0, -boyut / 2 - 2],
  });
}
function pinIkonuOlustur(renkHex) {
  const w = 15, h = 20;
  return L.divIcon({
    className: 'deniz-pin-wrap',
    html: `<svg width="${w}" height="${h}" viewBox="0 0 22 29" style="filter:drop-shadow(0 2px 3px rgba(20,56,74,0.4));">
      <path d="M11 0C4.9 0 0 4.9 0 11c0 8 11 18 11 18s11-10 11-18C22 4.9 17.1 0 11 0z" fill="${renkHex}"/>
      <circle cx="11" cy="11" r="4.8" fill="white"/>
    </svg>`,
    iconSize: [w, h],
    iconAnchor: [w / 2, h],
    popupAnchor: [0, -h + 3],
  });
}

// Seçili noktanın deniz durumu rengini (iyi/kötü/tehlikeli vb.) pinin ALTINDA sabit
// piksel yarıçaplı, yarı saydam bir halka ile gösterir — pin kendisi hep aynı lacivert
// renkte kaldığı için (bkz. TIKLAMA_PIN_RENGI) durum bilgisi haritadan kaybolmasın diye.
// L.circleMarker kullanılıyor çünkü yarıçapı METRE değil PİKSEL cinsinden sabit kalır,
// yani hangi zoom'da olursak olalım halka hep aynı boyutta görünür.
function durumHalkasiniGuncelle(lat, lon, renkHex) {
  if (state.durumCircle) {
    state.durumCircle.setLatLng([lat, lon]);
    state.durumCircle.setStyle({ fillColor: renkHex, color: renkHex });
  } else {
    state.durumCircle = L.circleMarker([lat, lon], {
      radius: 24,
      fillColor: renkHex,
      fillOpacity: 0.28,
      color: renkHex,
      weight: 1.5,
      opacity: 0.5,
      interactive: false,
    }).addTo(map);
  }
}

// Mavi Bayraklı plajlar haritada SABİT, küçük bir rozetle işaretli — tıklamaya gerek kalmadan
// nerede olduğu görülsün diye. Üzerine gelince (hover) tooltip ile ad + rozet metni çıkar.
const MAVI_BAYRAK_IKON = L.divIcon({
  className: 'mavi-bayrak-isaret-wrap',
  html: `<span style="display:flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:#fff;border:1.5px solid #2A7FB8;box-shadow:0 1px 2px rgba(20,56,74,0.45);">
    <svg width="9" height="9" viewBox="0 0 24 24"><line x1="4" y1="2" x2="4" y2="22" stroke="#2A7FB8" stroke-width="3" stroke-linecap="round"/><path d="M5 3 L21 7.5 L5 12 Z" fill="#2A7FB8"/></svg>
  </span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
// Türkiye geneli (uzak) zoom'da 16 işaretin hepsi aynı anda görünmesi hem kalabalık hem de
// anlamsız (nokta gibi kalıyorlar) — kullanıcı o şehre/bölgeye yakınlaşınca (bkz.
// YORUM_ISARET_MIN_ZOOM'daki aynı mantık) belirmeleri istendi.
const MAVI_BAYRAK_MIN_ZOOM = 11;
let maviBayrakIsaretleri = [];
function maviBayrakIsaretleriniGoster() {
  maviBayrakIsaretleri.forEach(m => map.removeLayer(m));
  maviBayrakIsaretleri = [];
  MAVI_BAYRAK_PLAJLAR.forEach(plaj => {
    const isaret = L.marker([plaj.lat, plaj.lon], { icon: MAVI_BAYRAK_IKON, zIndexOffset: -100 });
    isaret.bindTooltip(t('mavi_bayrak_rozeti', bolgeAdi(plaj)), { direction: 'top', offset: [0, -6] });
    if (map.getZoom() >= MAVI_BAYRAK_MIN_ZOOM) isaret.addTo(map);
    maviBayrakIsaretleri.push(isaret);
  });
}
function maviBayrakGorunurlukGuncelle() {
  const goster = map.getZoom() >= MAVI_BAYRAK_MIN_ZOOM;
  maviBayrakIsaretleri.forEach(m => {
    const haritada = map.hasLayer(m);
    if (goster && !haritada) m.addTo(map);
    else if (!goster && haritada) { m.closeTooltip(); map.removeLayer(m); }
  });
}

// Halka açık ama Mavi Bayrak SERTİFİKASI OLMAYAN plajlar — aynı zoom mantığı, ama farklı
// bir ikon/renk (turuncu şemsiye) ile Mavi Bayrak'la karışmasın diye görsel olarak ayrılıyor.
const HALK_PLAJI_IKON = L.divIcon({
  className: 'halk-plaji-isaret-wrap',
  html: `<span style="display:flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:#fff;border:1.5px solid #B9812E;box-shadow:0 1px 2px rgba(20,56,74,0.45);font-size:9px;line-height:1;">🏖️</span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
let halkPlajiIsaretleri = [];
function halkPlajiIsaretleriniGoster() {
  halkPlajiIsaretleri.forEach(m => map.removeLayer(m));
  halkPlajiIsaretleri = [];
  HALK_PLAJLARI.forEach(plaj => {
    const isaret = L.marker([plaj.lat, plaj.lon], { icon: HALK_PLAJI_IKON, zIndexOffset: -100 });
    isaret.bindTooltip(t('halk_plaji_rozeti', bolgeAdi(plaj)), { direction: 'top', offset: [0, -6] });
    if (map.getZoom() >= MAVI_BAYRAK_MIN_ZOOM) isaret.addTo(map);
    halkPlajiIsaretleri.push(isaret);
  });
}
function halkPlajiGorunurlukGuncelle() {
  const goster = map.getZoom() >= MAVI_BAYRAK_MIN_ZOOM;
  halkPlajiIsaretleri.forEach(m => {
    const haritada = map.hasLayer(m);
    if (goster && !haritada) m.addTo(map);
    else if (!goster && haritada) { m.closeTooltip(); map.removeLayer(m); }
  });
}

async function tumYorumNoktalariniGoster() {
  if (!supabaseClient) return;
  try {
    const { data, error } = await supabaseClient
      .from('geri_bildirimler')
      .select('*')
      .gte('created_at', new Date(Date.now() - GB_PENCERE_SAAT * 3600 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(300);
    if (error || !data) return;

    // Eski işaretleri temizle
    yorumNoktaIsaretleri.forEach(m => map.removeLayer(m));
    yorumNoktaIsaretleri = [];

    // Konumları grupla
    const gruplar = {};
    data.forEach(d => {
      const key = konumGrupAnahtari(d.lat, d.lon);
      if (!gruplar[key]) gruplar[key] = { lat: d.lat, lon: d.lon, kayitlar: [] };
      // durum burada normalize edilir (bkz. durumNormallestir) ki bu grubu okuyan HER
      // yer (sayım, rozet rengi, liste) eski 'iyi' kayıtlarını ayrıca ele almak zorunda kalmasın.
      gruplar[key].kayitlar.push({ ...d, durum: durumNormallestir(d.durum) });
    });

    Object.entries(gruplar).forEach(([key, grup]) => {
      const sayim = { carsaf: 0, hafif: 0, fazla: 0, tehlikeli: 0 };
      grup.kayitlar.forEach(d => { sayim[d.durum] = (sayim[d.durum] || 0) + 1; });
      const baskin = SIRA.reduce((a, b) => sayim[b] >= sayim[a] ? b : a, "carsaf");
      const r = aktifRenkler()[baskin];

      const isaret = L.marker([grup.lat, grup.lon], { icon: noktaIkonuOlustur(konumRengi(key)) });

      const liste = grup.kayitlar.map(d => ({
        id: d.id, durum: d.durum, not: d.not_metni || "", zaman: new Date(d.created_at).getTime(),
        isim: d.kullanici_adi || t('anonim'), foto: d.foto_url || null, sikayet: d.sikayet_sayisi || 0,
        faydali: d.faydali_sayisi || 0, begenmedi: d.begenmedi_sayisi || 0,
      }));
      const yorumlarHtml = liste.slice(0, 8).map(gb => {
        const rr = aktifRenkler()[gb.durum];
        const isimGuvenli = escapeHtml(gb.isim || t('anonim'));
        const cokSikayetli = (gb.sikayet || 0) >= SIKAYET_ESIK_YORUM;
        const fotoGizli = (gb.sikayet || 0) >= SIKAYET_ESIK_FOTO;
        return `<div style="display:flex;gap:7px;padding:6px 0;border-top:1px solid rgba(20,56,74,0.08);opacity:${cokSikayetli ? 0.4 : 1};">
          <span style="width:18px;height:18px;border-radius:50%;background:${rr.bg};border:1.5px solid ${rr.border};flex-shrink:0;margin-top:1px;"></span>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
              <span style="font-size:11.5px;font-weight:600;color:${YORUM_ISIM_RENGI};">${isimGuvenli}</span>
              <span style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                <span style="font-size:10px;color:#9AAEBA;white-space:nowrap;">${zamanFormat(gb.zaman)}</span>
                ${bildirButonuHtml(gb)}
              </span>
            </div>
            <div style="display:inline-flex;align-items:center;gap:4px;margin-top:3px;padding:2px 8px;border-radius:999px;background:${rr.bg};border:1px solid ${rr.border};font-size:10px;font-weight:700;color:${rr.text900};">${durumRozetiSvg(gb.durum)}${ilkHarfBuyuk(ETIKET_KISA(gb.durum))}</div>
            ${gb.not ? `<div style="font-size:11px;color:#4F7286;margin-top:4px;">${escapeHtml(gb.not)}</div>` : ""}
            ${gb.foto && !fotoGizli ? `<a href="${escapeHtml(gb.foto)}" target="_blank" rel="noopener"><img src="${escapeHtml(gb.foto)}" loading="lazy" alt="${t('kullanici_fotografi')}" style="display:block;width:100%;max-width:150px;border-radius:8px;margin-top:5px;object-fit:cover;"/></a>` : ""}
            ${gb.foto && fotoGizli ? `<div style="font-size:10px;color:#993C1D;margin-top:4px;">${t('foto_gizlendi')}</div>` : ""}
            ${cokSikayetli ? `<div style="font-size:10px;color:#993C1D;margin-top:4px;">${t('sikayetli_yorum')}</div>` : ""}
            ${begeniButonlariHtml(gb)}
          </div>
        </div>`;
      }).join("");

      const grupYuzde = grup.kayitlar.length > 0 ? Math.round((sayim[baskin] / grup.kayitlar.length) * 100) : 0;
      const icerikHtml = `
        <div style="font-family:'Inter',sans-serif;width:220px;border-radius:15px;overflow:hidden;">
          <div style="background:${r.bg};padding:11px 13px 8px;">
            <div style="font-size:12.5px;font-weight:700;color:${r.text900};">${ilkHarfBuyuk(ETIKET_KISA(baskin))} <span style="opacity:0.7;font-weight:600;">(%${grupYuzde})</span></div>
            <div style="font-size:10.5px;color:${r.text600};margin-top:1px;">${t('kisi_bildirdi', grup.kayitlar.length)}</div>
          </div>
          <div style="background:#fff;padding:2px 13px 4px;max-height:200px;overflow-y:auto;">${yorumlarHtml}</div>
        </div>`;

      isaret.bindPopup(icerikHtml, { className: "deniz-balon", maxWidth: 240 });
      isaret.on('click', () => {
        // Harita işaretçisine tıklayınca sağ panel de güncellenir — bu noktanın
        // güncel yorumları gb-section'da gösterilir, eski konumun verisi temizlenir.
        noktayaGit(grup.lat, grup.lon, false);
      });
      yorumNoktaIsaretleri.push(isaret);
    });

    yorumIsaretGorunurlukGuncelle();
    sonGruplarOnbellek = gruplar;
    yakinYorumlariDurumGuncelle();
  } catch (e) {
    console.error("Yorum noktaları yüklenemedi:", e);
  }
}

// Sağ taraftaki (mobilde alta düşen) panelde, son 2 saatte yorum alan noktaları
// çoğunluk görüşüne göre listeler — en çok yorum alandan en aza doğru sıralı.
// Nokta işaretleriyle (bkz. YORUM_ISARET_MIN_ZOOM) AYNI mantığı kullanıyor: kullanıcı
// tıklamasa bile, haritada o an GÖRÜNEN (yeterince yakınlaştırılmış + görünür alandaki)
// noktalar otomatik olarak burada da listelenir. Harita kaydırıldıkça/yakınlaştırıldıkça
// bu liste de canlı güncellenir (bkz. map.on('moveend'/'zoomend') aşağıda).
let sonGruplarOnbellek = {};

// "Yakındaki Yorumlar" paneli — eski her-zaman-açık kenar panelinin yerine geçti (bkz.
// proje notları: kullanıcı önce o panelin tamamen kaldırılmasını istedi, sonra bunun yerine
// aç/kapa (toggle) bir sürüm istedi). Harita yeterince yakınlaştırılınca ("Sadece yorumları
// gör") butonu belirir; tıklanınca o an haritada görünen sınırlar içindeki yorum kümeleri
// listelenir. Harita her hareket ettiğinde (kaydırma/zoom) liste tekrar kapanır — kullanıcı
// "başka yere geçince kaybolsun" istedi, yani her yeni konum için yeniden tıklamak gerekir.
let yakinYorumlarAcik = false;
function yakinYorumlariDurumGuncelle() {
  sonGruplarOnbellek = sonGruplarOnbellek || {};
  const yakinMi = map.getZoom() >= YORUM_ISARET_MIN_ZOOM;
  if (!yakinMi) yakinYorumlarAcik = false;

  // Anasayfadaki 3'lü grid paneli — sadece anasayfada var.
  const toggleBtn = document.getElementById('yakin-yorumlar-toggle');
  const durumEl = document.getElementById('yakin-yorumlar-durum');
  const kapsayici = document.getElementById('yan-panel-liste');
  if (toggleBtn && durumEl && kapsayici) {
    toggleBtn.style.display = yakinMi ? 'inline-flex' : 'none';
    durumEl.style.display = yakinMi ? 'none' : 'block';
    kapsayici.style.display = yakinYorumlarAcik ? 'block' : 'none';
    toggleBtn.textContent = yakinYorumlarAcik ? t('yakin_yorumlar_gizle') : t('yakin_yorumlar_gor');
    if (yakinYorumlarAcik) yakinYorumlariListeyiDoldur('yan-panel-liste');
  }

  // Tam ekran haritanın sol kenarındaki sekme + küçük kart — HER sayfada var (harita
  // olan her yerde), böylece anasayfa dışındaki il/ilçe sayfalarında da tam ekran
  // haritada yakındaki yorumlara erişilebiliyor. Aynı aç/kapa durumunu (yakinYorumlarAcik)
  // paylaşır — anasayfadaki panelle senkronize kalır.
  const tamEkranWrap = document.getElementById('tam-ekran-yorumlar-wrap');
  const tamEkranTab = document.getElementById('tam-ekran-yorumlar-tab');
  const tamEkranKart = document.getElementById('tam-ekran-yorumlar-kart');
  if (tamEkranWrap && tamEkranTab && tamEkranKart) {
    const tamEkranVeYakin = haritaTamEkranAktif && yakinMi;
    tamEkranWrap.style.display = tamEkranVeYakin ? 'flex' : 'none';
    tamEkranTab.textContent = yakinYorumlarAcik ? t('yakin_yorumlar_gizle') : t('yakin_yorumlar_gor');
    tamEkranKart.style.display = (tamEkranVeYakin && yakinYorumlarAcik) ? 'block' : 'none';
    if (tamEkranVeYakin && yakinYorumlarAcik) yakinYorumlariListeyiDoldur('tam-ekran-yorumlar-liste');
  }
}

function yakinYorumlariListeyiDoldur(kapsayiciId) {
  const kapsayici = document.getElementById(kapsayiciId);
  if (!kapsayici) return;

  const sinirlar = map.getBounds();
  const liste = Object.values(sonGruplarOnbellek)
    .filter(grup => sinirlar.contains([grup.lat, grup.lon]))
    .map(grup => {
      const sayim = { carsaf: 0, hafif: 0, fazla: 0, tehlikeli: 0 };
      grup.kayitlar.forEach(d => { sayim[d.durum] = (sayim[d.durum] || 0) + 1; });
      const baskin = SIRA.reduce((a, b) => sayim[b] >= sayim[a] ? b : a, "carsaf");
      const sonZaman = Math.max(...grup.kayitlar.map(d => new Date(d.created_at).getTime()));
      const bolge = denizBolgesi(grup.lat, grup.lon);
      const kayitlaKonum = grup.kayitlar.find(d => d.konum_metni)?.konum_metni || null;
      const adKisa = kayitlaKonum || bolgeAdi(bolge) || `${grup.lat.toFixed(2)}, ${grup.lon.toFixed(2)}`;
      return { lat: grup.lat, lon: grup.lon, baskin, sayi: grup.kayitlar.length, sonZaman, ad: adKisa };
    });

  liste.sort((a, b) => b.sayi - a.sayi || b.sonZaman - a.sonZaman);

  if (liste.length === 0) {
    kapsayici.innerHTML = `<div class="yan-panel-empty">${t('yan_panel_bos')}</div>`;
    return;
  }

  kapsayici.innerHTML = liste.slice(0, 10).map((item, i) => {
    const r = aktifRenkler()[item.baskin];
    return `
      <div class="yan-panel-item" data-i="${i}">
        <span class="yan-panel-dot" style="background:${r.border};"></span>
        <div style="flex:1;min-width:0;">
          <div class="yan-panel-ad">${escapeHtml(item.ad)}</div>
          <div class="yan-panel-meta">${ETIKET_KISA(item.baskin)} · ${t('yorum_sayisi', item.sayi)} · ${zamanFormat(item.sonZaman)}</div>
        </div>
      </div>`;
  }).join("");

  kapsayici.querySelectorAll('.yan-panel-item').forEach(el => {
    el.addEventListener('click', () => {
      const item = liste[parseInt(el.dataset.i, 10)];
      map.setView([item.lat, item.lon], YORUM_ISARET_MIN_ZOOM);
      noktayaGit(item.lat, item.lon, false);
    });
  });
}

function gbBeklemeKontrolEt() {
  let sonGonderim = null;
  try { sonGonderim = parseInt(localStorage.getItem('deniz-durumu-son-gonderim') || "0", 10); } catch (e) {}
  if (sonGonderim && Date.now() - sonGonderim < GB_BEKLEME_SURESI_MS) {
    const kalanDk = Math.ceil((GB_BEKLEME_SURESI_MS - (Date.now() - sonGonderim)) / 60000);
    return kalanDk;
  }
  return 0;
}

function gbGonderimZamaniKaydet() {
  try { localStorage.setItem('deniz-durumu-son-gonderim', String(Date.now())); } catch (e) {}
}

// Kullanıcının seçtiği fotoğrafı Supabase Storage'a yükler, herkese açık URL'sini döndürür.
// Bucket ve politikalar sql/schema.sql'de tanımlı — anon SADECE ekleyebilir, silemez/değiştiremez
// (diğer tablolarla aynı güvenlik prensibi). Bucket/migration henüz kurulmadıysa (storage
// hatası) sessizce null döner — fotoğrafsız gönderim yine de devam eder.
const GB_FOTO_BUCKET = 'yorum-fotolari';
async function fotoYukle(dosya) {
  if (!supabaseClient || !dosya) return null;
  try {
    const uzanti = (dosya.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const dosyaAdi = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${uzanti}`;
    const { error } = await supabaseClient.storage.from(GB_FOTO_BUCKET).upload(dosyaAdi, dosya, { cacheControl: '3600', upsert: false });
    if (error) { console.error("Fotoğraf yüklenemedi:", error); return null; }
    const { data } = supabaseClient.storage.from(GB_FOTO_BUCKET).getPublicUrl(dosyaAdi);
    return data ? data.publicUrl : null;
  } catch (e) {
    console.error("Fotoğraf yüklenemedi:", e);
    return null;
  }
}

async function bildirimEkle(lat, lon, durum, not, isim, konumMetni, fotoUrl) {
  const kalanDk = gbBeklemeKontrolEt();
  if (kalanDk > 0) {
    return { basarili: false, mesaj: t('cok_sik_bildirim', kalanDk) };
  }
  if (supabaseClient) {
    // Önce tüm alanlarla dene; konum_metni/foto_url kolonları henüz eklenmemişse (SQL
    // migration çalıştırılmadıysa) sütun hatası alırız — bu durumda o alanı çıkarıp
    // tekrar deneriz, böylece migration yapılmayan kurulumlarda da site çökmez.
    const kayit = { lat, lon, durum, not_metni: not || null, kullanici_adi: isim, konum_metni: konumMetni || null, foto_url: fotoUrl || null };
    let result = await supabaseClient.from('geri_bildirimler').insert(kayit);
    for (let deneme = 0; deneme < 2 && result.error && result.error.message; deneme++) {
      const eksikAlan = ['konum_metni', 'foto_url'].find(k => k in kayit && result.error.message.includes(k));
      if (!eksikAlan) break;
      delete kayit[eksikAlan];
      result = await supabaseClient.from('geri_bildirimler').insert(kayit);
    }

    if (result.error) {
      console.error("Supabase yazma hatası:", result.error);
      return { basarili: false, mesaj: t('gonderilemedi') };
    }
    gbGonderimZamaniKaydet();
    return { basarili: true };
  }
  const key = konumAnahtari(lat, lon);
  if (!state.geriBildirimlerYerel[key]) state.geriBildirimlerYerel[key] = [];
  state.geriBildirimlerYerel[key].unshift({ durum, not, isim, konum: konumMetni, foto: fotoUrl || null, zaman: Date.now() });
  gbGonderimZamaniKaydet();
  return { basarili: true };
}

const GB_ISIM_ANAHTARI = 'deniz-durumu-kullanici-adi';

function kayitliIsmiGetir() {
  try { return localStorage.getItem(GB_ISIM_ANAHTARI) || ""; } catch (e) { return ""; }
}
// Sayfada isim girilen TEK bir yer var (sayfanın en üstündeki isim kartı) — hem deniz
// durumu yorumu hem site geri bildirimi bu tek kayıtlı ismi kullanır, ikisi de kendi
// başına isim istemez. Bir yerde ismi değiştirmek her yeri günceller.
function ismiKaydet(isim) {
  try { localStorage.setItem(GB_ISIM_ANAHTARI, isim); } catch (e) {}
  isimAlaniniGuncelle();
}

function isimAlaniniGuncelle() {
  const kayitli = kayitliIsmiGetir();
  const gbRow = document.getElementById('gb-name-row');
  const gbSaved = document.getElementById('gb-name-saved');
  const gbSavedText = document.getElementById('gb-name-saved-text');
  if (kayitli) {
    gbRow.style.display = "none";
    gbSaved.style.display = "flex";
    gbSavedText.textContent = t('isim_yapacaksin', kayitli);
  } else {
    gbRow.style.display = "flex";
    gbSaved.style.display = "none";
    document.getElementById('gb-isim').value = "";
  }
}
isimAlaniniGuncelle();

// Bir yorum/değerlendirme göndermeye çalışırken isim kayıtlı değilse, ikinci bir isim
// kutusu göstermek yerine kullanıcıyı sayfanın en üstündeki TEK isim alanına yönlendiriyoruz.
function isimGerekliUyar() {
  const input = document.getElementById('gb-isim');
  if (!input) return;
  input.scrollIntoView({ behavior: 'smooth', block: 'center' });
  input.focus();
  input.style.borderColor = "#D85A30";
  input.placeholder = t('isim_gerekli_uyari');
}

function isimKaydetTiklandi() {
  const girilenIsim = document.getElementById('gb-isim').value.trim();
  if (!girilenIsim) {
    isimGerekliUyar();
    return;
  }
  ismiKaydet(girilenIsim);
}
document.getElementById('gb-isim-kaydet-btn').addEventListener('click', isimKaydetTiklandi);
document.getElementById('gb-isim').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') isimKaydetTiklandi();
});

document.getElementById('gb-name-degistir').addEventListener('click', () => {
  ismiKaydet("");
});

async function gbAlaniniGuncelle() {
  const gbSection = document.getElementById('gb-section');
  const communityLabel = document.getElementById('community-label');
  const summaryWrap = document.getElementById('community-summary-wrap');
  const conflictNote = document.getElementById('conflict-note');

  // Karadaysak geri bildirim bölümünü tamamen gizle — kumsalda olmayan bir nokta için
  // "deniz nasıl" sormak anlamsız. Aynı şekilde bir TAHMİN günü (bugün değil) görüntüleniyorsa
  // da gizle — "şu an oradaysan deniz nasıl?" sorusu ve sahadan gelen yorumlar sadece "şimdi"
  // için anlamlı, gelecekteki bir gün için değil.
  if (!state.denizdeyiz || state.gunOfset !== 0) {
    gbSection.style.display = "none";
    communityLabel.style.display = "none";
    summaryWrap.style.display = "none";
    conflictNote.style.display = "none";
    if (state.marker) state.marker.closePopup();
    return;
  }

  gbSection.style.display = "block";
  document.getElementById('gb-sent').style.display = "none";
  document.getElementById('gb-input-row').style.display = "none";
  document.getElementById('gb-foto-row').style.display = "none";
  state.secilenGB = null;
  document.querySelectorAll('.gb-btn').forEach(b => {
    b.classList.remove('active');
    b.style.borderColor = "rgba(40,40,30,0.12)";
    b.style.background = "white";
    b.style.color = "#6B6A60";
  });
  document.getElementById('gb-note').value = "";
  fotoSecimTemizle();

  communityLabel.style.display = "block";
  summaryWrap.style.display = "block";
  summaryWrap.innerHTML = `<div class="community-empty">${t('yorumlar_yukleniyor')}</div>`;

  const { liste, hata } = await bildirimleriGetir(state.lat, state.lon);

  if (hata) {
    summaryWrap.innerHTML = `<div class="community-empty">${t('sahadan_bildirim_yuklenemedi')}</div>`;
    if (state.marker) state.marker.closePopup();
    return;
  }

  if (liste.length === 0) {
    summaryWrap.innerHTML = `<div class="community-empty"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg><span>${t('bu_cevrede_bildirim_yok')}</span></div>`;
    conflictNote.style.display = "none";
    if (state.marker) state.marker.closePopup();
    return;
  }

  const sayim = { carsaf: 0, hafif: 0, fazla: 0, tehlikeli: 0 };
  liste.forEach(gb => { sayim[gb.durum]++; });

  const baskinDurum = SIRA.reduce((a, b) => sayim[b] >= sayim[a] ? b : a, "carsaf");
  const r = aktifRenkler()[baskinDurum];
  const baskinYuzdeKart = liste.length > 0 ? Math.round((sayim[baskinDurum] / liste.length) * 100) : 0;

  summaryWrap.innerHTML = `
    <div class="community-summary" style="background:${r.bg};border-color:${r.border};">
      <span class="dot" style="background:${r.border};width:11px;height:11px;"></span>
      <div class="big-label" style="color:${r.text900}">${t('cogunluga_gore', ETIKET_KISA(baskinDurum), baskinYuzdeKart)}</div>
      <div class="community-counts">
        ${SIRA.filter(d => sayim[d] > 0).map(d => `<span><span class="dot" style="background:${aktifRenkler()[d].border}"></span>${sayim[d]}</span>`).join("")}
      </div>
    </div>`;

  haritaBaloncuguGoster(baskinDurum, sayim, liste);

  if (state.bizimDurum && baskinDurum !== state.bizimDurum) {
    conflictNote.style.display = "flex";
    conflictNote.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#854F0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12.01" y2="16"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
      <span>${t('catisma_notu', ETIKET_KISA(state.bizimDurum), ETIKET_KISA(baskinDurum))}</span>`;
  } else {
    conflictNote.style.display = "none";
  }
}

document.querySelectorAll('.gb-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.dataset.val;
    state.secilenGB = val;
    const r = aktifRenkler()[val];
    document.querySelectorAll('.gb-btn').forEach(b => {
      const active = b === btn;
      b.classList.toggle('active', active);
      b.style.borderColor = active ? r.border : "rgba(40,40,30,0.12)";
      b.style.background = active ? r.bg : "white";
      b.style.color = active ? r.text900 : "#6B6A60";
    });
    document.getElementById('gb-input-row').style.display = "flex";
    document.getElementById('gb-foto-row').style.display = "flex";
  });
});

const GB_FOTO_MAX_MB = 5;
function fotoSecimTemizle() {
  const input = document.getElementById('gb-foto-input');
  input.value = "";
  const onizleme = document.getElementById('gb-foto-onizleme');
  if (onizleme.src) { try { URL.revokeObjectURL(onizleme.src); } catch (e) {} }
  onizleme.style.display = "none";
  onizleme.removeAttribute('src');
  document.getElementById('gb-foto-btn').style.display = "flex";
  document.getElementById('gb-foto-kaldir').style.display = "none";
  document.getElementById('gb-foto-hata').style.display = "none";
}
document.getElementById('gb-foto-input').addEventListener('change', (e) => {
  const dosya = e.target.files[0];
  const hataEl = document.getElementById('gb-foto-hata');
  hataEl.style.display = "none";
  if (!dosya) return;
  if (!dosya.type.startsWith('image/')) {
    fotoSecimTemizle();
    hataEl.textContent = t('foto_sadece_resim');
    hataEl.style.display = "inline";
    return;
  }
  if (dosya.size > GB_FOTO_MAX_MB * 1024 * 1024) {
    fotoSecimTemizle();
    hataEl.textContent = t('foto_boyut_limit', GB_FOTO_MAX_MB);
    hataEl.style.display = "inline";
    return;
  }
  const onizleme = document.getElementById('gb-foto-onizleme');
  onizleme.src = URL.createObjectURL(dosya);
  onizleme.style.display = "block";
  document.getElementById('gb-foto-btn').style.display = "none";
  document.getElementById('gb-foto-kaldir').style.display = "flex";
});
document.getElementById('gb-foto-kaldir').addEventListener('click', fotoSecimTemizle);

document.getElementById('gb-send').addEventListener('click', async () => {
  if (!state.secilenGB || state.lat == null) return;

  const isim = kayitliIsmiGetir();
  if (!isim) {
    isimGerekliUyar();
    return;
  }

  const not = document.getElementById('gb-note').value.trim();
  const sendBtn = document.getElementById('gb-send');
  sendBtn.disabled = true;
  sendBtn.style.opacity = "0.5";

  const secilenFoto = document.getElementById('gb-foto-input').files[0] || null;
  const fotoUrl = secilenFoto ? await fotoYukle(secilenFoto) : null;

  const sonuc = await bildirimEkle(state.lat, state.lon, state.secilenGB, not, isim, state.konumMetni, fotoUrl);

  sendBtn.disabled = false;
  sendBtn.style.opacity = "1";

  if (sonuc.basarili) {
    await gbAlaniniGuncelle();
    tumYorumNoktalariniGoster();
    document.getElementById('gb-sent').textContent = t('bildirim_kaydedildi');
    document.getElementById('gb-sent').style.color = "#2A7FB8";
    document.getElementById('gb-sent').style.display = "block";
  } else {
    document.getElementById('gb-sent').textContent = sonuc.mesaj || t('gonderilemedi');
    document.getElementById('gb-sent').style.color = "#993C1D";
    document.getElementById('gb-sent').style.display = "block";
  }
});

// Topluluk geri bildirimini, tıklanan noktanın hemen üstünde bir Leaflet popup'ı
// (konuşma balonu) olarak gösterir. Üstte çoğunluk özeti, altında TÜM yorumlar alt alta,
// her biri isim/durum/zaman ile listelenir. Liste uzunsa kaydırılabilir, haritayı kaplamaz.
function haritaBaloncuguGoster(baskinDurum, sayim, liste) {
  if (!state.marker) return;
  const r = aktifRenkler()[baskinDurum];
  const toplamKisi = liste.length;
  const baskinYuzde = toplamKisi > 0 ? Math.round((sayim[baskinDurum] / toplamKisi) * 100) : 0;

  const yorumlarHtml = liste.slice(0, 12).map(gb => {
    const rr = aktifRenkler()[gb.durum];
    const isimGuvenli = escapeHtml(gb.isim || t('anonim'));
    const dakikaFark = (Date.now() - gb.zaman) / 60000;
    const cokSikayetli = (gb.sikayet || 0) >= SIKAYET_ESIK_YORUM;
    const fotoGizli = (gb.sikayet || 0) >= SIKAYET_ESIK_FOTO;
    const opaklik = cokSikayetli ? 0.35 : Math.max(0.5, 1 - dakikaFark / 120);
    return `
      <div style="display:flex;gap:7px;padding:7px 0;border-top:1px solid rgba(20,56,74,0.08);opacity:${opaklik.toFixed(2)};">
        <span style="width:22px;height:22px;border-radius:50%;background:${rr.bg};border:1.5px solid ${rr.border};flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:1px;">
          <span style="width:6px;height:6px;border-radius:50%;background:${rr.border};display:inline-block;"></span>
        </span>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
            <span style="font-size:12px;font-weight:600;color:${YORUM_ISIM_RENGI};">${isimGuvenli}</span>
            <span style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
              <span style="font-size:10.5px;color:#9AAEBA;white-space:nowrap;">${zamanFormat(gb.zaman)}</span>
              ${bildirButonuHtml(gb)}
            </span>
          </div>
          <div style="display:inline-flex;align-items:center;gap:4px;margin-top:3px;padding:2px 9px;border-radius:999px;background:${rr.bg};border:1px solid ${rr.border};font-size:10.5px;font-weight:700;color:${rr.text900};">${durumRozetiSvg(gb.durum)}${ilkHarfBuyuk(ETIKET_KISA(gb.durum))}</div>
          ${gb.not ? `<div style="font-size:11.5px;color:#4F7286;margin-top:4px;line-height:1.35;">${escapeHtml(gb.not)}</div>` : ""}
          ${gb.foto && !fotoGizli ? `<a href="${escapeHtml(gb.foto)}" target="_blank" rel="noopener"><img src="${escapeHtml(gb.foto)}" loading="lazy" alt="${t('kullanici_fotografi')}" style="display:block;width:100%;max-width:170px;border-radius:8px;margin-top:5px;object-fit:cover;"/></a>` : ""}
          ${gb.foto && fotoGizli ? `<div style="font-size:10.5px;color:#993C1D;margin-top:4px;">${t('foto_gizlendi')}</div>` : ""}
          ${cokSikayetli ? `<div style="font-size:10.5px;color:#993C1D;margin-top:4px;">${t('sikayetli_yorum')}</div>` : ""}
          ${begeniButonlariHtml(gb)}
        </div>
      </div>`;
  }).join("");

  // Kendi hesapladığımız tahmini (state.bizimDurum), sahadan gelen çoğunluk görüşüyle
  // yan yana koyup uyuşup uyuşmadığını göze çarpan bir kutuda gösteriyoruz — kullanıcı
  // "bizim tahmin mi doğru, saha mı" sorusunu tek bakışta yanıtlayabilsin diye.
  let karsilastirmaHtml = "";
  if (state.bizimDurum != null) {
    const uyusuyor = state.bizimDurum === baskinDurum;
    const bizimEtiket = ilkHarfBuyuk(ETIKET_KISA(state.bizimDurum));
    const sahaEtiket = ilkHarfBuyuk(ETIKET_KISA(baskinDurum));
    if (uyusuyor) {
      karsilastirmaHtml = `<div style="margin:9px 15px 0;padding:8px 10px;border-radius:10px;background:rgba(29,158,117,0.12);border:1px solid rgba(29,158,117,0.35);display:flex;align-items:center;gap:6px;color:#0F6E56;font-size:11px;font-weight:500;line-height:1.35;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${t('tahminimiz_uyusuyor', bizimEtiket)}</span>
      </div>`;
    } else {
      karsilastirmaHtml = `<div style="margin:9px 15px 0;padding:8px 10px;border-radius:10px;background:#FBF1DE;border:1px solid #E0B765;display:flex;align-items:center;gap:6px;color:#5C3F0C;font-size:11px;font-weight:500;line-height:1.35;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>${t('tahminimiz_uyusmuyor', bizimEtiket, sahaEtiket)}</span>
      </div>`;
    }
  }

  const icerik = `
    <div style="font-family:'Inter',sans-serif;width:250px;border-radius:15px;overflow:hidden;">
      <div style="background:linear-gradient(135deg, ${r.bg} 0%, ${r.bg} 100%);padding:13px 15px 10px;">
        <div style="display:flex;align-items:center;gap:7px;">
          <span style="width:10px;height:10px;border-radius:50%;background:${r.border};flex-shrink:0;"></span>
          <div style="flex:1;">
            <div style="font-size:13.5px;font-weight:700;color:${r.text900};line-height:1.2;">
              ${t('cogunluga_gore', ETIKET_KISA(baskinDurum), baskinYuzde)}
            </div>
            <div style="font-size:10.5px;color:${r.text600};margin-top:1px;">${t('kisi_bildirdi', toplamKisi)}</div>
          </div>
        </div>
      </div>
      ${karsilastirmaHtml}
      <div style="background:#fff;padding:4px 15px 6px;max-height:230px;overflow-y:auto;">${yorumlarHtml}</div>
    </div>`;

  // Balon artık OTOMATİK açılmıyor — sadece işaretin (pinin) kendisine tıklanınca açılır
  // (Leaflet'te bindPopup zaten bunu varsayılan sağlıyor). Önceden her tıklamada balon
  // kendiliğinden açılıp haritayı da balonu göstermek için kaydırıyordu, bu rahatsız ediciydi.
  if (!state.marker.getPopup()) {
    state.marker.bindPopup(icerik, {
      closeButton: true,
      className: "deniz-balon",
      offset: [0, -2],
      maxWidth: 260,
      autoPanPadding: [20, 20],
    });
  } else {
    state.marker.setPopupContent(icerik);
  }
}

// Tıklanan noktayı işaretleyen pin HER ZAMAN bu sabit lacivert renkte — "şu an baktığım
// yer" işareti konuma/duruma göre değişmiyor. Deniz durumunun rengi (iyi/kötü/tehlikeli vb.)
// ayrıca DURUM_HALKA_RENK ile, pinin altına çizilen bir halkada gösteriliyor (bkz. kartiCiz
// içindeki durumHalkasiniGuncelle çağrısı) — böylece pin konumu hep aynı renkte tanınabilir
// kalırken, durum bilgisi de haritadan kaybolmuyor.
const TIKLAMA_PIN_RENGI = "#14213D";

function noktayaGit(lat, lng, haritayiOdakla, sonNoktaKaydet = true) {
  // Yeni bir nokta seçiliyor — kullanıcı önceki noktada tam ekran panelini elle kapatmış
  // olsa bile, bu YENİ nokta için panel yine normal şekilde açılabilsin.
  tamEkranPanelKapatildiMi = false;
  const ikon = pinIkonuOlustur(TIKLAMA_PIN_RENGI);
  if (state.marker) {
    state.marker.setLatLng([lat, lng]);
    state.marker.setIcon(ikon);
  } else {
    state.marker = L.marker([lat, lng], { icon: ikon }).addTo(map);
  }
  if (haritayiOdakla) map.setView([lat, lng], YORUM_ISARET_MIN_ZOOM);
  veriCekVeGoster(lat, lng);
  if (sonNoktaKaydet) {
    try { localStorage.setItem('deniz-durumu-son-nokta', JSON.stringify({ lat, lng })); } catch (e) {}
  }
}

map.on('click', (e) => {
  noktayaGit(e.latlng.lat, e.latlng.lng, false);
});

// Gün gezinme (önceki/sonraki gün): kart her yeni tıklamada innerHTML ile baştan
// yazıldığından ok butonlarına doğrudan dinleyici eklemek yerine, hiç yok edilmeyen
// #status-card kabına TEK SEFERLİK bir "event delegation" dinleyicisi ekliyoruz —
// hangi tıklamanın kartı olursa olsun aktifGunDegistir (bkz. veriCekVeGoster) o an
// hangi noktaya bakılıyorsa onun gün değiştirme mantığını çağırır.
const gunKartiKabı = document.getElementById('status-card');
gunKartiKabı.addEventListener('click', (e) => {
  if (e.target.closest('#gun-onceki')) aktifGunDegistir && aktifGunDegistir(-1);
  else if (e.target.closest('#gun-sonraki')) aktifGunDegistir && aktifGunDegistir(1);
});
let gunDokunmaX = null, gunDokunmaY = null, gunDokunmaSaatSeridindeMi = false;
gunKartiKabı.addEventListener('touchstart', (e) => {
  gunDokunmaX = e.touches[0].clientX;
  gunDokunmaY = e.touches[0].clientY;
  // Saatlik tahmin şeridinin (tahmin günlerinde) KENDİ yatay kaydırması var — dokunuş oradan
  // başladıysa gün değiştirme mantığını devre dışı bırakıyoruz, yoksa saatleri kaydırmak
  // istenen her hareket yanlışlıkla günü de değiştirirdi.
  gunDokunmaSaatSeridindeMi = !!e.target.closest('.hourly-strip-kaydirilabilir');
}, { passive: true });
gunKartiKabı.addEventListener('touchend', (e) => {
  if (gunDokunmaX == null) return;
  const dx = e.changedTouches[0].clientX - gunDokunmaX;
  const dy = e.changedTouches[0].clientY - gunDokunmaY;
  const saatSeridindeydi = gunDokunmaSaatSeridindeMi;
  gunDokunmaX = null;
  if (saatSeridindeydi) return;
  // Sola kaydırma (dx<0) = sonraki gün (içerik sağdan gelir); sağa kaydırma (dx>0) = önceki gün.
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
    aktifGunDegistir && aktifGunDegistir(dx < 0 ? 1 : -1);
  }
}, { passive: true });

// Kullanıcı haritayı SÜRÜKLEMEYE (elle kaydırmaya) başlar başlamaz — artık başka bir yere
// bakıyor olabileceği için — tıkladığımız pini (yorum yapılmış konum noktaları DEĞİL, sadece
// bizim seçtiğimiz tekil işaret) ve rüzgar/dalga veri kartını (hem normal hem tam ekran
// haritada) kaldırıyoruz. 'dragstart' bilerek kullanıldı: 'movestart' bizim kendi
// map.setView(...) çağrılarımızda da (ör. bir noktaya git) tetiklenir, oysa burada SADECE
// kullanıcının eliyle sürüklemesini yakalamak istiyoruz.
map.on('dragstart', () => {
  state.veriCekSayac++; // eski noktaya ait arka planda bekleyen işler artık geçersiz sayılsın
  if (state.marker) {
    map.removeLayer(state.marker);
    state.marker = null;
  }
  if (state.durumCircle) {
    map.removeLayer(state.durumCircle);
    state.durumCircle = null;
  }
  document.getElementById('our-label').style.display = "none";
  const card = document.getElementById('status-card');
  card.className = "card placeholder";
  card.innerHTML = t('harita_placeholder');
  document.getElementById('gb-section').style.display = "none";
  document.getElementById('community-label').style.display = "none";
  document.getElementById('community-summary-wrap').style.display = "none";
  document.getElementById('conflict-note').style.display = "none";
  tamEkranPanelKapatildiMi = true;
  clearTimeout(tamEkranVeriTimeout);
  card.classList.add('tam-ekran-gizli');
  document.getElementById('tam-ekran-veri-kapat').classList.add('tam-ekran-gizli');
});

// "Bildir" butonları Leaflet balonlarının (popup) İÇİNDE, dinamik olarak eklenen HTML —
// her balon yeniden çizildiğinde tek tek dinleyici bağlamak yerine, document üzerinden
// olay devretme (event delegation) ile TEK bir dinleyici her zaman çalışır.
// ÖNEMLİ: Leaflet, popup içeriğindeki tıklamaların haritaya "sızıp" onu da tetiklememesi
// için popup'ın kendi içinde tıklamayı durduruyor (stopPropagation) — bu, olayın normal
// "bubble" (kabarcık) aşamasında document'a kadar ULAŞMASINI engelliyordu, buton hiç
// tepki vermiyormuş gibi duruyordu. "capture" aşamasında dinleyerek (üçüncü parametre
// true) olayı, popup onu durdurmadan ÖNCE, document'tan aşağı inerken yakalıyoruz.
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.gb-bildir-btn');
  if (!btn || btn.disabled) return;
  const id = parseInt(btn.dataset.id, 10);
  if (!id || !supabaseClient) return;

  btn.disabled = true;
  btn.style.color = "#D9362E";
  sikayetEdildiIsaretle(id);

  try {
    const { error } = await supabaseClient.rpc('sikayet_isaretle', { bildirim_id: id });
    if (error) console.error("Şikayet gönderilemedi:", error);
  } catch (err) {
    console.error("Şikayet gönderilemedi:", err);
  }
}, true);

// Beğen/beğenme — aynı sebepten (Leaflet popup'ı tıklamayı kendi içinde durduruyor)
// capture aşamasında dinliyoruz (bkz. yukarıdaki bildir butonu açıklaması). Oy verdiğin
// buton KİLİTLİ değil (bkz. begeniButonlariHtml) — bu yüzden aynı butona TEKRAR tıklamak
// "geri al" anlamına geliyor; karşı butona tıklamak (ilk defa oy vermekle aynı) yeni oy.
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.gb-begeni-btn, .gb-begenmedi-btn');
  if (!btn || btn.disabled) return;
  const id = parseInt(btn.dataset.id, 10);
  if (!id || !supabaseClient) return;

  const begeniMi = btn.classList.contains('gb-begeni-btn');
  const tur = begeniMi ? "begeni" : "begenmedi";
  const kapsayici = btn.parentElement;
  const digerBtn = kapsayici ? kapsayici.querySelector(begeniMi ? '.gb-begenmedi-btn' : '.gb-begeni-btn') : null;
  const sayacSpan = btn.querySelector('span');
  const mevcutSayi = sayacSpan ? (parseInt(sayacSpan.textContent, 10) || 0) : 0;
  const zatenBuOy = oylananlariGetir()[id] === tur;

  if (zatenBuOy) {
    // Kendi oyunu geri alıyorsun.
    if (digerBtn) digerBtn.disabled = false;
    btn.style.color = "#9AAEBA";
    if (sayacSpan) sayacSpan.textContent = String(Math.max(mevcutSayi - 1, 0));
    oySil(id);
    try {
      const { error } = await supabaseClient.rpc(begeniMi ? 'faydali_geri_al' : 'begenmedi_geri_al', { bildirim_id: id });
      if (error) console.error("Oy geri alınamadı:", error);
    } catch (err) {
      console.error("Oy geri alınamadı:", err);
    }
    return;
  }

  // Yeni oy — karşı butonu kilitliyoruz (aynı yorumu hem beğenip hem beğenmemeyi önler).
  if (digerBtn) digerBtn.disabled = true;
  btn.style.color = begeniMi ? "#1FA35C" : "#D9362E";
  if (sayacSpan) sayacSpan.textContent = String(mevcutSayi + 1);
  oyKaydet(id, tur);

  try {
    const { error } = await supabaseClient.rpc(begeniMi ? 'faydali_isaretle' : 'begenmedi_isaretle', { bildirim_id: id });
    if (error) console.error("Oy gönderilemedi:", error);
  } catch (err) {
    console.error("Oy gönderilemedi:", err);
  }
}, true);

// Yakındaki Yorumlar paneli sadece anasayfada var (il/ilçe sayfalarında yok) — bu yüzden
// güvenli (?.) erişim kullanılıyor.
document.getElementById('yakin-yorumlar-toggle')?.addEventListener('click', () => {
  yakinYorumlarAcik = !yakinYorumlarAcik;
  yakinYorumlariDurumGuncelle();
});
// Tam ekran haritanın kenar sekmesi — her sayfada var.
document.getElementById('tam-ekran-yorumlar-tab')?.addEventListener('click', () => {
  yakinYorumlarAcik = !yakinYorumlarAcik;
  yakinYorumlariDurumGuncelle();
});

document.getElementById('locate-btn').addEventListener('click', () => {
  const btn = document.getElementById('locate-btn');
  if (!navigator.geolocation) {
    btn.textContent = t('konum_desteklenmiyor');
    return;
  }
  btn.disabled = true;
  const eskiMetin = btn.innerHTML;
  btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg> ${t('konum_bulunuyor')}`;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      noktayaGit(pos.coords.latitude, pos.coords.longitude, true);
      btn.disabled = false;
      btn.innerHTML = eskiMetin;
    },
    () => {
      btn.disabled = false;
      btn.innerHTML = eskiMetin;
      btn.textContent = t('konum_izin_yok');
      setTimeout(() => { btn.innerHTML = eskiMetin; }, 2500);
    },
    { timeout: 8000 }
  );
});

setTimeout(() => {
  map.invalidateSize();
  tumYorumNoktalariniGoster();
  maviBayrakIsaretleriniGoster();
  halkPlajiIsaretleriniGoster();
  // İl/ilçe sayfalarında (SAYFA_KONUM tanımlıysa) harita zaten o bölgede açıldı (bkz. yukarıdaki
  // map init) — burada sadece o noktanın deniz durumunu otomatik getiriyoruz, ana sayfanın "son
  // bakılan nokta" hafızasına DOKUNMUYORUZ (4. parametre false) ki ziyaret bunu ezmesin.
  if (window.SAYFA_KONUM && typeof window.SAYFA_KONUM.lat === "number" && typeof window.SAYFA_KONUM.lon === "number") {
    noktayaGit(window.SAYFA_KONUM.lat, window.SAYFA_KONUM.lon, false, false);
    return;
  }
  // Önceki ziyarette bakılan bir nokta varsa onu otomatik göster; yoksa Türkiye geneli.
  let sonNokta = null;
  try {
    const kayit = localStorage.getItem('deniz-durumu-son-nokta');
    if (kayit) sonNokta = JSON.parse(kayit);
  } catch (e) {}
  if (sonNokta && typeof sonNokta.lat === "number" && typeof sonNokta.lng === "number") {
    map.setView([sonNokta.lat, sonNokta.lng], 14);
    noktayaGit(sonNokta.lat, sonNokta.lng, false);
  } else {
    map.setView([39.0, 35.5], 6);
  }
}, 150);
window.addEventListener('resize', () => map.invalidateSize());

// Yorum işaretleri sadece belli bir yakınlıktan sonra görünür (bkz. yorumIsaretGorunurlukGuncelle);
// sağ paneldeki liste de aynı görünürlük kuralına göre canlı güncellenir. Harita her
// yakınlaştırıldığında/uzaklaştırıldığında/kaydırıldığında ikisini de tazeliyoruz.
let yanPanelDebounce = null;
function haritaRenkYogunluguGuncelle() {
  const mapEl = document.getElementById('map');
  if (mapEl) mapEl.classList.toggle('map-yakin', map.getZoom() >= 14);
}

function haritaGorunumuDegisti() {
  yorumIsaretGorunurlukGuncelle();
  maviBayrakGorunurlukGuncelle();
  halkPlajiGorunurlukGuncelle();
  haritaRenkYogunluguGuncelle();
  // Harita hareket ettiğinde (kaydırma/zoom) kullanıcı artık başka bir yere bakıyor
  // olabileceği için, açık olan "Yakındaki Yorumlar" listesi kasıtlı olarak kapatılır —
  // her yeni konum için tekrar "Sadece yorumları gör" butonuna basmak gerekir.
  yakinYorumlarAcik = false;
  clearTimeout(yanPanelDebounce);
  yanPanelDebounce = setTimeout(() => yakinYorumlariDurumGuncelle(), 200);
}
map.on('zoomend', haritaGorunumuDegisti);
map.on('moveend', haritaGorunumuDegisti);

// Sayfa uzun süre açık kalırsa (örn. akşamdan geceye geçiş), temayı her 5 dakikada bir tazele.
function temaGuncelle() {
  const saat = new Date().getHours();
  let tema = "sabah";
  if (saat >= 22 || saat < 5) tema = "gece";
  else if (saat >= 16) tema = "aksam";
  else if (saat >= 12) tema = "oglen";
  document.documentElement.setAttribute('data-tema-hazirlik', tema);
}
setInterval(temaGuncelle, 5 * 60 * 1000);

const GUN_ADLARI_TR = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const AY_ADLARI_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const GUN_ADLARI_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const AY_ADLARI_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function GUN_ADLARI() { return AKTIF_DIL === 'en' ? GUN_ADLARI_EN : GUN_ADLARI_TR; }
function AY_ADLARI() { return AKTIF_DIL === 'en' ? AY_ADLARI_EN : AY_ADLARI_TR; }

// === Site hakkında geri bildirim (yıldız + mesaj) ===
(function() {
  let secilenPuan = 0;

  // Yıldız tıklamaları
  document.querySelectorAll('#site-feedback-stars button').forEach(btn => {
    btn.addEventListener('click', () => {
      secilenPuan = parseInt(btn.dataset.puan, 10);
      document.querySelectorAll('#site-feedback-stars button').forEach(b => {
        const p = parseInt(b.dataset.puan, 10);
        b.classList.toggle('dolu', p <= secilenPuan);
      });
    });
  });

  // Gönder butonu
  document.getElementById('site-feedback-gonder').addEventListener('click', async () => {
    const sonucEl = document.getElementById('site-feedback-sonuc');
    const mesajEl = document.getElementById('site-feedback-mesaj');
    const gondBtn = document.getElementById('site-feedback-gonder');

    if (secilenPuan === 0) {
      sonucEl.textContent = t('site_feedback_yildiz_sec');
      sonucEl.style.color = "#993C1D";
      sonucEl.style.display = "block";
      return;
    }

    const isim = kayitliIsmiGetir();
    if (!isim) {
      isimGerekliUyar();
      return;
    }

    gondBtn.disabled = true;
    gondBtn.textContent = t('site_feedback_gonderiliyor');

    const mesaj = mesajEl.value.trim() || null;

    try {
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('site_geri_bildirim')
          .insert({ puan: secilenPuan, mesaj, kullanici_adi: isim });
        if (error) throw error;
      }
      // Başarılı
      sonucEl.textContent = t('site_feedback_tesekkur');
      sonucEl.style.color = "#2A7FB8";
      sonucEl.style.display = "block";
      gondBtn.style.display = "none";
      mesajEl.style.display = "none";
      document.getElementById('site-feedback-stars').style.pointerEvents = "none";
      // Yeni yorum geldi — listeyi yenile
      siteYorumlariYukle();
    } catch (e) {
      console.error("Site feedback hatası:", e);
      sonucEl.textContent = t('gonderilemedi');
      sonucEl.style.color = "#993C1D";
      sonucEl.style.display = "block";
      gondBtn.disabled = false;
      gondBtn.textContent = t('gonder');
    }
  });
})();

// === Kullanıcı yorumları bölümü ===
async function siteYorumlariYukle() {
  const yuklenEl = document.getElementById('site-yorumlar-yuklen');
  const gridEl   = document.getElementById('site-yorumlar-grid');
  if (!supabaseClient) {
    if (yuklenEl) yuklenEl.textContent = t('yorumlar_yuklenemedi');
    return;
  }
  try {
    const { data, error } = await supabaseClient
      .from('site_geri_bildirim')
      .select('puan, mesaj, kullanici_adi, created_at')
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) throw error;
    if (!data || data.length === 0) {
      if (yuklenEl) yuklenEl.textContent = t('yorumlar_ilk_sen');
      return;
    }
    if (yuklenEl) yuklenEl.style.display = "none";
    if (gridEl)   gridEl.style.display   = "grid";

    gridEl.innerHTML = data.map(d => {
      const puan = d.puan || 0;
      const yildizHtml = Array.from({ length: 5 }, (_, i) =>
        `<svg width="13" height="13" viewBox="0 0 24 24" fill="${i < puan ? "#D4A017" : "none"}" stroke="${i < puan ? "#D4A017" : "currentColor"}" style="color:var(--star-empty)" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
      ).join("");
      const isim     = escapeHtml(d.kullanici_adi || t('anonim'));
      const mesaj    = escapeHtml(d.mesaj || "");
      const tarih    = new Date(d.created_at);
      const simdiTarih = new Date();
      const saatStr2 = String(tarih.getHours()).padStart(2, "0") + ":" + String(tarih.getMinutes()).padStart(2, "0");
      const yilEkle2 = tarih.getFullYear() !== simdiTarih.getFullYear() ? " " + tarih.getFullYear() : "";
      const zamanStr = `${tarih.getDate()} ${AY_ADLARI()[tarih.getMonth()]}${yilEkle2}, ${saatStr2}`;
      return `
        <div class="site-yorum-kart">
          <div class="site-yorum-yildizlar">${yildizHtml}</div>
          ${mesaj ? `<div class="site-yorum-mesaj">"${mesaj}"</div>` : ""}
          <div class="site-yorum-meta">
            <span>${isim}</span>
            <span class="site-yorum-meta-ayrac">·</span>
            <span>${zamanStr}</span>
          </div>
        </div>`;
    }).join("");
  } catch (e) {
    console.error("Site yorumları yüklenemedi:", e);
    if (yuklenEl) yuklenEl.textContent = t('yorumlar_yuklenemedi');
  }
}
setTimeout(siteYorumlariYukle, 800);

function dilUygula() {
  document.documentElement.setAttribute('lang', AKTIF_DIL);
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.getAttribute('data-i18n-placeholder')); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'))); });
  document.querySelectorAll('[data-i18n-alt]').forEach(el => { el.setAttribute('alt', t(el.getAttribute('data-i18n-alt'))); });
  document.querySelectorAll('#site-feedback-stars button[data-puan]').forEach(btn => { btn.setAttribute('aria-label', t('yildiz_aria', btn.dataset.puan)); });
  document.getElementById('dil-btn-tr').classList.toggle('aktif', AKTIF_DIL === 'tr');
  document.getElementById('dil-btn-en').classList.toggle('aktif', AKTIF_DIL === 'en');
  // İl/ilçe sayfalarının kendi özgün <title>/meta description'ı (SEO'nun asıl amacı) var —
  // SAYFA_KONUM tanımlıysa bunların jenerik ana sayfa metniyle ezilmesini engelliyoruz.
  if (!window.SAYFA_KONUM) {
    document.title = t('sayfa_baslik');
    document.getElementById('meta-aciklama').setAttribute('content', t('meta_aciklama'));
    document.getElementById('og-baslik').setAttribute('content', t('sayfa_baslik'));
    document.getElementById('og-aciklama').setAttribute('content', t('og_aciklama'));
  }
  isimAlaniniGuncelle();
  if (state.lat != null) veriCekVeGoster(state.lat, state.lon);
  tumYorumNoktalariniGoster();
  maviBayrakIsaretleriniGoster();
  halkPlajiIsaretleriniGoster();
  yakinYorumlariDurumGuncelle();
  siteYorumlariYukle();
}
document.querySelectorAll('.dil-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const yeniDil = btn.dataset.dil;
    if (yeniDil === AKTIF_DIL) return;
    AKTIF_DIL = yeniDil;
    try { localStorage.setItem(DIL_ANAHTARI, AKTIF_DIL); } catch (e) {}
    dilUygula();
  });
});
dilUygula();

// Yer arama kutusu — SADECE ana sayfada var (üretilen il/ilçe sayfalarında bu input yok),
// bu yüzden savunmacı şekilde bağlanıyor. data/yerler.json'daki il/ilçe listesini okuyup
// basit, Türkçe karakter farkı gözetmeyen bir eşleşmeyle öneri sunar.
(function () {
  const girdi = document.getElementById('yer-arama-input');
  const sonuclarEl = document.getElementById('yer-arama-sonuclar');
  if (!girdi || !sonuclarEl) return;

  function normalize(s) {
    return String(s)
      .toLocaleLowerCase('tr')
      .replace(/ç/g, 'c').replace(/ş/g, 's').replace(/ğ/g, 'g')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u');
  }

  let yerListesi = null; // { ad, altAd, url }[]
  async function yerListesiniYukle() {
    if (yerListesi) return yerListesi;
    try {
      const yanit = await fetch('/data/yerler.json');
      const veri = await yanit.json();
      const liste = [];
      for (const il of veri.iller) {
        liste.push({ ad: il.ad, altAd: 'İl', url: `/${il.slug}/` });
      }
      for (const ic of veri.ilceler) {
        const il = veri.iller.find(i => i.slug === ic.ilSlug);
        liste.push({ ad: ic.ad, altAd: il ? il.ad : '', url: `/${ic.ilSlug}/${ic.slug}/` });
      }
      yerListesi = liste;
    } catch (e) {
      yerListesi = [];
    }
    return yerListesi;
  }

  function sonuclariGoster(eslesenler) {
    if (!eslesenler.length) { sonuclarEl.style.display = 'none'; sonuclarEl.innerHTML = ''; return; }
    sonuclarEl.innerHTML = eslesenler.slice(0, 8).map(y =>
      `<li><a href="${y.url}">${escapeHtml(y.ad)}${y.altAd ? ` <span class="yer-arama-il">· ${escapeHtml(y.altAd)}</span>` : ''}</a></li>`
    ).join('');
    sonuclarEl.style.display = 'block';
  }

  girdi.addEventListener('input', async () => {
    const sorgu = normalize(girdi.value.trim());
    if (!sorgu) { sonuclariGoster([]); return; }
    const liste = await yerListesiniYukle();
    const eslesenler = liste.filter(y => normalize(y.ad).includes(sorgu));
    sonuclariGoster(eslesenler);
  });

  girdi.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const ilkLink = sonuclarEl.querySelector('a');
      if (ilkLink) { e.preventDefault(); window.location.href = ilkLink.getAttribute('href'); }
    } else if (e.key === 'Escape') {
      sonuclariGoster([]);
      girdi.blur();
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#yer-arama')) sonuclariGoster([]);
  });
})();

