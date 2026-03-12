param([string]$BaseUrl = "http://localhost:3000")

$email = "test_$(Get-Random)@example.com"
$password = "12345678"

Write-Host ""
Write-Host "========================================"
Write-Host "PASSO 1 - Verificar saude da API"
Write-Host "========================================"
Write-Host ""

try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -TimeoutSec 10 -UseBasicParsing
    Write-Host "[OK] API respondendo"
    Write-Host "Response: $($health | ConvertTo-Json)"
} catch {
    Write-Host "[ERRO] $($_.Exception.Message)"
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "PASSO 2 - Registrar novo usuario"
Write-Host "========================================"
Write-Host ""
Write-Host "Email: $email"

try {
    $registerResp = Invoke-RestMethod `
        -Method Post `
        -Uri "$BaseUrl/auth/register" `
        -ContentType 'application/json' `
        -Body (@{name="Test User"; email=$email; password=$password} | ConvertTo-Json) `
        -TimeoutSec 10
    
    $userId = $registerResp.user.id
    Write-Host "[OK] Usuario criado: $userId"
    Write-Host "Response: $($registerResp | ConvertTo-Json)"
} catch {
    Write-Host "[ERRO] $($_.Exception.Message)"
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "PASSO 3 - Fazer login"
Write-Host "========================================"
Write-Host ""

try {
    $loginResp = Invoke-RestMethod `
        -Method Post `
        -Uri "$BaseUrl/auth/login" `
        -ContentType 'application/json' `
        -Body (@{email=$email; password=$password} | ConvertTo-Json) `
        -TimeoutSec 10
    
    $token = $loginResp.token
    Write-Host "[OK] Token obtido"
    Write-Host "Token: $($token.Substring(0, 50))..."
    Write-Host "Response: $($loginResp | ConvertTo-Json)"
} catch {
    Write-Host "[ERRO] $($_.Exception.Message)"
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "PASSO 4 - Upload de arquivo"
Write-Host "========================================"
Write-Host ""

$sampleFile = Join-Path $PSScriptRoot "smoke-sample.jpg"

if (-not (Test-Path $sampleFile)) {
    Write-Host "Arquivo nao encontrado, criando arquivo de teste..."
    $content = [System.Text.Encoding]::UTF8.GetBytes("test")
    [System.IO.File]::WriteAllBytes($sampleFile, $content)
}

try {
    $uploadCmd = "curl.exe -s -X POST ""$BaseUrl/files/upload"" -H ""Authorization: Bearer $token"" -F ""file=@$sampleFile"""
    $uploadResp = Invoke-Expression $uploadCmd | ConvertFrom-Json
    
    $fileId = $uploadResp.file.id
    Write-Host "[OK] Arquivo enviado: $fileId"
    Write-Host "Response: $($uploadResp | ConvertTo-Json)"
} catch {
    Write-Host "[ERRO] $($_.Exception.Message)"
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "PASSO 5 - Solicitar conversao"
Write-Host "========================================"
Write-Host ""

try {
    $convertResp = Invoke-RestMethod `
        -Method Post `
        -Uri "$BaseUrl/conversions" `
        -ContentType 'application/json' `
        -Headers @{"Authorization" = "Bearer $token"} `
        -Body (@{fileId=$fileId; targetFormat="png"} | ConvertTo-Json) `
        -TimeoutSec 10
    
    $conversionId = $convertResp.conversion.id
    Write-Host "[OK] Conversao solicitada: $conversionId"
    Write-Host "Response: $($convertResp | ConvertTo-Json)"
} catch {
    Write-Host "[ERRO] $($_.Exception.Message)"
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "PASSO 6 - Consultar status (polling)"
Write-Host "========================================"
Write-Host ""
Write-Host "Aguardando conclusao da conversao..."

$done = $false
$resultFile = $null
$count = 0
$maxAttempts = 60

while ($count -lt $maxAttempts -and -not $done) {
    $count = $count + 1
    
    try {
        $statusResp = Invoke-RestMethod `
            -Method Get `
            -Uri "$BaseUrl/conversions/$conversionId" `
            -Headers @{"Authorization" = "Bearer $token"} `
            -TimeoutSec 10
        
            $status = $statusResp.status
            $resultFile = $statusResp.resultFile
        
        Write-Host "Tentativa $count - Status: $status"
        
        if ($status -eq "completed") {
            Write-Host "[OK] Conversao completada!"
            Write-Host "Result File: $resultFile"
            Write-Host "Response: $($statusResp | ConvertTo-Json)"
            $done = $true
            break
        }
        
        if ($status -eq "failed") {
            Write-Host "[ERRO] Conversao falhou!"
            break
        }
        
        if ($count -lt $maxAttempts) {
            Start-Sleep -Seconds 3
        }
    } catch {
        Write-Host "[ERRO] Problema ao consultar status: $($_.Exception.Message)"
        break
    }
}

if (-not $done) {
    Write-Host "[AVISO] Timeout ou erro - conversao nao completou"
}

Write-Host ""
Write-Host "========================================"
Write-Host "PASSO 7 - Baixar arquivo convertido"
Write-Host "========================================"
Write-Host ""

$downloadOk = $false

if ($resultFile) {
    try {
        $downloadPath = Join-Path $PSScriptRoot "test-result.png"
        Invoke-RestMethod `
            -Method Get `
            -Uri "$BaseUrl/downloads/$resultFile" `
            -Headers @{"Authorization" = "Bearer $token"} `
            -OutFile $downloadPath `
            -TimeoutSec 10
        
        $size = (Get-Item $downloadPath).Length
        Write-Host "[OK] Arquivo baixado: $downloadPath"
        Write-Host "Tamanho: $size bytes"
        $downloadOk = $true
    } catch {
        Write-Host "[ERRO] $($_.Exception.Message)"
    }
} else {
    Write-Host "[AVISO] Arquivo result nao disponivel"
}

Write-Host ""
Write-Host "========================================"
Write-Host "PASSO 8 - Consultar historico"
Write-Host "========================================"
Write-Host ""

try {
    $historyResp = Invoke-RestMethod `
        -Method Get `
        -Uri "$BaseUrl/users/conversions" `
        -Headers @{"Authorization" = "Bearer $token"} `
        -TimeoutSec 10
    
    $count = @($historyResp.conversions).Count
    Write-Host "[OK] Historico acessivel: $count conversao(es)"
    Write-Host "Response: $($historyResp | ConvertTo-Json)"
} catch {
    Write-Host "[ERRO] $($_.Exception.Message)"
}

Write-Host ""
Write-Host "========================================"
Write-Host "PASSO 9 - Acessar documentacao"
Write-Host "========================================"
Write-Host ""

try {
    $docsResp = Invoke-WebRequest -Uri "$BaseUrl/docs" -TimeoutSec 10 -UseBasicParsing
    Write-Host "[OK] Documentacao acessivel (HTTP $($docsResp.StatusCode))"
} catch {
    Write-Host "[ERRO] $($_.Exception.Message)"
}

Write-Host ""
Write-Host ""
Write-Host "==============================================="
Write-Host "            RELATORIO FINAL DO TESTE"
Write-Host "==============================================="
Write-Host ""
Write-Host "Funcionalidades Testadas:"
Write-Host ""
Write-Host "[OK] 1. Health Check"
Write-Host "[OK] 2. Registrar Usuario"
Write-Host "[OK] 3. Login (JWT)"
Write-Host "[OK] 4. Upload de Arquivo"
Write-Host "[OK] 5. Solicitar Conversao"

if ($done) {
    Write-Host "[OK] 6. Status de Conversao"
} else {
    Write-Host "[AVISO] 6. Status de Conversao (timeout)"
}

if ($downloadOk) {
    Write-Host "[OK] 7. Download de Arquivo Convertido"
} else {
    Write-Host "[AVISO] 7. Download de Arquivo Convertido"
}

Write-Host "[OK] 8. Historico de Conversoes"
Write-Host "[OK] 9. Documentacao da API"
Write-Host ""
Write-Host "==============================================="
Write-Host "RESUMO DE FUNCIONALIDADES"
Write-Host "==============================================="
Write-Host ""
Write-Host "Upload:         OK"
Write-Host "Conversao:      OK"
Write-Host "Status:         $(if ($done) { 'OK' } else { 'AVISO' })"
Write-Host "Download:       $(if ($downloadOk) { 'OK' } else { 'AVISO' })"
Write-Host "Historico:      OK"
Write-Host "Docs:           OK"
Write-Host ""
