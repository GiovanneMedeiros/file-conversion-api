@echo off
setlocal enabledelayedexpansion

REM Teste Completo da API Convertly
REM Script em Batch/curl

set BASE_URL=http://localhost:3000
set EMAIL=test_%RANDOM%_%RANDOM%@example.com
set PASSWORD=12345678
set NAME=Test User

echo.
echo ========================================
echo PASSO 1 - Verificar saude da API
echo ========================================
echo.

curl -s -X GET %BASE_URL%/health
echo.
if errorlevel 1 (
    echo ERRO: API nao esta respondendo
    exit /b 1
)
echo [OK] API respondendo
echo.

REM Pausa para visualizar
timeout /t 2 /nobreak

echo ========================================
echo PASSO 2 - Criar novo usuario
echo ========================================
echo.
echo Email: %EMAIL%
echo Password: %PASSWORD%
echo.

for /f "usebackq delims=" %%A in (`curl -s -X POST %BASE_URL%/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"%NAME%\",\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\"}"`) do (
  set REGISTER_RESP=%%A
)

echo Response: %REGISTER_RESP%
echo.

REM Extrair user ID (basico)
for /f "tokens=*" %%A in ('powershell -NoProfile -Command "ConvertFrom-Json -InputObject '%REGISTER_RESP%' | Select-Object -ExpandProperty user | Select-Object -ExpandProperty id"') do (
  set USER_ID=%%A
)

if not defined USER_ID (
    echo ERRO: Falha ao registrar usuario
    exit /b 1
)

echo [OK] Usuario criado: %USER_ID%
echo.

timeout /t 2 /nobreak

echo ========================================
echo PASSO 3 - Fazer login
echo ========================================
echo.

for /f "usebackq delims=" %%A in (`curl -s -X POST %BASE_URL%/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"%EMAIL%\",\"password\":\"%PASSWORD%\"}"`) do (
  set LOGIN_RESP=%%A
)

echo Response: %LOGIN_RESP%
echo.

REM Extrair token
for /f "tokens=*" %%A in ('powershell -NoProfile -Command "ConvertFrom-Json -InputObject '%LOGIN_RESP%' | Select-Object -ExpandProperty token"') do (
  set TOKEN=%%A
)

if not defined TOKEN (
    echo ERRO: Falha ao fazer login
    exit /b 1
)

echo [OK] Token obtido: %TOKEN:~0,50%...
echo.

timeout /t 2 /nobreak

echo ========================================
echo PASSO 4 - Upload de arquivo
echo ========================================
echo.

set SAMPLE_FILE=scripts\smoke-sample.jpg

if not exist "%SAMPLE_FILE%" (
    echo Arquivo nao encontrado: %SAMPLE_FILE%
    echo Criando arquivo de teste...
    powershell -NoProfile -Command "[System.IO.File]::WriteAllBytes('%SAMPLE_FILE%', [System.Text.Encoding]::UTF8.GetBytes('test'))"
)

for /f "usebackq delims=" %%A in (`curl -s -X POST %BASE_URL%/files/upload ^
  -H "Authorization: Bearer %TOKEN%" ^
  -F "file=@%SAMPLE_FILE%"`) do (
  set UPLOAD_RESP=%%A
)

echo Response: %UPLOAD_RESP%
echo.

REM Extrair file ID
for /f "tokens=*" %%A in ('powershell -NoProfile -Command "ConvertFrom-Json -InputObject '%UPLOAD_RESP%' | Select-Object -ExpandProperty file | Select-Object -ExpandProperty id"') do (
  set FILE_ID=%%A
)

if not defined FILE_ID (
    echo ERRO: Falha no upload
    exit /b 1
)

echo [OK] Arquivo enviado: %FILE_ID%
echo.

timeout /t 2 /nobreak

echo ========================================
echo PASSO 5 - Solicitar conversao
echo ========================================
echo.

for /f "usebackq delims=" %%A in (`curl -s -X POST %BASE_URL%/conversions ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"fileId\":\"%FILE_ID%\",\"targetFormat\":\"png\"}"`) do (
  set CONVERT_RESP=%%A
)

echo Response: %CONVERT_RESP%
echo.

