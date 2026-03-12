param(
  [string]$BaseUrl = "http://localhost:3000",
  [string]$TargetFormat = "png",
  [switch]$SkipRedisBootstrap
)

$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

$logsDir = Join-Path $PSScriptRoot ".logs"
New-Item -ItemType Directory -Path $logsDir -Force | Out-Null

$apiOut = Join-Path $logsDir "api.out.log"
$apiErr = Join-Path $logsDir "api.err.log"
$workerOut = Join-Path $logsDir "worker.out.log"
$workerErr = Join-Path $logsDir "worker.err.log"
$redisOut = Join-Path $logsDir "redis.out.log"
$redisErr = Join-Path $logsDir "redis.err.log"

Remove-Item $apiOut,$apiErr,$workerOut,$workerErr,$redisOut,$redisErr -Force -ErrorAction SilentlyContinue

$apiProc = $null
$workerProc = $null
$redisProc = $null
$redisStartedByScript = $false
$redisStartedByDocker = $false

function Write-Validate {
  param([string]$Message)
  Write-Host "[VALIDATE] $Message"
}

function Test-TcpPort {
  param(
    [string]$Host,
    [int]$Port,
    [int]$TimeoutMs = 1200
  )

  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $iar = $client.BeginConnect($Host, $Port, $null, $null)
    if (-not $iar.AsyncWaitHandle.WaitOne($TimeoutMs, $false)) {
      $client.Close()
      return $false
    }
    $client.EndConnect($iar)
    $client.Close()
    return $true
  } catch {
    return $false
  }
}

function Wait-ForHealth {
  param(
    [string]$Url,
    [int]$MaxSeconds = 60
  )

  $deadline = (Get-Date).AddSeconds($MaxSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $resp = Invoke-RestMethod -Method Get -Uri "$Url/health" -TimeoutSec 5
      if ($resp.status -eq "ok") {
        return $true
      }
    } catch {
      Start-Sleep -Seconds 2
    }
  }

  return $false
}

function Cleanup {
  Write-Validate "Cleaning up started processes"

  if ($workerProc -and -not $workerProc.HasExited) {
    Stop-Process -Id $workerProc.Id -Force -ErrorAction SilentlyContinue
  }

  if ($apiProc -and -not $apiProc.HasExited) {
    Stop-Process -Id $apiProc.Id -Force -ErrorAction SilentlyContinue
  }

  if ($redisProc -and -not $redisProc.HasExited) {
    Stop-Process -Id $redisProc.Id -Force -ErrorAction SilentlyContinue
  }

  if ($redisStartedByDocker) {
    try {
      & docker compose stop redis | Out-Null
    } catch {
      Write-Validate "Could not stop docker redis service automatically"
    }
  }
}

try {
  Write-Validate "Running local full validation from $root"

  if (-not $SkipRedisBootstrap) {
    if (Test-TcpPort -Host "127.0.0.1" -Port 6379) {
      Write-Validate "Redis already available on 127.0.0.1:6379"
    } else {
      $redisServer = Get-Command redis-server -ErrorAction SilentlyContinue
      if ($redisServer) {
        Write-Validate "Starting Redis using redis-server"
        $redisProc = Start-Process -FilePath $redisServer.Source -PassThru -RedirectStandardOutput $redisOut -RedirectStandardError $redisErr
        Start-Sleep -Seconds 2
        if (Test-TcpPort -Host "127.0.0.1" -Port 6379) {
          $redisStartedByScript = $true
        } else {
          throw "Redis failed to start with redis-server"
        }
      } else {
        $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
        if ($dockerCmd) {
          Write-Validate "Starting Redis using docker compose"
          & docker compose up -d redis | Out-Null
          Start-Sleep -Seconds 3
          if (Test-TcpPort -Host "127.0.0.1" -Port 6379) {
            $redisStartedByDocker = $true
          } else {
            throw "Redis failed to start with docker compose"
          }
        } else {
          throw "Redis is not running and neither redis-server nor docker are available"
        }
      }
    }
  } else {
    Write-Validate "Skipping Redis bootstrap as requested"
  }

  Write-Validate "Applying Prisma migrations"
  & npx prisma migrate deploy
  if ($LASTEXITCODE -ne 0) {
    throw "prisma migrate deploy failed"
  }

  Write-Validate "Starting API"
  $apiProc = Start-Process -FilePath "node" -ArgumentList "src/server.js" -PassThru -RedirectStandardOutput $apiOut -RedirectStandardError $apiErr

  Write-Validate "Starting worker"
  $workerProc = Start-Process -FilePath "node" -ArgumentList "src/workers/conversion.worker.js" -PassThru -RedirectStandardOutput $workerOut -RedirectStandardError $workerErr

  Write-Validate "Waiting for API health"
  if (-not (Wait-ForHealth -Url $BaseUrl -MaxSeconds 90)) {
    throw "API health check failed on $BaseUrl/health"
  }

  Write-Validate "Running smoke test"
  & powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "smoke.ps1") -BaseUrl $BaseUrl -TargetFormat $TargetFormat -FailOnConvertError
  if ($LASTEXITCODE -ne 0) {
    throw "Smoke test failed"
  }

  Write-Validate "Validation SUCCESS"
  exit 0
} catch {
  Write-Validate "Validation FAILURE: $($_.Exception.Message)"
  Write-Validate "API log: $apiOut"
  Write-Validate "Worker log: $workerOut"
  Write-Validate "Redis log: $redisOut"
  exit 1
} finally {
  Cleanup
}
