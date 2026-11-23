@echo off
title PlantCare AI - Launching Full-Stack Services
echo ========================================================
echo        🌿 PlantCare AI - Intelligent Plant Monitoring
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Python FastAPI Backend on port 8000...
start "PlantCare AI Backend" cmd /k "cd backend && .venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/3] Starting React Vite Frontend on port 5173...
start "PlantCare AI Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo [3/3] Opening browser at http://localhost:5173...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================================
echo PlantCare AI is running!
echo - Frontend: http://localhost:5173
echo - Backend API Docs: http://localhost:8000/docs
echo - Press any key to stop this launcher window.
echo ========================================================
pause
