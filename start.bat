@echo off
echo Starting Realm of Ascension...

start "Backend" cmd /k "cd backend && node src/index.js"

timeout /t 2 /nobreak >nul

start "Frontend" cmd /k "cd frontend && npx ng serve --port 4200"

echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:4200
echo.
echo Both servers are starting in separate windows.
