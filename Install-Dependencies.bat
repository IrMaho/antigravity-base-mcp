@echo off
title Install MCP Base Server Dependencies
echo ========================================================
echo   Installing NPM Dependencies for Base MCP Server...
echo ========================================================
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed!
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo [SUCCESS] Dependencies installed successfully!
pause
