# SeaData — Android Uygulaması

Bu klasör, https://seadatawave.com web sitesini [Capacitor](https://capacitorjs.com) ile
sarıp Google Play Store'a yüklenebilir bir Android uygulamasına dönüştürüyor. Web sitesinin
kodu (index.html) burada KOPYALANMIYOR — uygulama açılınca doğrudan canlı siteyi yüklüyor,
yani web sitesine yapılan güncellemeler otomatik olarak uygulamaya da yansıyor.

## Önemli: imzalama anahtarı (keystore)

`keystore/seadata-release.keystore` dosyası ve şifresi (`keystore/SIFRE-GIZLI-TUT.txt`)
**GİT'E EKLENMİYOR** (bkz. .gitignore) — bunlar Play Store'daki uygulamayı GÜNCELLEYEBİLMEK
için gereken tek anahtar. **Bu iki dosyayı git dışında güvenli bir yere (harici disk, parola
yöneticisi) mutlaka yedekleyin.** Kaybedilirse Play Store'daki uygulama bir daha
güncellenemez, yeni bir uygulama olarak baştan yayınlamanız gerekir.

## Yeniden derlemek için

```
cd mobil-uygulama
npm install
npx cap sync android
cd android
./gradlew.bat bundleRelease   # Play Store'a yüklenecek .aab dosyası
./gradlew.bat assembleRelease # cihaza doğrudan kurulabilecek .apk dosyası
```

Çıktılar:
- `android/app/build/outputs/bundle/release/app-release.aab` (Play Store'a yüklenen dosya)
- `android/app/build/outputs/apk/release/app-release.apk` (test için telefona kurulabilir)

## Gerekli araçlar (bu bilgisayara kuruldu)

- Node.js, Java (JDK 21, `JAVA_HOME`), Android SDK command-line tools (`ANDROID_HOME`,
  bkz. `C:\Users\dogar\Android\Sdk`).

## Play Store'a yükleme (kullanıcının kendisinin yapması gereken adımlar)

1. https://play.google.com/console adresinden Google Play Developer hesabı aç (25$, tek
   seferlik, kimlik doğrulama gerekir — bunu Claude yapamaz).
2. Play Console'da yeni bir uygulama oluştur, `app-release.aab` dosyasını yükle.
3. Mağaza listeleme bilgilerini doldur: açıklama, ekran görüntüleri, gizlilik politikası
   linki (bir gizlilik politikası sayfası hazırlamamız gerekecek — bu henüz yapılmadı),
   içerik derecelendirmesi anketi, uygulama simgesi (512x512, mevcut 136x136 ikon
   büyütülerek kullanıldı — daha net bir sonuç için yüksek çözünürlüklü bir logo iyi olur).
4. İnceleme için gönder (genelde birkaç saat - birkaç gün sürer).
