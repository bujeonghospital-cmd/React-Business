# วิธีรัน Facebook Ads Manager App

## ขั้นตอนการติดตั้งและรัน

### 1. ติดตั้ง Dependencies

```bash
cd flutter_facebook_ads_app
flutter pub get
```

### 2. รันแอปบนโทรศัพท์หรือ Emulator

**ตรวจสอบอุปกรณ์ที่เชื่อมต่อ:**

```bash
flutter devices
```

**รันแอป:**

```bash
flutter run
```

**รันแบบ Release Mode (เร็วกว่า):**

```bash
flutter run --release
```

### 3. Build APK สำหรับ Android

**Build APK แบบ Release:**

```bash
flutter build apk --release
```

ไฟล์ APK จะอยู่ที่: `build/app/outputs/flutter-apk/app-release.apk`

**Build APK แบบแยก Architecture (ขนาดเล็กกว่า):**

```bash
flutter build apk --split-per-abi
```

### 4. ติดตั้งลงโทรศัพท์โดยตรง

**ติดตั้งผ่าน ADB:**

```bash
flutter install
```

หรือ

```bash
adb install build/app/outputs/flutter-apk/app-release.apk
```

## การแก้ปัญหา

### ถ้า flutter pub get ล้มเหลว

```bash
flutter clean
flutter pub get
```

### ถ้า build ล้มเหลว

```bash
flutter clean
flutter pub get
flutter pub upgrade
flutter build apk
```

### ตรวจสอบ Flutter Doctor

```bash
flutter doctor -v
```

## คำสั่งที่มีประโยชน์

**ดู logs:**

```bash
flutter logs
```

**Hot Reload (กด 'r' ในขณะรัน):**

- เปลี่ยนโค้ดและกด `r` เพื่ออัพเดททันที

**Hot Restart (กด 'R' ในขณะรัน):**

- รีสตาร์ทแอปทั้งหมดโดยไม่ต้องปิด

## ข้อมูลเพิ่มเติม

- URL ที่เปิด: https://tpp-thanakon.store/facebook-ads-manager
- Package ID: com.tppthanakon.facebook_ads_manager
- ชื่อแอป: Facebook Ads Manager
