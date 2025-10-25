# PDF Thumbnail Implementation

## Overview

This implementation adds PDF thumbnail previews to the Annual Reports section of the investor downloads page.

## Features

### 🖼️ PDF Thumbnails

- **Real PDF Previews**: Automatically generated thumbnails from actual PDF files
- **Placeholder Images**: Consistent visual style for reports without PDFs
- **Responsive Design**: Optimized for all screen sizes

### 🔗 Interactive Elements

- **Click to View**: Click on any card with available PDF to open in new tab
- **Download Button**: Dedicated download button with visual feedback
- **Status Indicators**:
  - ✓ พร้อม (Green badge) - PDF available
  - เร็วๆ นี้ (Overlay) - Coming soon for placeholder images
  - ยังไม่พร้อม (Disabled button) - PDF not available

### 🎨 Visual Design

- **Hover Effects**: Scale and overlay effects on available PDFs
- **Status Differentiation**: Different visual states for available vs unavailable content
- **Smooth Animations**: Framer Motion animations for enhanced UX

## File Structure

```
public/
├── downloads/
│   └── annual-reports/
│       ├── Annual-Report-2023.pdf
│       ├── Annual-Report-2565.pdf
│       ├── Annual-Report-2562.pdf
│       ├── Annual-Report-2561.pdf
│       └── Annual-Report-2021.pdf
└── images/
    └── pdf-thumbnails/
        ├── Annual-Report-2023.jpg
        ├── Annual-Report-2565.jpg
        ├── Annual-Report-2562.jpg
        ├── Annual-Report-2561.jpg
        ├── Annual-Report-2021.jpg
        ├── placeholder-modern.jpg
        └── placeholder-classic.jpg
```

## Technical Implementation

### PDF to Image Conversion

- Uses `pdf-poppler` package for thumbnail generation
- Automated script: `scripts/generate-pdf-thumbnails.js`
- Generates JPEG thumbnails at 1024px scale

### Component Architecture

```typescript
interface ReportCardProps {
  year: string;
  title: string;
  thumbnail?: string | null;
  pdfPath?: string | null;
  index: number;
}
```

### Data Structure

```typescript
const annualReports = [
  {
    year: "2565",
    title: "แบบ 56-1 One Report ประจำปี 2565",
    thumbnail: "/images/pdf-thumbnails/Annual-Report-2565.jpg",
    pdfPath: "/downloads/annual-reports/Annual-Report-2565.pdf",
  },
  // ...more reports
];
```

## Available Reports with PDFs

1. **2565** - แบบ 56-1 One Report ประจำปี 2565
2. **2563** - แบบ 56-1 One Report / รายงานการจัด 2563
3. **2562** - รายงานประจำปี 2562
4. **2561** - รายงานประจำปี 2561
5. **2558** - รายงานประจำปี 2558

## Reports with Placeholder Images

- **2567, 2566, 2564, 2560, 2559, 2557** - Show placeholder thumbnails with "เร็วๆ นี้" overlay

## Usage

### Adding New PDF Reports

1. Place PDF in `public/downloads/annual-reports/`
2. Run thumbnail generation: `node scripts/generate-pdf-thumbnails.js`
3. Update data array in `page.tsx` with thumbnail and PDF paths

### Customizing Placeholders

- Replace files in `public/images/pdf-thumbnails/placeholder-*.jpg`
- Update data array to reference new placeholder images

## Dependencies

- `pdf-poppler` - PDF to image conversion
- `framer-motion` - Animations
- `next/image` - Optimized image loading
- `lucide-react` - Icons

## Browser Compatibility

- Modern browsers with ES6+ support
- Next.js Image optimization
- PDF viewing in new tabs
