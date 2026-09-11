@echo off
title Register MCP Server to Google Antigravity IDE
echo ====================================================================
echo   Registering this MCP Server to Google Antigravity & Claude Desktop
echo ====================================================================
echo.
call npm run register
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to register MCP server!
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo [SUCCESS] Server successfully registered! 
echo Now open Antigravity IDE -> Manage MCP servers and click Refresh.
echo.
pause
