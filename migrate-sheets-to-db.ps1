# Migration Script: Migrate data from Google Sheets to PostgreSQL Database
# 
# สคริปต์นี้ใช้รัน migration เพื่อย้ายข้อมูลจาก Google Sheets เข้า Database

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Google Sheets to Database Migration" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ตรวจสอบว่ามีไฟล์ .env.local หรือไม่
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Error: .env.local file not found" -ForegroundColor Red
    Write-Host "   กรุณาสร้างไฟล์ .env.local และตั้งค่า environment variables" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   ต้องมี variables:" -ForegroundColor Yellow
    Write-Host "   - DB_HOST" -ForegroundColor Yellow
    Write-Host "   - DB_PORT" -ForegroundColor Yellow
    Write-Host "   - DB_USER" -ForegroundColor Yellow
    Write-Host "   - DB_PASSWORD" -ForegroundColor Yellow
    Write-Host "   - DB_NAME" -ForegroundColor Yellow
    Write-Host "   - PYTHON_API_URL (optional)" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# โหลด environment variables จาก .env.local
Write-Host "📋 Loading environment variables from .env.local..." -ForegroundColor Blue

Get-Content .env.local | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Remove quotes if present
        $value = $value -replace '^"(.*)"$', '$1'
        $value = $value -replace "^'(.*)'$", '$1'
        
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
        
        # แสดงค่าที่โหลด (ซ่อน password)
        if ($name -like "*PASSWORD*") {
            Write-Host "   ✓ $name = ****" -ForegroundColor Green
        } else {
            Write-Host "   ✓ $name = $value" -ForegroundColor Green
        }
    }
}

Write-Host ""

# ตรวจสอบว่า required variables มีหรือไม่
$requiredVars = @("DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME")
$missingVars = @()

foreach ($var in $requiredVars) {
    if (-not [Environment]::GetEnvironmentVariable($var, "Process")) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "❌ Error: Missing required environment variables:" -ForegroundColor Red
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor Red
    }
    Write-Host ""
    exit 1
}

# ยืนยันก่อนรัน migration
Write-Host "⚠️  WARNING: This will migrate data from Google Sheets to Database" -ForegroundColor Yellow
Write-Host "   - Source: Python API (Google Sheets)" -ForegroundColor Yellow
Write-Host "   - Target: PostgreSQL Database" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Do you want to continue? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "❌ Migration cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting migration..." -ForegroundColor Green
Write-Host ""

# รัน migration script
try {
    node scripts/migrate-google-sheets-to-db.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. ตรวจสอบข้อมูลในฐานข้อมูล" -ForegroundColor White
        Write-Host "2. ทดสอบ API endpoints" -ForegroundColor White
        Write-Host "3. ทดสอบหน้า Performance Surgery Schedule" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Migration failed!" -ForegroundColor Red
        Write-Host "กรุณาตรวจสอบ error messages ด้านบนและแก้ไข" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error running migration script:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    exit 1
}
