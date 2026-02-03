#!/bin/bash

# FireTime Deploy Script
# 用法:
#   ./deploy.sh          # 手动部署（首次运行会启动配置向导）
#   ./deploy.sh check    # 仅检查是否有更新
#   ./deploy.sh auto     # 自动模式：检查更新并部署（静默，适合 cron/面板）

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/deploy.config.json"
CONFIG_EXAMPLE="$SCRIPT_DIR/deploy.config.example.json"
VERSION_FILE="$SCRIPT_DIR/.last_run_id"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
log_step() { echo -e "${CYAN}[STEP]${NC} $1"; }

# 检查依赖
check_deps() {
    command -v curl >/dev/null 2>&1 || log_error "需要安装 curl"
    command -v tar >/dev/null 2>&1 || log_error "需要安装 tar"
    command -v jq >/dev/null 2>&1 || log_error "需要安装 jq: apt install jq"
    command -v unzip >/dev/null 2>&1 || log_error "需要安装 unzip"
}

# TUI 配置向导
setup_wizard() {
    echo ""
    echo -e "${BOLD}╭─────────────────────────────────────────╮${NC}"
    echo -e "${BOLD}│  ${CYAN}FireTime Deploy Setup${NC}${BOLD}                  │${NC}"
    echo -e "${BOLD}╰─────────────────────────────────────────╯${NC}"
    echo ""

    # 读取默认值
    local default_repo="lieyanc/FireTime"
    local default_dir="/opt/firetime"
    local default_port="3010"
    local default_pm="pm2"

    # 交互式配置
    echo -e "${BLUE}[1/5]${NC} GitHub 仓库"
    read -p "      (${default_repo}): " input_repo
    local repo="${input_repo:-$default_repo}"

    echo -e "${BLUE}[2/5]${NC} 部署目录"
    read -p "      (${default_dir}): " input_dir
    local deploy_dir="${input_dir:-$default_dir}"

    echo -e "${BLUE}[3/5]${NC} 端口"
    read -p "      (${default_port}): " input_port
    local port="${input_port:-$default_port}"

    echo -e "${BLUE}[4/5]${NC} GitHub Token (私有仓库需要，回车跳过)"
    read -sp "      : " input_token
    echo ""
    local token="${input_token:-}"

    echo -e "${BLUE}[5/5]${NC} 进程管理器"
    echo "      选项: pm2 / systemd / none"
    read -p "      (${default_pm}): " input_pm
    local pm="${input_pm:-$default_pm}"

    # 生成配置文件
    cat > "$CONFIG_FILE" << EOF
{
  "repo": "$repo",
  "artifact_name": "firetime-standalone",
  "deploy_dir": "$deploy_dir",
  "port": $port,
  "github_token": "$token",
  "auto_restart": true,
  "process_manager": "$pm"
}
EOF

    echo ""
    echo -e "${GREEN}✓${NC} 配置已保存到 ${CYAN}deploy.config.json${NC}"
    echo ""
}

# 加载配置
load_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        return 1
    fi
    
    REPO=$(jq -r '.repo' "$CONFIG_FILE")
    ARTIFACT_NAME=$(jq -r '.artifact_name' "$CONFIG_FILE")
    DEPLOY_DIR=$(jq -r '.deploy_dir' "$CONFIG_FILE")
    PORT=$(jq -r '.port' "$CONFIG_FILE")
    GITHUB_TOKEN=$(jq -r '.github_token // ""' "$CONFIG_FILE")
    AUTO_RESTART=$(jq -r '.auto_restart // true' "$CONFIG_FILE")
    PROCESS_MANAGER=$(jq -r '.process_manager // "pm2"' "$CONFIG_FILE")
    
    return 0
}

# 获取最新构建信息
get_latest_run() {
    local auth_header=""
    if [ -n "$GITHUB_TOKEN" ]; then
        auth_header="Authorization: Bearer $GITHUB_TOKEN"
    fi

    local response
    if [ -n "$auth_header" ]; then
        response=$(curl -s -H "$auth_header" \
            "https://api.github.com/repos/$REPO/actions/runs?status=success&per_page=1")
    else
        response=$(curl -s \
            "https://api.github.com/repos/$REPO/actions/runs?status=success&per_page=1")
    fi

    echo "$response" | jq -r '.workflow_runs[0].id'
}

# 检查更新
check_update() {
    local latest_run=$(get_latest_run)
    
    if [ "$latest_run" == "null" ] || [ -z "$latest_run" ]; then
        echo "none"
        return
    fi

    local last_run=""
    if [ -f "$VERSION_FILE" ]; then
        last_run=$(cat "$VERSION_FILE")
    fi

    if [ "$latest_run" == "$last_run" ]; then
        echo "current"
    else
        echo "$latest_run"
    fi
}

