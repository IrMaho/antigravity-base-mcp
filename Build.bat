@echo off
title Build Base MCP Server
echo ========================================================
echo   Building Base MCP Server (Vite + TypeScript)...
echo ========================================================
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed!
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo [SUCCESS] Build completed into /dist directory!
pause
