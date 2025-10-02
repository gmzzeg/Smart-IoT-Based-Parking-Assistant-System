<div align="center">
  <img src="Video_.gif" alt="Video Demo" width="600">
</div>

# Akıllı-Iot-Tabanlı-Park-Asistanı-Sistemi
IoT tabanlı bir prototip sistem, sınırlı sayıda sensör ve park alanıyla gerçek zamanlı veri toplama ve rezervasyon sistemini test etmek için entegre edilmiştir. Sistem; mobil uygulama, veri tabanı ve bariyer kontrolü gibi temel modülleri küçük çapta birleştirir ve gelecekteki tam ölçekli sistemler için temel bir altyapı sağlar.
---------------------------------------------------------------------------------------------------

Temel Özellikler

1.Park yerlerinin HC-SR04 ultrasonik sensörlerle doluluk tespiti

2.Mobil uygulama üzerinden park alanlarını görüntüleme ve rezervasyon

3.Kullanıcı kayıt ve giriş sistemi (bcrypt + JWT)

4.MySQL veritabanı ile rezervasyon, kullanıcı ve doluluk yönetimi

5.Node.js tabanlı REST API backend

6.Arduino Mega ile seri haberleşme ve bariyer kontrolü

7.Küçük çaplı prototip olarak test 

-------------------------------------------------------------------------------------------------
Sistem Çalışma Mantığı

1.Sensörlerden Veri Toplama:

-HC-SR04 sensörleri park alanlarının doluluk durumunu ölçer.

-Ölçülen mesafe bilgisi Arduino Mega üzerinden Node.js backend’e iletilir.Ölçülen mesafe belirli bir eşik değerinin altına düştüğünde park alanı dolu olarak kabul edilir.Ölçülen mesafe eşik değerin üzerinde ise park alanı boş kabul edilir.

2.Backend ve Veritabanı İşlemleri:

-Node.js API, sensör verilerini alır ve MySQL veritabanına kaydeder.

-Kullanıcı rezervasyonları ve doluluk durumu burada yönetilir.

3.Mobil Uygulama Arayüzü:

-Kullanıcılar boş park alanlarını görebilir ve eğer aktif randevusu bulunmuyorsa seçtikleri alan için rezervasyon yapabilir.

-Rezervasyon doğrulandıktan sonra sistem bariyeri kapatmak üzere Arduino Mega’ya komut gönderir.

-Randevu oluşturulduğunda sistem bariyeri kapatır ve kullanıcı randevu oluşturduğu alanın bariyerini kontrol edebilir.

Not:Rezervasyonsuz park alanlarının bariyerleri varsayılan olarak açıktır.

4.Bariyer Kontrolü:

-Servo motorlu bariyer, rezervasyon doğrulaması sonrası kullanıcı yönetimi ile açılır veya kapanır.

-------------------------------------------------------------------------------------------------
Donanım Gereksinimleri

-HC-SR04 ultrasonik sensörler 
-Arduino Mega
-Servo motorlu bariyer sistemi
-USB kablo ve güç kaynağı 
 
Not: Bu prototip, donanım sınırlamaları nedeniyle 8 park alanı için tasarlanmıştır. Sistem, prototip testleri ve küçük çaplı uygulamalar için optimize edilmiştir; gelecekte istenilen ölçekte kolayca genişletilebilir.

-------------------------------------------------------------------------------------------------
Mobil Uygulama - Rezervasyon Arayüzü 











<img width="237" height="440" alt="Ekran görüntüsü 2025-09-29 174906" src="https://github.com/user-attachments/assets/afa19a35-99e9-4133-a541-7a6e2ac8feab" />