# 下载并部署
deploy() {
    local run_id="$1"
    
    log_step "获取 artifact 下载链接..."
    
    local auth_header=""
    if [ -n "$GITHUB_TOKEN" ]; then
        auth_header="Authorization: Bearer $GITHUB_TOKEN"
    fi

    local response
    if [ -n "$auth_header" ]; then
        response=$(curl -s -H "$auth_header" \
            "https://api.github.com/repos/$REPO/actions/runs/$run_id/artifacts")
    else
        response=$(curl -s \
            "https://api.github.com/repos/$REPO/actions/runs/$run_id/artifacts")
    fi

    local artifact_url=$(echo "$response" | jq -r ".artifacts[] | select(.name==\"$ARTIFACT_NAME\") | .archive_download_url")
    
    if [ "$artifact_url" == "null" ] || [ -z "$artifact_url" ]; then
        log_error "未找到 artifact: $ARTIFACT_NAME"
    fi

    log_step "下载构建产物..."
    local temp_dir=$(mktemp -d)
    cd "$temp_dir"

    if [ -n "$auth_header" ]; then
        curl -sL -H "$auth_header" -o artifact.zip "$artifact_url"
    else
        curl -sL -o artifact.zip "$artifact_url"
    fi

    log_step "解压文件..."
    unzip -q artifact.zip
    tar -xzf firetime-standalone.tar.gz

    # 停止现有进程
    if [ "$AUTO_RESTART" == "true" ]; then
        log_step "停止现有进程..."
        case "$PROCESS_MANAGER" in
            pm2)
                pm2 stop firetime 2>/dev/null || true
                ;;
            systemd)
                sudo systemctl stop firetime 2>/dev/null || true
                ;;
        esac
    fi

    log_step "部署到 $DEPLOY_DIR..."
    sudo mkdir -p "$DEPLOY_DIR"
    sudo rm -rf "$DEPLOY_DIR"/*
    sudo cp -r . "$DEPLOY_DIR"/
    sudo rm -f "$DEPLOY_DIR"/artifact.zip "$DEPLOY_DIR"/firetime-standalone.tar.gz

    # 保存版本号
    echo "$run_id" > "$VERSION_FILE"

    # 清理临时文件
    cd /
    rm -rf "$temp_dir"

    # 重启进程
    if [ "$AUTO_RESTART" == "true" ]; then
        log_step "启动应用..."
        case "$PROCESS_MANAGER" in
            pm2)
                cd "$DEPLOY_DIR" && PORT=$PORT pm2 start server.js --name firetime
                ;;
            systemd)
                sudo systemctl start firetime
                ;;
            none)
                log_info "请手动启动: cd $DEPLOY_DIR && PORT=$PORT node server.js"
                ;;
        esac
    fi

    log_info "部署完成! Run ID: $run_id"
}

# 主逻辑
main() {
    local mode="${1:-deploy}"
    
    check_deps

    # 首次运行检查
    if [ ! -f "$CONFIG_FILE" ]; then
        if [ "$mode" == "auto" ]; then
            log_error "配置文件不存在，请先运行 ./deploy.sh 进行配置"
        fi
        setup_wizard
    fi

    load_config

    case "$mode" in
        check)
            log_info "检查更新..."
            local status=$(check_update)
            case "$status" in
                none)
                    log_warn "未找到成功的构建记录"
                    exit 1
                    ;;
                current)
                    log_info "已是最新版本"
                    exit 0
                    ;;
                *)
                    log_info "发现新版本: Run ID $status"
                    exit 0
                    ;;
            esac
            ;;
        
        auto)
            local status=$(check_update)
            case "$status" in
                none|current)
                    exit 0
                    ;;
                *)
                    deploy "$status"
                    ;;
            esac
            ;;
        
        deploy|*)
            log_info "检查更新..."
            local status=$(check_update)
            case "$status" in
                none)
                    log_error "未找到成功的构建记录"
                    ;;
                current)
                    log_info "已是最新版本"
                    read -p "是否强制重新部署? [y/N] " confirm
                    if [[ "$confirm" =~ ^[Yy]$ ]]; then
                        local run_id=$(get_latest_run)
                        deploy "$run_id"
                    fi
                    ;;
                *)
                    log_info "发现新版本: Run ID $status"
                    deploy "$status"
                    ;;
            esac
            ;;
    esac
}

main "$@"
