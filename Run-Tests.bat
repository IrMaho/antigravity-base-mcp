@echo off
title Run Base MCP Server Tests
echo ========================================================
echo   Running MCP Unit & Protocol Integration Tests...
echo ========================================================
call npm run test:all
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Tests failed!
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo [SUCCESS] All tests passed with flying colors!
pause
