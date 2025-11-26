# Media Files API Documentation

## Overview

API สำหรับจัดการไฟล์ Media (รูปภาพ, วิดีโอ, คลิป) พร้อมรองรับ Base64

---

## Base URL

```
/api/media-files
```

---

## Endpoints

### 1. ดึงข้อมูลไฟล์ทั้งหมด

**GET** `/api/media-files`

#### Query Parameters

| Parameter   | Type    | Description                                              |
| ----------- | ------- | -------------------------------------------------------- |
| `type`      | string  | Filter by type: `image`, `video`, `clip`, `all`          |
| `category`  | string  | Filter by category name                                  |
| `favorite`  | boolean | Filter favorites only (`true`)                           |
| `search`    | string  | Search in name, description, tags                        |
| `sortBy`    | string  | Sort by: `created_at`, `name`, `file_size`, `view_count` |
| `sortOrder` | string  | Sort direction: `asc`, `desc`                            |
| `limit`     | number  | Number of results (default: 100)                         |
| `offset`    | number  | Pagination offset (default: 0)                           |

#### Example Request

```javascript
// ดึงรูปภาพทั้งหมด
fetch("/api/media-files?type=image&sortBy=created_at&sortOrder=desc");

// ค้นหาไฟล์
fetch("/api/media-files?search=before-after&favorite=true");
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Before-After-001.jpg",
      "description": "รูปก่อน-หลัง",
      "type": "image",
      "url": "/images/sample.jpg",
      "thumbnail": "data:image/jpeg;base64,...",
      "size": "2.4 MB",
      "date": "2025-11-25",
      "tags": ["Before/After", "Face"],
      "favorite": true,
      "views": 1250,
      "category": "Before/After"
    }
  ],
  "total": 100,
  "stats": {
    "total": 100,
    "images": 40,
    "videos": 35,
    "clips": 25,
    "favorites": 15,
    "totalViews": 25000
  },
  "pagination": {
    "limit": 100,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### 2. ดึงข้อมูลไฟล์รายตัว

**GET** `/api/media-files/[id]`

#### Example Request

```javascript
fetch("/api/media-files/1");
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Before-After-001.jpg",
    "description": "รูปก่อน-หลัง",
    "type": "image",
    "url": "/images/sample.jpg",
    "thumbnail": "data:image/jpeg;base64,...",
    "thumbnailBase64": "data:image/jpeg;base64,...",
    "fileBase64": "data:image/jpeg;base64,...",
    "mimeType": "image/jpeg",
    "size": "2.4 MB",
    "sizeBytes": 2516582,
    "width": 1920,
    "height": 1080,
    "category": "Before/After",
    "favorite": true,
    "views": 1251,
    "downloads": 50,
    "likes": 25,
    "uploadedBy": "Admin",
    "date": "2025-11-25",
    "tags": ["Before/After", "Face"]
  }
}
```

---

### 3. อัพโหลดไฟล์ใหม่ (JSON)

**POST** `/api/media-files`

#### Request Body

```json
{
  "name": "New-Image.jpg",
  "description": "รูปภาพใหม่",
  "file_type": "image",
  "file_url": "/images/new-image.jpg",
  "thumbnail_base64": "data:image/jpeg;base64,...",
  "file_base64": "data:image/jpeg;base64,...",
  "mime_type": "image/jpeg",
  "file_size": 2516582,
  "category_name": "Before/After",
  "tags": ["New", "Image"],
  "uploaded_by_name": "Admin"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 13,
    "name": "New-Image.jpg",
    "file_type": "image"
  },
  "message": "Media file uploaded successfully"
}
```

---

### 4. อัพโหลดไฟล์ใหม่ (FormData)

**POST** `/api/media-files/upload`

#### Request (FormData)

```javascript
const formData = new FormData();
formData.append("file", fileBlob);
formData.append("thumbnail", thumbnailBlob); // optional
formData.append("name", "My Image.jpg");
formData.append("description", "รายละเอียด");
formData.append("category", "Before/After");
formData.append("tags", "tag1,tag2,tag3");
formData.append("uploadedByName", "Admin");

fetch("/api/media-files/upload", {
  method: "POST",
  body: formData,
});
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 14,
    "name": "My Image.jpg",
    "type": "image",
    "size": "2.4 MB",
    "mimeType": "image/jpeg"
  },
  "message": "File uploaded successfully"
}
```

---

### 5. อัพเดทข้อมูลไฟล์

**PUT** `/api/media-files/[id]`

#### Request Body

```json
{
  "name": "Updated-Name.jpg",
  "description": "อัพเดทรายละเอียด",
  "category_name": "New Category",
  "is_favorite": true,
  "tags": ["Updated", "Tags"]
}
```

#### Response

```json
{
  "success": true,
  "message": "Media file updated successfully"
}
```

---

### 6. ลบไฟล์

**DELETE** `/api/media-files/[id]`

#### Response

```json
{
  "success": true,
  "message": "Media file deleted successfully",
  "data": {
    "id": 1,
    "name": "Before-After-001.jpg"
  }
}
```

---

### 7. Toggle Favorite

**POST** `/api/media-files/favorite`

#### Request Body

```json
{
  "id": 1,
  "favorite": true // optional - ถ้าไม่ใส่จะ toggle
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Before-After-001.jpg",
    "favorite": true
  },
  "message": "Added to favorites"
}
```

---

### 8. ดึงหมวดหมู่

**GET** `/api/media-files/categories`

#### Response

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Before/After",
        "description": "รูปภาพก่อน-หลัง",
        "fileCount": 15
      }
    ],
    "allCategories": [
      { "name": "Before/After", "fileCount": 15 },
      { "name": "Surgery Videos", "fileCount": 10 }
    ]
  },
  "total": 10
}
```

