#!/bin/bash

# FireTime Bootstrap Script
# 面板/cron 调用此脚本自动检查更新并部署
#
# 用法:
#   curl -fsSL https://raw.githubusercontent.com/lieyanc/FireTime/main/scripts/bootstrap.sh | bash
#
# 或者下载后本地执行:
#   ./bootstrap.sh [deploy_dir]

set -e

DEPLOY_SCRIPT_URL="https://raw.githubusercontent.com/lieyanc/FireTime/main/scripts/deploy.sh"
CONFIG_EXAMPLE_URL="https://raw.githubusercontent.com/lieyanc/FireTime/main/scripts/deploy.config.example.json"

# 默认部署脚本目录
SCRIPT_DIR="${1:-/opt/firetime-deploy}"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[BOOTSTRAP]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[BOOTSTRAP]${NC} $1"; }

# 确保目录存在
mkdir -p "$SCRIPT_DIR"
cd "$SCRIPT_DIR"

# 下载/更新 deploy.sh
log_info "更新 deploy.sh..."
curl -fsSL -o deploy.sh "$DEPLOY_SCRIPT_URL"
chmod +x deploy.sh

# 如果没有配置文件，下载示例
if [ ! -f "deploy.config.json" ]; then
    if [ ! -f "deploy.config.example.json" ]; then
        log_info "下载配置模板..."
        curl -fsSL -o deploy.config.example.json "$CONFIG_EXAMPLE_URL"
    fi
    log_warn "配置文件不存在，请先运行: cd $SCRIPT_DIR && ./deploy.sh"
    exit 1
fi

# 以 auto 模式运行
log_info "执行自动更新检查..."
./deploy.sh auto
