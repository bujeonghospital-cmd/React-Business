# Setup Database Script: Create tables for Surgery Schedule and Sale Incentive
# 
# สคริปต์นี้ใช้รัน SQL schema เพื่อสร้างตารางในฐานข้อมูล

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Database Setup - Create Tables" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ตรวจสอบว่ามีไฟล์ .env.local หรือไม่
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ Error: .env.local file not found" -ForegroundColor Red
    Write-Host "   กรุณาสร้างไฟล์ .env.local และตั้งค่า environment variables" -ForegroundColor Yellow
    exit 1
}

# โหลด environment variables จาก .env.local
Write-Host "📋 Loading environment variables from .env.local..." -ForegroundColor Blue

$envVars = @{}
Get-Content .env.local | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Remove quotes if present
        $value = $value -replace '^"(.*)"$', '$1'
        $value = $value -replace "^'(.*)'$", '$1'
        
        $envVars[$name] = $value
        
        # แสดงค่าที่โหลด (ซ่อน password)
        if ($name -like "*PASSWORD*") {
            Write-Host "   ✓ $name = ****" -ForegroundColor Green
        } else {
            Write-Host "   ✓ $name = $value" -ForegroundColor Green
        }
    }
}

Write-Host ""

# ตรวจสอบว่ามี psql command หรือไม่
$hasPsql = $null -ne (Get-Command psql -ErrorAction SilentlyContinue)

if (-not $hasPsql) {
    Write-Host "⚠️  Warning: psql command not found" -ForegroundColor Yellow
    Write-Host "   กรุณาติดตั้ง PostgreSQL client หรือใช้ tool อื่น (pgAdmin, DBeaver) เพื่อรัน SQL schema" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SQL schema file: surgery-schedule-schema.sql" -ForegroundColor Cyan
    Write-Host ""
    
    $openFile = Read-Host "Do you want to open the SQL file? (yes/no)"
    if ($openFile -eq "yes") {
        Invoke-Item "surgery-schedule-schema.sql"
    }
    
    exit 0
}

# ตรวจสอบว่ามีไฟล์ schema หรือไม่
if (-not (Test-Path "surgery-schedule-schema.sql")) {
    Write-Host "❌ Error: surgery-schedule-schema.sql file not found" -ForegroundColor Red
    exit 1
}

# รัน SQL schema
Write-Host "🚀 Creating database tables..." -ForegroundColor Green
Write-Host ""

$dbHost = $envVars["DB_HOST"]
$dbPort = $envVars["DB_PORT"]
$dbUser = $envVars["DB_USER"]
$dbName = $envVars["DB_NAME"]
$dbPassword = $envVars["DB_PASSWORD"]

# ตั้งค่า password environment variable สำหรับ psql
$env:PGPASSWORD = $dbPassword

try {
    # รัน psql command
    $psqlCommand = "psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f surgery-schedule-schema.sql"
    
    Write-Host "Running command:" -ForegroundColor Blue
    Write-Host "   psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f surgery-schedule-schema.sql" -ForegroundColor Gray
    Write-Host ""
    
    Invoke-Expression $psqlCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Database tables created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Tables created:" -ForegroundColor Cyan
        Write-Host "   - surgery_schedule" -ForegroundColor White
        Write-Host "   - sale_incentive" -ForegroundColor White
        Write-Host ""
        Write-Host "Views created:" -ForegroundColor Cyan
        Write-Host "   - daily_revenue_summary" -ForegroundColor White
        Write-Host "   - monthly_revenue_summary" -ForegroundColor White
        Write-Host "   - monthly_surgery_count" -ForegroundColor White
        Write-Host "   - monthly_actual_surgery_count" -ForegroundColor White
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Run migration script: .\migrate-sheets-to-db.ps1" -ForegroundColor White
        Write-Host "2. Test API endpoints" -ForegroundColor White
        Write-Host "3. Test Performance Surgery Schedule page" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Failed to create database tables!" -ForegroundColor Red
        Write-Host "กรุณาตรวจสอบ error messages ด้านบนและแก้ไข" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    exit 1
} finally {
    # Clear password environment variable
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
