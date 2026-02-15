# w-mail

一个基于 Wails v3 和 SolidJS 构建的现代化桌面邮件客户端应用。

![w-mail](https://img.shields.io/badge/wails-v3-blue)
![solidjs](https://img.shields.io/badge/solidjs-1.9-blue)
![go](https://img.shields.io/badge/go-1.25+-blue)

## ✨ 功能特性

### 已实现
- ✅ 多账户管理（支持添加、编辑、删除）
- ✅ IMAP 邮件接收
- ✅ 邮箱文件夹管理（收件箱、已发送、草稿等）
- ✅ 邮件列表浏览
- ✅ 现代化暗色主题 UI
- ✅ 响应式设计

### 计划中
- ⏳ SMTP 邮件发送
- ⏳ 邮件阅读界面
- ⏳ 邮件搜索和过滤
- ⏳ 标签和星标管理
- ⏳ 附件处理
- ⏳ 本地数据库存储

## 🚀 快速开始

### 前置要求

- Go 1.25+
- Node.js 18+
- pnpm

### 安装依赖

```bash
# 安装 Go 依赖
go get github.com/emersion/go-imap
go get github.com/emersion/go-message
go get github.com/google/uuid

# 安装前端依赖
cd frontend
pnpm install
cd ..
```

### 开发模式

```bash
wails dev
```

### 构建应用

```bash
wails build
```

## 📖 使用指南

### 添加账户

1. 点击侧边栏的账户图标
2. 点击 "Add Account" 按钮
3. 填写账户信息：
   - **Gmail**: `imap.gmail.com:993` / `smtp.gmail.com:465`
   - **Outlook**: `outlook.office365.com:993` / `smtp.office365.com:587`
   - **QQ**: `imap.qq.com:993` / `smtp.qq.com:465`
   - **163**: `imap.163.com:993` / `smtp.163.com:465`

⚠️ **注意**：Gmail 用户必须使用[应用专用密码](https://support.google.com/accounts/answer/185833)

详细配置说明请查看 [QUICKSTART.md](./QUICKSTART.md)

## 🏗️ 项目结构

```
w-mail/
├── services/              # Go 后端服务
│   ├── mailaccountservice.go  # 账户管理
│   ├── mailservice.go         # 邮件服务
│   └── utils.go               # 工具函数
├── frontend/              # SolidJS 前端
│   ├── src/
│   │   ├── components/        # UI 组件
│   │   ├── pages/             # 页面组件
│   │   ├── stores/            # 状态管理
│   │   └── styles/            # 全局样式
│   └── package.json
├── main.go                # 应用入口
├── go.mod                 # Go 模块配置
├── AGENT.md               # 开发文档
├── USAGE.md               # 使用文档
└── QUICKSTART.md          # 快速开始指南
```

## 🛠️ 技术栈

### 后端
- **Wails v3** - 桌面应用框架
- **go-imap** - IMAP 协议支持
- **go-message** - 邮件消息解析

### 前端
- **SolidJS** - 响应式 UI 框架
- **Ark UI** - 高质量 UI 组件库
- **UnoCSS** - 原子化 CSS 框架
- **Solid Router** - 客户端路由

## 📝 开发文档

- [开发指南](./AGENT.md) - 项目结构和开发规范
- [使用文档](./USAGE.md) - 详细功能说明
- [快速开始](./QUICKSTART.md) - 快速上手指南

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

