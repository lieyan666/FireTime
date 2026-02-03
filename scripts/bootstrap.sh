#!/bin/bash

# FireTime Bootstrap Script
# 面板/cron 调用此脚本自动检查更新并部署
#
# 用法 (国际):
#   curl -fsSL https://raw.githubusercontent.com/lieyanc/FireTime/master/scripts/bootstrap.sh | bash
#
# 用法 (中国大陆加速):
#   curl -fsSL https://gh-proxy.org/https://raw.githubusercontent.com/lieyanc/FireTime/master/scripts/bootstrap.sh | bash
#
# 或者下载后本地执行:
#   ./bootstrap.sh [deploy_dir]

set -e

# GitHub 代理（中国大陆加速）
GH_PROXY=""
GH_RAW_PROXY=""

# 检测是否在中国大陆
detect_china() {
    if ! curl -s --connect-timeout 2 -o /dev/null https://www.google.com 2>/dev/null; then
        GH_PROXY="https://gh-proxy.org/"
        GH_RAW_PROXY="https://gh-proxy.org/"
        echo "[BOOTSTRAP] 检测到中国大陆网络，使用加速代理"
    fi
}

detect_china

DEPLOY_SCRIPT_URL="${GH_RAW_PROXY}https://raw.githubusercontent.com/lieyanc/FireTime/master/scripts/deploy.sh"
CONFIG_EXAMPLE_URL="${GH_RAW_PROXY}https://raw.githubusercontent.com/lieyanc/FireTime/master/scripts/deploy.config.example.json"

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