---

### 9. สร้างหมวดหมู่ใหม่

**POST** `/api/media-files/categories`

#### Request Body

```json
{
  "name": "New Category",
  "description": "รายละเอียดหมวดหมู่"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "id": 11,
    "name": "New Category",
    "description": "รายละเอียดหมวดหมู่"
  },
  "message": "Category created successfully"
}
```

---

### 10. Bulk Operations

**POST** `/api/media-files/bulk`

#### Request Body

```json
{
  "action": "delete", // "delete", "favorite", "unfavorite", "get"
  "ids": [1, 2, 3, 4, 5]
}
```

#### Actions

| Action       | Description                    |
| ------------ | ------------------------------ |
| `delete`     | ลบไฟล์หลายรายการ (Soft delete) |
| `favorite`   | เพิ่มเป็นรายการโปรดหลายรายการ  |
| `unfavorite` | ลบออกจากรายการโปรดหลายรายการ   |
| `get`        | ดึงข้อมูลไฟล์สำหรับดาวน์โหลด   |

#### Response (delete/favorite/unfavorite)

```json
{
  "success": true,
  "message": "5 files deleted",
  "affectedCount": 5,
  "affectedIds": [1, 2, 3, 4, 5]
}
```

#### Response (get)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "image.jpg",
      "file_url": "/images/image.jpg",
      "file_base64": "data:image/jpeg;base64,...",
      "mime_type": "image/jpeg"
    }
  ],
  "total": 5
}
```

---

## Frontend Usage Example

### React Hook สำหรับใช้งาน API

```typescript
import { useState, useEffect, useCallback } from "react";

interface MediaFile {
  id: number;
  name: string;
  type: "image" | "video" | "clip";
  url: string;
  thumbnail: string;
  size: string;
  date: string;
  tags: string[];
  favorite: boolean;
  views: number;
  duration?: string;
  category: string;
}

interface UseMediaFilesOptions {
  type?: string;
  category?: string;
  favorite?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
}

export function useMediaFiles(options: UseMediaFilesOptions = {}) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.type) params.set("type", options.type);
      if (options.category) params.set("category", options.category);
      if (options.favorite) params.set("favorite", "true");
      if (options.search) params.set("search", options.search);
      if (options.sortBy) params.set("sortBy", options.sortBy);
      if (options.sortOrder) params.set("sortOrder", options.sortOrder);
      if (options.limit) params.set("limit", options.limit.toString());

      const response = await fetch(`/api/media-files?${params}`);
      const data = await response.json();

      if (data.success) {
        setFiles(data.data);
        setStats(data.stats);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [options]);

  const toggleFavorite = async (id: number) => {
    try {
      const response = await fetch("/api/media-files/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();

      if (data.success) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, favorite: data.data.favorite } : f
          )
        );
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const uploadFile = async (file: File, metadata: any) => {
    const formData = new FormData();
    formData.append("file", file);
    Object.entries(metadata).forEach(([key, value]) => {
      if (value) formData.append(key, value as string);
    });

    const response = await fetch("/api/media-files/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      await fetchFiles(); // Refresh list
    }
    return data;
  };

  const deleteFiles = async (ids: number[]) => {
    const response = await fetch("/api/media-files/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", ids }),
    });

    const data = await response.json();
    if (data.success) {
      setFiles((prev) => prev.filter((f) => !ids.includes(f.id)));
    }
    return data;
  };

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return {
    files,
    loading,
    error,
    stats,
    refetch: fetchFiles,
    toggleFavorite,
    uploadFile,
    deleteFiles,
  };
}
```

### ตัวอย่างการใช้งานใน Component

```tsx
function MediaGallery() {
  const { files, loading, stats, toggleFavorite, uploadFile, deleteFiles } =
    useMediaFiles({
      type: "image",
      sortBy: "created_at",
      sortOrder: "desc",
    });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div>Total: {stats?.total} files</div>

      {files.map((file) => (
        <div key={file.id}>
          <img src={file.thumbnail} alt={file.name} />
          <h3>{file.name}</h3>
          <button onClick={() => toggleFavorite(file.id)}>
            {file.favorite ? "❤️" : "🤍"}
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Error Responses

ทุก API จะ return error ในรูปแบบนี้:

```json
{
  "success": false,
  "error": "Error message here",
  "timestamp": "2025-11-26T10:00:00.000Z"
}
```

### HTTP Status Codes

| Code | Description                              |
| ---- | ---------------------------------------- |
| 200  | Success                                  |
| 400  | Bad Request (missing/invalid parameters) |
| 404  | Not Found                                |
| 500  | Internal Server Error                    |

---

## Notes

1. **Base64 Thumbnail**: ควรย่อขนาดไม่เกิน 100KB
2. **Video Files**: ควรเก็บ URL และใช้ Cloud Storage
3. **File Size Limits**: รูปภาพ 10MB, วิดีโอ 50MB
4. **Soft Delete**: ไฟล์ที่ลบจะถูก mark เป็น `is_active = FALSE`
