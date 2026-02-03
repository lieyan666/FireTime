# FireTime

一个双人时间管理应用，帮助两位用户管理每日日程、待办事项、作业进度和考试倒计时。

## 功能特性

- **双人日程管理** — 两位用户各自维护独立的每日时间表，可互相查看
- **待办事项** — 支持待办状态循环（待做 → 进行中 → 已完成）
- **假期进度** — 可视化假期剩余天数
- **作业跟踪** — 按学科管理作业完成进度
- **考试倒计时** — 追踪重要考试日期
- **日程模板** — 新建日程时自动应用默认模板
- **日历视图** — 按月查看历史日程完成情况
- **沉浸时钟** — 专注模式时钟界面

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **UI 组件**: Radix UI + shadcn/ui
- **数据获取**: SWR
- **数据存储**: JSON 文件（本地文件系统）

## 快速开始

### 环境要求

- Node.js 20+
- npm / pnpm / yarn

### 安装

```bash
git clone <repo-url>
cd FireTime
npm install
```

### 开发

```bash
npm run dev
```

打开 http://localhost:3000 访问应用。

### 构建

```bash
npm run build
npm run start
```

## 项目结构

```
FireTime/
├── app/                    # Next.js App Router 页面
│   ├── api/                # API 路由
│   │   ├── days/[date]/    # 日数据 CRUD
│   │   ├── todos/          # 待办事项
│   │   ├── settings/       # 应用设置
│   │   ├── templates/      # 日程模板
│   │   └── users/          # 用户信息
│   └── (app)/              # 页面路由组
│       ├── dashboard/      # 主面板
│       ├── day/[date]/     # 单日详情
│       ├── calendar/       # 日历视图
│       ├── clock/          # 沉浸时钟
│       ├── pk/             # 双人对比
│       ├── assign/         # 任务分配
│       └── settings/       # 设置
├── components/             # React 组件
│   └── ui/                 # shadcn/ui 基础组件
├── hooks/                  # 自定义 Hooks
├── lib/                    # 工具函数和类型
│   ├── store.ts            # 数据存储层
│   ├── types.ts            # TypeScript 类型定义
│   ├── dates.ts            # 日期工具函数
│   └── utils.ts            # 通用工具
└── data/                   # 数据存储目录
    ├── users.json          # 用户信息
    ├── settings.json       # 应用设置
    ├── templates.json      # 日程模板
    ├── todos.json          # 全局待办
    └── days/               # 每日数据
        └── YYYY-MM-DD.json
```

## 数据存储

应用使用 JSON 文件作为数据库，所有数据存储在 `data/` 目录下：

| 文件 | 说明 |
|------|------|
| `users.json` | 用户名称配置 |
| `settings.json` | 假期、学科、考试设置 |
| `templates.json` | 日程模板 |
| `todos.json` | 双人待办事项 |
| `days/*.json` | 每日日程和任务数据 |

首次运行时会自动生成默认数据。

## 部署

### 方式一：GitHub Actions 自动构建（推荐）

项目配置了 GitHub Actions 自动编译 standalone 版本，服务器只需拉取构建产物即可运行。

**首次部署：**

```bash
# 下载部署脚本
mkdir -p /opt/firetime-deploy && cd /opt/firetime-deploy
curl -fsSL -o deploy.sh https://raw.githubusercontent.com/lieyanc/FireTime/master/scripts/deploy.sh
chmod +x deploy.sh

# 运行配置向导
./deploy.sh
```

> 💡 中国大陆用户使用加速地址：
> ```bash
> curl -fsSL -o deploy.sh https://gh-proxy.org/https://raw.githubusercontent.com/lieyanc/FireTime/master/scripts/deploy.sh
> ```

**后续更新：**

```bash
./deploy.sh          # 手动更新
./deploy.sh check    # 检查是否有新版本
./deploy.sh auto     # 静默自动更新（适合 cron/面板）
```

**面板/cron 集成：**

```bash
# 国际
curl -fsSL https://raw.githubusercontent.com/lieyanc/FireTime/master/scripts/bootstrap.sh | bash

# 中国大陆加速
curl -fsSL https://gh-proxy.org/https://raw.githubusercontent.com/lieyanc/FireTime/master/scripts/bootstrap.sh | bash
```

### 方式二：手动构建

```bash
npm install
npm run build
npm run start
```

使用 PM2 保持进程：

```bash
pm2 start npm --name firetime -- start
```

### 方式三：Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

运行时挂载数据目录：

```bash
docker run -v /path/to/data:/app/data -p 3000:3000 firetime
```

### 注意事项

由于使用文件系统存储数据，**不支持部署到 Vercel/Netlify 等 Serverless 平台**（文件系统只读或临时）。如需部署到这些平台，需要将 `lib/store.ts` 改为使用数据库（如 SQLite、PostgreSQL、Redis 等）。

## License

GPL-3.0