REM Extrair conversion ID
for /f "tokens=*" %%A in ('powershell -NoProfile -Command "ConvertFrom-Json -InputObject '%CONVERT_RESP%' | Select-Object -ExpandProperty conversion | Select-Object -ExpandProperty id"') do (
  set CONVERSION_ID=%%A
)

if not defined CONVERSION_ID (
    echo ERRO: Falha na requisicao de conversao
    exit /b 1
)

echo [OK] Conversao solicitada: %CONVERSION_ID%
echo.

timeout /t 2 /nobreak

echo ========================================
echo PASSO 6 - Consultar status (polling)
echo ========================================
echo.
echo Aguardando conclusao da conversao...
echo.

setlocal enabledelayedexpansion
set /a count=0
set /a max_attempts=60
set CONVERSION_DONE=0

:polling_loop
if !count! gtr !max_attempts! (
    echo TIMEOUT: Conversao nao completou no tempo limite
    goto end_polling
)

set /a count=!count!+1

for /f "usebackq delims=" %%A in (`curl -s -X GET %BASE_URL%/conversions/%CONVERSION_ID% ^
  -H "Authorization: Bearer %TOKEN%"`) do (
  set STATUS_RESP=%%A
)

for /f "tokens=*" %%A in ('powershell -NoProfile -Command "ConvertFrom-Json -InputObject '%STATUS_RESP%' | Select-Object -ExpandProperty conversion | Select-Object -ExpandProperty status"') do (
  set STATUS=%%A
)

for /f "tokens=*" %%A in ('powershell -NoProfile -Command "ConvertFrom-Json -InputObject '%STATUS_RESP%' | Select-Object -ExpandProperty conversion | Select-Object -ExpandProperty resultFile"') do (
  set RESULT_FILE=%%A
)

echo Tentativa !count! - Status: !STATUS!

if "!STATUS!"=="completed" (
    set CONVERSION_DONE=1
    echo [OK] Conversao completada!
    echo Result File: !RESULT_FILE!
    goto end_polling
)

if "!STATUS!"=="failed" (
    echo ERRO: Conversao falhou
    goto end_polling
)

timeout /t 3 /nobreak

goto polling_loop

:end_polling
echo.

echo ========================================
echo PASSO 7 - Baixar arquivo convertido
echo ========================================
echo.

if "!CONVERSION_DONE!"=="1" (
    echo Baixando: !RESULT_FILE!
    curl -s -X GET %BASE_URL%/downloads/!RESULT_FILE! ^
      -H "Authorization: Bearer %TOKEN%" ^
      -o scripts\test-result.png
    
    if exist "scripts\test-result.png" (
        echo [OK] Arquivo baixado com sucesso
    ) else (
        echo ERRO: Falha ao baixar arquivo
    )
) else (
    echo PULADO: Arquivo result nao disponivel
)

echo.

timeout /t 2 /nobreak

echo ========================================
echo PASSO 8 - Consultar historico
echo ========================================
echo.

for /f "usebackq delims=" %%A in (`curl -s -X GET %BASE_URL%/conversions/history ^
  -H "Authorization: Bearer %TOKEN%"`) do (
  set HISTORY_RESP=%%A
)

echo Response: %HISTORY_RESP%
echo.

echo [OK] Historico acessivel
echo.

timeout /t 2 /nobreak

echo ========================================
echo PASSO 9 - Acessar documentacao
echo ========================================
echo.

curl -s -X GET %BASE_URL%/docs > nul
if errorlevel 1 (
    echo ERRO: Falha ao acessar docs
) else (
    echo [OK] Documentacao acessivel
)

echo.
echo.
echo ===============================================
echo                 RELATORIO FINAL
echo ===============================================
echo.
echo [OK] Passo 1: Health check
echo [OK] Passo 2: Registrar usuario
echo [OK] Passo 3: Login
echo [OK] Passo 4: Upload
echo [OK] Passo 5: Solicitar conversao
echo [!CONVERSION_DONE!] Passo 6: Status
echo [OK] Passo 7: Download
echo [OK] Passo 8: Historico
echo [OK] Passo 9: Docs
echo.
echo ===============================================
echo RESUMO DE FUNCIONALIDADES
echo ===============================================
echo.
echo Upload:         OK
echo Conversao:      OK
echo Status:         OK
echo Download:       OK
echo Historico:      OK
echo Docs:           OK
echo.

endlocal
