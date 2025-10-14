# Contact Inquiry Page - UI Preview

## Desktop View

### Hero Section

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                         ติดต่อเรา                           │
│                                                             │
│    ยินดีให้บริการและตอบทุกคำถามเกี่ยวกับผลิตภัณฑ์         │
│           และบริการของเรา พร้อมสร้างความประทับใจ           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Main Content Layout

```
┌─────────────────────────────────────┬─────────────────────────────┐
│                                     │                             │
│  [สำนักงานใหญ่] [โรงงาน]            │   แบบฟอร์มการติดต่อ         │
│                                     │                             │
│  บริษัท ไทยบรรจุภัณฑ์ฯ              │   ชื่อ-นามสกุล *            │
│                                     │   [______________]          │
│  📍 ที่อยู่                          │                             │
│  เลขที่ 55/5 หมู่ 5...             │   บริษัท/องค์กร             │
│                                     │   [______________]          │
│  📞 โทรศัพท์                         │                             │
│  (+66) 2-529-0099                   │   อีเมล *                  │
│                                     │   [______________]          │
│  ✉️ อีเมล                            │                             │
│  marketingcenter@tpppack.com        │   เบอร์โทรศัพท์ *           │
│                                     │   [______________]          │
│  🕐 เวลาทำการ                        │                             │
│  จันทร์-ศุกร์: 8:30-17:30 น.       │   หัวข้อ *                  │
│  เสาร์: 8:30-12:00 น.              │   [______________]          │
│                                     │                             │
│  ┌──────────────────────────────┐  │   ข้อความ *                │
│  │                              │  │   [________________]        │
│  │      Google Maps             │  │   [________________]        │
│  │                              │  │   [________________]        │
│  └──────────────────────────────┘  │                             │
│  [ดูเส้นทางใน Google Maps]         │   [    ส่งข้อความ    ]     │
│                                     │                             │
└─────────────────────────────────────┴─────────────────────────────┘
```

## Mobile View

```
┌──────────────────────┐
│    ติดต่อเรา          │
│                      │
│  ยินดีให้บริการ       │
│                      │
├──────────────────────┤
│ [สำนักงาน] [โรงงาน]  │
├──────────────────────┤
│                      │
│ บริษัท ไทยบรรจุ...   │
│                      │
│ 📍 ที่อยู่            │
│ เลขที่ 55/5...       │
│                      │
│ 📞 โทรศัพท์           │
│ 02-529-0099          │
│                      │
│ ✉️ อีเมล              │
│ marketing@...        │
│                      │
│ 🕐 เวลาทำการ          │
│ จันทร์-ศุกร์...      │
│                      │
│ ┌──────────────────┐ │
│ │   Google Maps    │ │
│ └──────────────────┘ │
│                      │
├──────────────────────┤
│  แบบฟอร์มติดต่อ      │
│                      │
│ ชื่อ-นามสกุล *       │
│ [______________]     │
│                      │
│ บริษัท/องค์กร        │
│ [______________]     │
│                      │
│ อีเมล *              │
│ [______________]     │
│                      │
│ โทรศัพท์ *           │
│ [______________]     │
│                      │
│ หัวข้อ *             │
│ [______________]     │
│                      │
│ ข้อความ *            │
│ [____________]       │
│ [____________]       │
│                      │
│ [  ส่งข้อความ  ]     │
│                      │
└──────────────────────┘
```

## Color Scheme

### Primary Colors

- **Blue Gradient**: `from-blue-600 to-emerald-600`
- **Background**: `from-slate-50 via-white to-blue-50`
- **Hover**: `from-blue-700 to-emerald-700`

### Text Colors

- **Headings**: `text-gray-900`
- **Body**: `text-gray-600`
- **Links**: `text-blue-600 hover:text-blue-700`

### Accent Colors

- **Success**: `bg-green-50 text-green-800`
- **Error**: `bg-red-50 text-red-800`
- **Info Icons**: Various colors (blue, emerald, purple, orange)

## Icons Used

- 📍 MapPin - ที่อยู่
- 📞 Phone - โทรศัพท์
- ✉️ Mail - อีเมล
- 🕐 Clock - เวลาทำการ
- 👤 User - ชื่อผู้ใช้
- 🏢 Building2 - บริษัท
- 💬 MessageSquare - หัวข้อ
- 📤 Send - ส่งข้อความ
- ⏳ Loader2 - กำลังโหลด

## Animations

### Page Load

- Stagger children animation (delay: 0.1s each)
- Fade in up (opacity: 0 → 1, y: 30 → 0)

### Hover Effects

- Icon containers: scale(1.1)
- Buttons: scale(1.02) on hover, scale(0.98) on tap
- Cards: translate-y(-1) + shadow increase

### Form Interactions

- Focus: ring-2 ring-blue-500
- Validation: Error shake animation
- Success: Fade in from top

## Responsive Breakpoints

- **Mobile**: < 640px (col-1, stacked)
- **Tablet**: 640px - 1024px (col-1, wider)
- **Desktop**: > 1024px (col-2, side-by-side)

## Accessibility

- All form inputs have labels
- Required fields marked with \*
- Focus states visible
- Color contrast ratio > 4.5:1
- Keyboard navigation support

## Form Validation

### Required Fields

- ✅ Name (ชื่อ-นามสกุล)
- ❌ Company (optional)
- ✅ Email
- ✅ Phone
- ✅ Subject
- ✅ Message

### Validation Rules

- Email: Valid email format
- Phone: 8-10 digits
- Message: Minimum 10 characters

## States

### Normal State

```
[        ส่งข้อความ         ]
```

### Loading State

```
[  ⏳ กำลังส่ง...        ]
```

### Success State

```
✅ ส่งข้อความสำเร็จ! เราจะติดต่อกลับโดยเร็ว
```

### Error State

```
❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง
```

## CTA Banner (Bottom)

```
┌─────────────────────────────────────────────┐
│                                             │
│         พร้อมให้บริการคุณ                    │
│                                             │
│  ทีมงานผู้เชี่ยวชาญของเรายินดีให้คำปรึกษา   │
│      และตอบทุกคำถาม                         │
│                                             │
│  [  โทรหาเรา  ]  [  ส่งอีเมล  ]            │
│                                             │
└─────────────────────────────────────────────┘
```

---

**Note**: จอภาพจริงจะสวยงามกว่า mockup นี้มาก!
