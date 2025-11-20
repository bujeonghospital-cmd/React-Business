# Facebook Ads Manager - Flutter Mobile App

แอปพลิเคชัน Flutter สำหรับเปิดหน้า Facebook Ads Manager บนมือถือ

## คุณสมบัติ

✅ **WebView แบบเต็มรูปแบบ** - แสดงหน้า Facebook Ads Manager ได้สมบูรณ์
✅ **Pull to Refresh** - ดึงลงเพื่อรีเฟรชหน้า
✅ **Navigation Controls** - ปุ่ม Back, Forward, Home, Refresh
✅ **Progress Indicator** - แสดงความคืบหน้าในการโหลดหน้า
✅ **Facebook Color Theme** - ใช้สีน้ำเงิน Facebook (#1877F2)
✅ **Clear Cache** - ล้างแคชได้จากเมนู
✅ **Responsive UI** - รองรับทั้ง Android และ iOS

## ติดตั้งและรัน

### ข้อกำหนดเบื้องต้น

- Flutter SDK (3.0.0 หรือสูงกว่า)
- Android Studio / Xcode
- Android Emulator หรือ iOS Simulator หรือ เครื่องจริง

### วิธีติดตั้ง

1. **เข้าไปในโฟลเดอร์โปรเจค**

```bash
cd flutter_facebook_ads_app
```

2. **ดาวน์โหลด dependencies**

```bash
flutter pub get
```

3. **รันแอปพลิเคชัน**

สำหรับ Android:

```bash
flutter run
```

สำหรับ iOS:

```bash
cd ios
pod install
cd ..
flutter run
```

### Build แอป

**Build สำหรับ Android (APK)**

```bash
flutter build apk --release
```

**Build สำหรับ Android (App Bundle)**

```bash
flutter build appbundle --release
```

**Build สำหรับ iOS**

```bash
flutter build ios --release
```

## โครงสร้างโปรเจค

```
flutter_facebook_ads_app/
├── lib/
│   ├── main.dart                          # จุดเริ่มต้นของแอป
│   └── screens/
│       └── facebook_ads_webview.dart      # หน้า WebView หลัก
├── android/                               # การตั้งค่า Android
├── ios/                                   # การตั้งค่า iOS
└── pubspec.yaml                           # Dependencies และ configurations
```

## Dependencies หลัก

- **flutter_inappwebview** (^6.0.0) - WebView ที่มีฟีเจอร์ครบถ้วน รองรับทั้ง Android และ iOS
- **webview_flutter** (^4.4.2) - WebView อย่างเป็นทางการจาก Flutter team

## ฟีเจอร์พิเศษ

### 1. Navigation Bar ด้านล่าง

- ปุ่ม Back: ย้อนกลับหน้าที่ผ่านมา
- ปุ่ม Forward: ไปหน้าถัดไป
- ปุ่ม Home: กลับหน้าหลัก
- ปุ่ม Refresh: รีเฟรชหน้าปัจจุบัน

### 2. App Bar Menu

- Refresh: รีเฟรชหน้า
- Home: กลับหน้าหลัก
- Back/Forward: นำทางไปมา
- Clear Cache: ล้างแคชและรีเฟรช

### 3. Loading States

- Progress bar แสดงความคืบหน้า
- Loading indicator พร้อมข้อความ
- Pull to refresh

## การปรับแต่ง

### เปลี่ยน URL

แก้ไขใน `lib/screens/facebook_ads_webview.dart`:

```dart
final String initialUrl = "https://tpp-thanakon.store/facebook-ads-manager";
```

### เปลี่ยนสี Theme

แก้ไขใน `lib/main.dart`:

```dart
primaryColor: const Color(0xFF1877F2), // เปลี่ยนสีตามต้องการ
```

### เปลี่ยนชื่อแอป

แก้ไขใน:

- `pubspec.yaml`: `name` field
- Android: `android/app/src/main/AndroidManifest.xml`
- iOS: `ios/Runner/Info.plist`

## ปัญหาที่พบบ่อย

### WebView ไม่แสดงผล

- ตรวจสอบ Internet permission ใน AndroidManifest.xml
- ตรวจสอบ App Transport Security ใน Info.plist (iOS)

### แอปช้า

- ลองใช้ Release build แทน Debug
- ล้าง cache: `flutter clean` แล้วรัน `flutter pub get` ใหม่

### Build ล้มเหลว

```bash
flutter clean
flutter pub get
flutter pub upgrade
flutter build apk
```

## สิทธิ์ที่ใช้

### Android

- `INTERNET` - เชื่อมต่ออินเทอร์เน็ต
- `ACCESS_NETWORK_STATE` - ตรวจสอบสถานะเครือข่าย

### iOS

- `NSAppTransportSecurity` - อนุญาตให้โหลด HTTPS/HTTP content

## License

MIT License - สามารถใช้งานและแก้ไขได้ตามต้องการ

## ผู้พัฒนา

Developed for TPP Thanakon Store
