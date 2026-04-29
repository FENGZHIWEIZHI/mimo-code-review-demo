#!/bin/bash

# 输出带颜色的文本
print_green() {
    echo -e "\033[0;32m$1\033[0m"
}

print_blue() {
    echo -e "\033[0;34m$1\033[0m"
}

print_yellow() {
    echo -e "\033[0;33m$1\033[0m"
}

print_red() {
    echo -e "\033[0;31m$1\033[0m"
}

# 检查Python是否安装
check_python() {
    if ! command -v python3 &> /dev/null; then
        print_red "错误: 未找到Python3。请先安装Python 3.9或更高版本。"
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    print_blue "检测到Python版本: $PYTHON_VERSION"
}

# 检查Node.js是否安装
check_node() {
    if ! command -v node &> /dev/null; then
        print_red "错误: 未找到Node.js。请先安装Node.js 16或更高版本。"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_blue "检测到Node.js版本: $NODE_VERSION"
}

# 设置后端环境
setup_backend() {
    print_blue "正在设置后端环境..."
    
    # 进入后端目录
    cd backend
    
    # 检查并创建虚拟环境
    if [ ! -d "venv" ]; then
        print_yellow "创建Python虚拟环境..."
        python3 -m venv venv
    fi
    
    # 激活虚拟环境
    print_yellow "激活虚拟环境..."
    source venv/bin/activate
    
    # 安装依赖
    print_yellow "安装Python依赖..."
    pip install -r requirements.txt
    
    # 检查环境变量文件
    if [ ! -f ".env" ]; then
        print_yellow "创建环境变量文件..."
        cp .env.example .env
        print_yellow "请编辑 backend/.env 文件，填入你的MiMo API密钥"
    fi
    
    # 退出虚拟环境
    deactivate
    
    # 返回项目根目录
    cd ..
    
    print_green "后端环境设置完成！"
}

# 设置前端环境
setup_frontend() {
    print_blue "正在设置前端环境..."
    
    # 进入前端目录
    cd frontend
    
    # 安装依赖
    print_yellow "安装npm依赖..."
    npm install
    
    # 返回项目根目录
    cd ..
    
    print_green "前端环境设置完成！"
}

# 启动后端服务
start_backend() {
    print_blue "正在启动后端服务..."
    
    # 进入后端目录
    cd backend
    
    # 激活虚拟环境
    source venv/bin/activate
    
    # 在后台运行Flask应用
    print_yellow "启动Flask服务器..."
    python app.py > backend.log 2>&1 &
    BACKEND_PID=$!
    
    # 保存PID到文件
    echo $BACKEND_PID > backend.pid
    
    # 退出虚拟环境
    deactivate
    
    # 返回项目根目录
    cd ..
    
    print_green "后端服务已启动 (PID: $BACKEND_PID)!"
    print_blue "后端日志: tail -f backend/backend.log"
}

# 启动前端服务
start_frontend() {
    print_blue "正在启动前端服务..."
    
    # 进入前端目录
    cd frontend
    
    # 在后台运行前端服务
    print_yellow "启动Vite开发服务器..."
    npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # 保存PID到文件
    echo $FRONTEND_PID > frontend.pid
    
    # 返回项目根目录
    cd ..
    
    print_green "前端服务已启动 (PID: $FRONTEND_PID)!"
    print_blue "前端日志: tail -f frontend/frontend.log"
}

# 停止服务
stop_services() {
    print_blue "正在停止服务..."
    
    # 停止后端服务
    if [ -f "backend/backend.pid" ]; then
        BACKEND_PID=$(cat backend/backend.pid)
        print_yellow "停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || true
        rm backend/backend.pid
    fi
    
    # 停止前端服务
    if [ -f "frontend/frontend.pid" ]; then
        FRONTEND_PID=$(cat frontend/frontend.pid)
        print_yellow "停止前端服务 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
        rm frontend/frontend.pid
    fi
    
    print_green "所有服务已停止！"
}

# 显示帮助信息
show_help() {
    echo "MiMo 智能代码审查助手 - 启动脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  setup    设置开发环境（安装依赖）"
    echo "  start    启动后端和前端服务"
    echo "  stop     停止所有服务"
    echo "  restart  重启所有服务"
    echo "  help     显示此帮助信息"
    echo ""
}

# 主函数
main() {
    case "$1" in
        setup)
            print_blue "========== 设置开发环境 =========="
            check_python
            check_node
            setup_backend
            setup_frontend
            print_green "环境设置完成！可以使用 './start.sh start' 启动服务。"
            ;;
        start)
            print_blue "========== 启动服务 =========="
            start_backend
            start_frontend
            print_green "服务启动完成！"
            print_green "前端地址: http://localhost:5173"
            print_green "后端地址: http://localhost:5000"
            ;;
        stop)
            print_blue "========== 停止服务 =========="
            stop_services
            ;;
        restart)
            print_blue "========== 重启服务 =========="
            stop_services
            sleep 2
            start_backend
            start_frontend
            print_green "服务重启完成！"
            print_green "前端地址: http://localhost:5173"
            print_green "后端地址: http://localhost:5000"
            ;;
        help|*)
            show_help
            ;;
    esac
}

# 执行主函数
main "$@"