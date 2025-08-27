@echo off
setlocal
cd /d "%~dp0"

REM 1) Iniciar mock API en background (Node)
start "Mock API" cmd /k "npm start"

REM Esperar 1.5s para que arranque
ping -n 2 127.0.0.1 >nul

echo Iniciando servidor estático (Python)
start "Static Server" cmd /k "python -m http.server 8000"

REM Esperar unos segundos para que ambos estén arriba
ping -n 3 127.0.0.1 >nul

echo Ejecutando pruebas curl...

REM Login
curl -s -X POST -H "Content-Type: application/json" -d @test_login.json http://localhost:8010/usuarios/api/login/ -o login_response.json
if %errorlevel% neq 0 (
  echo Error en login
) else (
  type login_response.json
)

REM Extraer token (simple parsing usando PowerShell)
for /f "delims=" %%a in ('powershell -NoProfile -Command "(Get-Content login_response.json | ConvertFrom-Json).access"') do set ACCESS=%%a

echo access token: %ACCESS%

REM PUT update profile
curl -s -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer %ACCESS%" -d @test_update.json http://localhost:8010/usuarios/api/usuario/perfil/ -o update_response.json
if %errorlevel% neq 0 (
  echo Error en update
) else (
  type update_response.json
)

@echo off
setlocal
cd /d "%~dp0"

REM 1) Iniciar mock API en background (Node)
start "Mock API" cmd /k "npm start"

REM Esperar 1.5s para que arranque
ping -n 2 127.0.0.1 >nul

echo Iniciando servidor estático (Python)
start "Static Server" cmd /k "python -m http.server 8000"

REM Esperar unos segundos para que ambos estén arriba
ping -n 3 127.0.0.1 >nul

echo Abriendo la UI en el navegador por defecto...
start "" "http://localhost:8000"

REM Esperar unos segundos antes de ejecutar pruebas
ping -n 2 127.0.0.1 >nul

echo Ejecutando pruebas curl...

REM Login
curl -s -X POST -H "Content-Type: application/json" -d @test_login.json http://localhost:8010/usuarios/api/login/ -o login_response.json
if %errorlevel% neq 0 (
  echo Error en login
) else (
  type login_response.json
)

REM Extraer token (simple parsing usando PowerShell)
for /f "delims=" %%a in ('powershell -NoProfile -Command "(Get-Content login_response.json | ConvertFrom-Json).access"') do set ACCESS=%%a

echo access token: %ACCESS%

REM PUT update profile
curl -s -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer %ACCESS%" -d @test_update.json http://localhost:8010/usuarios/api/usuario/perfil/ -o update_response.json
if %errorlevel% neq 0 (
  echo Error en update
) else (
  type update_response.json
)

pause
endlocal
