param(
  [string]$BaseUrl = "http://localhost:3000",
  [string]$TargetFormat = "png",
  [switch]$FailOnConvertError
)

$ErrorActionPreference = 'Stop'
$script:CurrentStep = "init"

function Write-Step {
  param([string]$Message)
  $script:CurrentStep = $Message
  Write-Host "[SMOKE] $Message"
}

function ConvertFrom-SafeJson {
  param([string]$InputText)
  try {
    return $InputText | ConvertFrom-Json
  } catch {
    return $null
  }
}

function Assert-True {
  param(
    $Condition,
    [string]$Message
  )

  if (-not $Condition) {
    throw $Message
  }
}

$summary = [ordered]@{
  REGISTER_OK = $false
  LOGIN_OK = $false
  UPLOAD_OK = $false
  CONVERT_OK = $false
  STATUS_OK = $false
  DOWNLOAD_OK = $false
  HISTORY_OK = $false
  DOCS_OK = $false
}

$token = $null
$fileId = $null
$conversionId = $null
$resultFile = $null
$downloadCode = "SKIPPED"
$downloadBody = "SKIPPED"
$statusCode = "N/A"
$statusBody = ""
$historyCount = 0
$docsCode = "N/A"

try {
  Write-Step "Base URL: $BaseUrl"

  $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  $email = "smoke_$timestamp@example.com"
  $password = "password123"

  Write-Step "1) Register"
  $registerBody = @{ name = 'Smoke User'; email = $email; password = $password } | ConvertTo-Json
  $registerResp = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/register" -ContentType 'application/json' -Body $registerBody -TimeoutSec 20
  Assert-True (-not [string]::IsNullOrWhiteSpace($registerResp.user.id)) "Register failed: missing user id"
  $summary.REGISTER_OK = $true

  Write-Step "2) Login"
  $loginBody = @{ email = $email; password = $password } | ConvertTo-Json
  $loginResp = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/login" -ContentType 'application/json' -Body $loginBody -TimeoutSec 20
  $token = $loginResp.token
  Assert-True (-not [string]::IsNullOrWhiteSpace($token)) "Login failed: missing token"
  $summary.LOGIN_OK = $true

  Write-Step "3) Upload"
  $samplePath = Join-Path $PSScriptRoot "smoke-sample.jpg"
  Assert-True (Test-Path $samplePath) "Sample file not found: $samplePath"

  $uploadRaw = curl.exe -s -X POST "$BaseUrl/files/upload" -H "Authorization: Bearer $token" -F "file=@$samplePath"
  $uploadResp = ConvertFrom-SafeJson -InputText $uploadRaw
  Assert-True ($uploadResp -and $uploadResp.file.id) "Upload failed: response was '$uploadRaw'"
  $fileId = $uploadResp.file.id
  $summary.UPLOAD_OK = $true

  Write-Step "4) Conversion request"
  $convertBody = @{ fileId = $fileId; targetFormat = $TargetFormat } | ConvertTo-Json
  $convertResp = Invoke-RestMethod -Method Post -Uri "$BaseUrl/conversions" -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body $convertBody -TimeoutSec 20
  Assert-True (-not [string]::IsNullOrWhiteSpace($convertResp.conversion.id)) "Conversion request failed: missing conversion id"
  $conversionId = $convertResp.conversion.id
  $summary.CONVERT_OK = $true

  Write-Step "5) Conversion status polling"
  $maxAttempts = 60
  $statusResp = $null

  for ($i = 1; $i -le $maxAttempts; $i++) {
    $statusCode = curl.exe -s -o "$PSScriptRoot\status.json" -w "%{http_code}" -X GET "$BaseUrl/conversions/$conversionId" -H "Authorization: Bearer $token"
    $statusBody = Get-Content "$PSScriptRoot\status.json" -Raw
    $statusResp = ConvertFrom-SafeJson -InputText $statusBody

    Write-Host "[SMOKE] Poll $i/$maxAttempts => HTTP $statusCode, status=$($statusResp.status)"

    if ($statusCode -eq "200" -and $statusResp.status -eq "completed") {
      $summary.STATUS_OK = $true
      $resultFile = $statusResp.resultFile
      break
    }

    if ($statusCode -eq "200" -and $statusResp.status -eq "failed") {
      throw "Conversion status is failed"
    }

    Start-Sleep -Seconds 3
  }

  Assert-True ($summary.STATUS_OK) "Conversion status polling timed out after 180 seconds"
  Assert-True (-not [string]::IsNullOrWhiteSpace($resultFile)) "Missing resultFile after completed conversion"

  Write-Step "6) Download endpoint"
  $downloadCode = curl.exe -s -o "$PSScriptRoot\download.bin" -w "%{http_code}" -X GET "$BaseUrl/downloads/$resultFile" -H "Authorization: Bearer $token"
  if (Test-Path "$PSScriptRoot\download.bin") {
    $downloadBody = "binary-bytes=$((Get-Item "$PSScriptRoot\download.bin").Length)"
  } else {
    $downloadBody = "missing-download-file"
  }
  Assert-True ($downloadCode -eq "200") "Download failed with HTTP $downloadCode"
  $summary.DOWNLOAD_OK = $true

  Write-Step "7) History"
  $historyResp = Invoke-RestMethod -Method Get -Uri "$BaseUrl/users/conversions" -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 20
  if ($historyResp -is [array]) {
    $historyCount = @($historyResp).Count
  } else {
    $historyCount = if ($historyResp) { 1 } else { 0 }
  }
  Assert-True ($historyCount -ge 1) "History failed: expected at least one conversion"
  $summary.HISTORY_OK = $true

  Write-Step "8) Docs"
  $docsCode = curl.exe -s -L -o NUL -w "%{http_code}" "$BaseUrl/docs"
  Assert-True ($docsCode -eq "200") "Docs endpoint failed with HTTP $docsCode"
  $summary.DOCS_OK = $true

  Write-Host ""
  Write-Host "=== SMOKE TEST RESULT ==="
  Write-Host "REGISTER_OK=$($summary.REGISTER_OK)"
  Write-Host "LOGIN_OK=$($summary.LOGIN_OK)"
  Write-Host "UPLOAD_OK=$($summary.UPLOAD_OK)"
  Write-Host "FILE_ID=$fileId"
  Write-Host "CONVERT_OK=$($summary.CONVERT_OK)"
  Write-Host "CONVERSION_ID=$conversionId"
  Write-Host "STATUS_HTTP=$statusCode"
  Write-Host "STATUS_BODY=$statusBody"
  Write-Host "DOWNLOAD_HTTP=$downloadCode"
  Write-Host "DOWNLOAD_BODY=$downloadBody"
  Write-Host "HISTORY_COUNT=$historyCount"
  Write-Host "DOCS_HTTP=$docsCode"
  Write-Host "RESULT=SUCCESS"

  exit 0
} catch {
  Write-Host ""
  Write-Host "=== SMOKE TEST RESULT ==="
  Write-Host "FAILED_STEP=$script:CurrentStep"
  Write-Host "ERROR=$($_.Exception.Message)"
  Write-Host "REGISTER_OK=$($summary.REGISTER_OK)"
  Write-Host "LOGIN_OK=$($summary.LOGIN_OK)"
  Write-Host "UPLOAD_OK=$($summary.UPLOAD_OK)"
  Write-Host "CONVERT_OK=$($summary.CONVERT_OK)"
  Write-Host "STATUS_OK=$($summary.STATUS_OK)"
  Write-Host "DOWNLOAD_OK=$($summary.DOWNLOAD_OK)"
  Write-Host "HISTORY_OK=$($summary.HISTORY_OK)"
  Write-Host "DOCS_OK=$($summary.DOCS_OK)"
  Write-Host "RESULT=FAILURE"

  if ($FailOnConvertError -or -not $summary.CONVERT_OK -or -not $summary.STATUS_OK -or -not $summary.DOWNLOAD_OK) {
    exit 1
  }

  exit 1
}
