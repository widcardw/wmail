# w-mail 快速启动指南

## 🚀 快速开始

### 1. 安装依赖

```bash
# Go 依赖
go get github.com/emersion/go-imap
go get github.com/emersion/go-message
go get github.com/google/uuid

# 前端依赖
cd frontend
pnpm install
cd ..
```

### 2. 启动开发服务器

```bash
wails dev
```

### 3. 添加你的第一个邮箱账户

应用启动后，会自动跳转到账户管理页面：

#### Gmail 设置示例：
- **账户名称**：`我的 Gmail`
- **邮箱地址**：`yourname@gmail.com`
- **用户名**：`yourname@gmail.com`
- **密码**：[获取 Gmail 应用专用密码](https://support.google.com/accounts/answer/185833)
- **IMAP**：`imap.gmail.com:993` ✓ SSL
- **SMTP**：`smtp.gmail.com:465` ✓ SSL

#### QQ 邮箱设置示例：
- **账户名称**：`QQ 邮箱`
- **邮箱地址**：`yourqq@qq.com`
- **用户名**：`yourqq@qq.com`
- **密码**：[在 QQ 邮箱设置中获取授权码](https://service.mail.qq.com/cgi-bin/help?subtype=1&id=28)
- **IMAP**：`imap.qq.com:993` ✓ SSL
- **SMTP**：`smtp.qq.com:465` ✓ SSL

### 4. 开始使用

添加账户后，即可：
- 浏览收件箱中的邮件
- 查看不同文件夹（已发送、草稿等）
- 撰写新邮件

## 📁 项目结构

```
w-mail/
├── services/
│   ├── mailaccountservice.go  # 账户管理
│   ├── mailservice.go         # 邮件收发
│   └── utils.go               # 工具函数
├── frontend/
│   └── src/
│       ├── components/       # UI 组件
│       ├── pages/            # 页面
│       │   ├── accounts.tsx  # 账户管理页
│       │   ├── mailbox.tsx   # 邮箱页
│       │   └── compose.tsx   # 撰写页
│       └── stores/           # 状态管理
└── main.go                   # 应用入口
```

## 🎨 主要功能

| 功能 | 状态 |
|------|------|
| 多账户管理 | ✅ |
| IMAP 邮件接收 | ✅ |
| 邮箱文件夹浏览 | ✅ |
| 邮件列表查看 | ✅ |
| 邮件撰写界面 | ✅ |
| SMTP 邮件发送 | ⏳ 开发中 |
| 邮件搜索 | ⏳ 计划中 |
| 附件支持 | ⏳ 计划中 |
| 本地存储 | ⏳ 计划中 |

## 🔧 技术栈

- **后端**：Go + Wails v3 + go-imap
- **前端**：SolidJS + Ark UI + UnoCSS
- **样式**：暗色主题，现代化设计

## 📝 注意事项

1. **密码安全**：当前版本密码存储在本地配置文件中，建议使用应用专用密码
2. **网络连接**：需要网络连接才能收发邮件
3. **Gmail 用户**：必须使用应用专用密码，不能使用主密码
4. **QQ/163 邮箱**：需要在网页版邮箱设置中开启 IMAP/SMTP 服务

## 🐛 遇到问题？

- **连接失败**：检查服务器地址、端口和 SSL 设置
- **认证失败**：确认用户名和密码（或授权码）正确
- **无法加载邮件**：检查网络连接和服务器状态

详细文档请查看 [USAGE.md](./USAGE.md)
