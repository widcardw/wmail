# w-mail - 现代邮件客户端

一个基于 Wails v3 + SolidJS 构建的现代化桌面邮件客户端应用。

## 功能特性

### 已实现功能

- ✅ **账户管理** - 添加、编辑、删除邮件账户
- ✅ **IMAP 邮件接收** - 连接到 IMAP 服务器并接收邮件
- ✅ **邮箱文件夹** - 显示和管理邮箱文件夹（收件箱、已发送、草稿等）
- ✅ **邮件列表** - 显示选中文件夹中的邮件列表
- ✅ **现代化 UI** - 基于 UnoCSS 的暗色主题界面
- ✅ **响应式设计** - 适配不同屏幕尺寸

### 计划功能

- ⏳ 邮件阅读界面
- ⏳ 邮件撰写和发送（SMTP）
- ⏳ 邮件搜索和过滤
- ⏳ 标签和星标管理
- ⏳ 附件处理
- ⏳ 本地数据库存储
- ⏳ 通知提醒
- ⏳ 多账户同步

## 技术栈

### 后端（Go）
- **Wails v3** - 桌面应用框架
- **go-imap** - IMAP 协议支持
- **go-message** - 邮件消息解析

### 前端（SolidJS）
- **SolidJS** - 响应式 UI 框架
- **Ark UI** - 高质量 UI 组件库
- **UnoCSS** - 原子化 CSS 框架
- **Solid Router** - 客户端路由

## 项目结构

```
w-mail/
├── services/              # Go 后端服务
│   ├── mailaccountservice.go  # 账户管理服务
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
└── go.mod                 # Go 模块配置
```

## 开发指南

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

## 使用说明

### 添加邮件账户

1. 启动应用后，点击侧边栏的 "账户" 图标
2. 点击 "Add Account" 按钮
3. 填写账户信息：
   - **账户名称**：自定义名称（如 "个人 Gmail"）
   - **邮箱地址**：你的邮箱地址
   - **用户名**：通常与邮箱地址相同
   - **密码**：邮箱密码或应用专用密码
   - **IMAP 设置**：
     - Gmail: `imap.gmail.com:993` (SSL)
     - Outlook: `outlook.office365.com:993` (SSL)
     - QQ: `imap.qq.com:993` (SSL)
   - **SMTP 设置**：
     - Gmail: `smtp.gmail.com:465` (SSL)
     - Outlook: `smtp.office365.com:587` (SSL)
     - QQ: `smtp.qq.com:465` (SSL)

### 接收邮件

1. 点击侧边栏的 "邮箱" 图标
2. 从左侧选择一个文件夹（收件箱、已发送等）
3. 邮件列表会自动加载并显示

### 撰写邮件

1. 点击侧边栏的 "撰写" 图标
2. 填写收件人、主题和正文
3. 点击 "发送" 按钮

## 常见邮件服务器设置

### Gmail
- IMAP 服务器：`imap.gmail.com` 端口 993 (SSL)
- SMTP 服务器：`smtp.gmail.com` 端口 465 (SSL)
- 注意：需要使用应用专用密码（App Password）

### Outlook/Hotmail
- IMAP 服务器：`outlook.office365.com` 端口 993 (SSL)
- SMTP 服务器：`smtp.office365.com` 端口 587 (SSL)

### QQ 邮箱
- IMAP 服务器：`imap.qq.com` 端口 993 (SSL)
- SMTP 服务器：`smtp.qq.com` 端口 465 (SSL)
- 注意：需要在 QQ 邮箱设置中开启 IMAP/SMTP 服务

### 163 邮箱
- IMAP 服务器：`imap.163.com` 端口 993 (SSL)
- SMTP 服务器：`smtp.163.com` 端口 465 (SSL)
- 注意：需要使用授权码而不是密码

## 安全说明

⚠️ **重要提示**：
- 当前版本中密码以明文形式存储在本地配置文件中
- 在生产环境中，应该使用系统密钥链（如 macOS Keychain、Windows DPAPI）或加密存储
- 建议使用应用专用密码而非主密码

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
