#!/bin/bash

# RedNote-AutoGen 一键启动脚本
# 作者：RedNote团队
# 用途：在Ubuntu系统上一键打包并启动RedNote-AutoGen项目

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # 无颜色

# 默认端口
DEFAULT_PORT=3005
PORT=${1:-$DEFAULT_PORT}

# 后台图像服务默认端口
DEFAULT_IMAGE_PORT=8000
IMAGE_PORT=${2:-$DEFAULT_IMAGE_PORT}

# 打印带颜色的信息
print_info() {
  echo -e "${BLUE}[信息]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[成功]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[警告]${NC} $1"
}

print_error() {
  echo -e "${RED}[错误]${NC} $1"
}

# 检查依赖
check_dependencies() {
  print_info "检查必要的依赖..."
  
  # 检查Node.js
  if ! command -v node &> /dev/null; then
    print_error "未安装Node.js，请先安装Node.js 16.0.0或更高版本"
    exit 1
  fi
  
  # 检查npm
  if ! command -v npm &> /dev/null; then
    print_error "未安装npm，请先安装npm"
    exit 1
  fi
  
  NODE_VERSION=$(node -v | cut -d 'v' -f 2)
  print_success "Node.js版本: $NODE_VERSION"
  print_success "npm版本: $(npm -v)"
  
  # 检查是否满足版本要求
  NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)
  if [ "$NODE_MAJOR_VERSION" -lt 16 ]; then
    print_error "Node.js版本过低，请升级到16.0.0或更高版本"
    exit 1
  fi
}

# 安装项目依赖
install_dependencies() {
  print_info "安装项目依赖..."
  npm install
  if [ $? -ne 0 ]; then
    print_error "安装依赖失败，请检查网络连接或手动运行npm install"
    exit 1
  fi
  print_success "依赖安装完成"
}

# 构建项目
build_project() {
  print_info "构建项目..."
  npm run build
  if [ $? -ne 0 ]; then
    print_error "项目构建失败"
    exit 1
  fi
  print_success "项目构建完成"
}

# 检查图像服务
check_image_service() {
  print_info "检查图像生成服务..."
  
  # 检查Image-AutoGenService目录是否存在
  if [ -d "./Image-AutoGenService" ]; then
    print_success "找到图像服务目录"
    return 0
  else
    print_warning "未找到图像服务目录，尝试检查图像服务是否已经在运行..."
    
    # 尝试连接后台服务，检查是否已经在运行
    if curl -s http://localhost:$IMAGE_PORT/healthcheck &> /dev/null; then
      print_success "图像服务已经在运行，端口：$IMAGE_PORT"
      return 0
    else
      print_warning "图像服务未运行，将尝试从GitHub克隆..."
      
      # 尝试克隆服务
      if command -v git &> /dev/null; then
        git clone https://github.com/xdrshjr/OneClickFluxGen Image-AutoGenService
        if [ $? -ne 0 ]; then
          print_warning "克隆图像服务失败，项目将使用没有图像生成功能的模式启动"
          return 1
        else
          print_success "成功克隆图像服务"
          return 0
        fi
      else
        print_warning "未安装git，无法克隆图像服务，项目将使用没有图像生成功能的模式启动"
        return 1
      fi
    fi
  fi
}

# 启动图像服务
start_image_service() {
  # 检查图像服务
  check_image_service
  if [ $? -ne 0 ]; then
    print_warning "跳过启动图像服务，继续启动主项目..."
    return
  fi
  
  print_info "正在启动图像生成服务，端口：$IMAGE_PORT..."
  
  # 检查服务是否已在运行
  if curl -s http://localhost:$IMAGE_PORT/healthcheck &> /dev/null; then
    print_success "图像服务已经在运行，无需重新启动"
    return
  fi
  
  # 检查启动脚本是否存在
  if [ -f "./Image-AutoGenService/start.sh" ]; then
    # 运行启动脚本，设置端口
    cd ./Image-AutoGenService
    chmod +x start.sh
    ./start.sh $IMAGE_PORT &
    cd ..
    
    # 等待服务启动
    print_info "等待图像服务启动..."
    ATTEMPTS=0
    MAX_ATTEMPTS=30
    while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
      if curl -s http://localhost:$IMAGE_PORT/healthcheck &> /dev/null; then
        print_success "图像服务已成功启动"
        break
      fi
      ATTEMPTS=$((ATTEMPTS + 1))
      sleep 1
    done
    
    if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
      print_warning "图像服务启动超时，项目将使用没有图像生成功能的模式启动"
    fi
  else
    print_warning "找不到图像服务启动脚本，项目将使用没有图像生成功能的模式启动"
  fi
}

# 更新环境配置
update_env_config() {
  print_info "更新环境配置文件..."
  
  # 检查.env文件是否存在
  if [ -f ".env" ]; then
    # 备份原始.env文件
    cp .env .env.backup
    
    # 更新或添加图像服务URL配置
    if grep -q "NEXT_PUBLIC_IMAGE_SERVICE_URL" .env; then
      # 替换现有配置
      sed -i "s|NEXT_PUBLIC_IMAGE_SERVICE_URL=.*|NEXT_PUBLIC_IMAGE_SERVICE_URL=http://localhost:$IMAGE_PORT|g" .env
    else
      # 添加新配置
      echo "NEXT_PUBLIC_IMAGE_SERVICE_URL=http://localhost:$IMAGE_PORT" >> .env
    fi
    
    print_success "环境配置已更新"
  else
    print_warning "找不到.env文件，将使用默认配置启动"
  fi
}

# 启动项目
start_project() {
  print_info "在端口 $PORT 上启动项目..."
  # 设置环境变量PORT来指定端口
  PORT=$PORT npm run start
}

# 显示使用说明
show_usage() {
  echo "使用方法: $0 [前端端口] [图像服务端口]"
  echo "  [前端端口]: 可选，默认为3000"
  echo "  [图像服务端口]: 可选，默认为8000"
  echo "示例:"
  echo "  $0                   # 使用默认端口启动"
  echo "  $0 4000              # 使用端口4000启动前端服务"
  echo "  $0 4000 9000         # 使用端口4000启动前端服务，端口9000启动图像服务"
}

# 主函数
main() {
  # 检查是否请求帮助
  if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_usage
    exit 0
  fi
  
  print_info "欢迎使用RedNote-AutoGen一键启动脚本"
  print_info "=================================="
  
  # 检查当前系统
  if [[ "$(uname)" != "Linux" ]]; then
    print_warning "当前脚本设计用于Ubuntu系统，在其他系统上可能会有问题"
  fi
  
  print_info "前端服务将使用端口: $PORT"
  print_info "图像服务将使用端口: $IMAGE_PORT"
  
  check_dependencies
  install_dependencies
  start_image_service
  update_env_config
  build_project
  
  print_info "=================================="
  print_success "一切准备就绪！"
  print_info "现在将在端口 $PORT 上启动RedNote-AutoGen"
  print_info "使用Ctrl+C可以停止服务"
  print_info "=================================="
  
  start_project
}

# 运行主函数
main "$@" 