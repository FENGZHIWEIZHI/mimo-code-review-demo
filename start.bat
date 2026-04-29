@echo off
setlocal enabledelayedexpansion

:: 检查Python是否安装
echo 检查Python安装...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Python。请先安装Python 3.9或更高版本。
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo 检测到Python版本: %PYTHON_VERSION%

:: 检查Node.js是否安装
echo 检查Node.js安装...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js。请先安装Node.js 16或更高版本。
    pause
    exit /b 1
)

for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo 检测到Node.js版本: %NODE_VERSION%

:: 设置后端环境
echo 正在设置后端环境...

:: 进入后端目录
cd backend

:: 检查并创建虚拟环境
if not exist "venv" (
    echo 创建Python虚拟环境...
    python -m venv venv
)

:: 激活虚拟环境
echo 激活虚拟环境...
call venv\Scripts\activate

:: 安装依赖
echo 安装Python依赖...
pip install -r requirements.txt

:: 检查环境变量文件
if not exist ".env" (
    echo 创建环境变量文件...
    copy .env.example .env
    echo 请编辑 backend\.env 文件，填入你的MiMo API密钥
)

:: 退出虚拟环境
deactivate

:: 返回项目根目录
cd ..

echo 后端环境设置完成！

:: 设置前端环境
echo 正在设置前端环境...

:: 进入前端目录
cd frontend

:: 安装依赖
echo 安装npm依赖...
npm install

:: 返回项目根目录
cd ..

echo 前端环境设置完成！
echo 环境设置完成！可以使用 'start.bat start' 启动服务。
pause
goto :eof

:: 启动后端服务
:start_backend
echo 正在启动后端服务...

:: 进入后端目录
cd backend

:: 激活虚拟环境
call venv\Scripts\activate

:: 启动Flask应用
echo 启动Flask服务器...
start "MiMo Backend" python app.py

:: 等待服务启动
timeout /t 3 >nul

:: 退出虚拟环境
deactivate

:: 返回项目根目录
cd ..

echo 后端服务已启动！
echo 后端地址: http://localhost:5000
goto :eof

:: 启动前端服务
:start_frontend
echo 正在启动前端服务...

:: 进入前端目录
cd frontend

:: 启动前端服务
echo 启动Vite开发服务器...
start "MiMo Frontend" npm run dev

:: 返回项目根目录
cd ..

echo 前端服务已启动！
echo 前端地址: http://localhost:5173
goto :eof

:: 停止服务
:stop_services
echo 正在停止服务...

:: 查找并关闭Flask进程
echo 停止后端服务...
taskkill /FI "WINDOWTITLE eq MiMo Backend" /T /F >nul 2>&1

:: 查找并关闭npm进程
echo 停止前端服务...
taskkill /FI "WINDOWTITLE eq MiMo Frontend" /T /F >nul 2>&1

echo 所有服务已停止！
goto :eof

:: 显示帮助信息
:show_help
echo MiMo 智能代码审查助手 - 启动脚本
echo.
echo 用法: %~nx0 [选项]
echo.
echo 选项:
echo   setup    设置开发环境（安装依赖）
echo   start    启动后端和前端服务
echo   stop     停止所有服务
echo   restart  重启所有服务
echo   help     显示此帮助信息
echo.
goto :eof

:: 主函数
if "%1"=="" goto :show_help

if "%1"=="setup" (
    echo ========== 设置开发环境 ==========
    goto :eof
) else if "%1"=="start" (
    echo ========== 启动服务 ==========
    call :start_backend
    call :start_frontend
    echo 服务启动完成！
    echo 前端地址: http://localhost:5173
    echo 后端地址: http://localhost:5000
    echo.
    echo 按任意键退出...
    pause >nul
) else if "%1"=="stop" (
    echo ========== 停止服务 ==========
    call :stop_services
    pause
) else if "%1"=="restart" (
    echo ========== 重启服务 ==========
    call :stop_services
    timeout /t 2 >nul
    call :start_backend
    call :start_frontend
    echo 服务重启完成！
    echo 前端地址: http://localhost:5173
    echo 后端地址: http://localhost:5000
    pause
) else if "%1"=="help" (
    call :show_help
    pause
) else (
    call :show_help
    pause
)

endlocal