# Mailbox2 路由结构说明

## 📁 目录结构

```
src/pages/mailbox2/
├── index.tsx              # 主页面（账户列表）
└── [id]/                  # 动态路由：账户ID
    ├── inbox.tsx          # 收件箱
    ├── sent.tsx           # 已发送
    ├── drafts.tsx         # 草稿箱
    ├── spam.tsx           # 垃圾邮件
    └── trash.tsx          # 已删除
```

## 🚀 路由映射

根据 `vite-plugin-pages` 的约定，文件会自动映射为路由：

| 文件路径 | URL 路由 | 说明 |
|---------|-----------|------|
| `mailbox2/index.tsx` | `/mailbox2` | 主页面，显示所有账户列表 |
| `mailbox2/[id]/inbox.tsx` | `/mailbox2/:id/inbox` | 指定账户的收件箱 |
| `mailbox2/[id]/sent.tsx` | `/mailbox2/:id/sent` | 指定账户的已发送 |
| `mailbox2/[id]/drafts.tsx` | `/mailbox2/:id/drafts` | 指定账户的草稿箱 |
| `mailbox2/[id]/spam.tsx` | `/mailbox2/:id/spam` | 指定账户的垃圾邮件 |
| `mailbox2/[id]/trash.tsx` | `/mailbox2/:id/trash` | 指定账户的已删除 |

## 🎯 功能说明

### `/mailbox2` - 主页面
- 显示所有已配置的邮件账户
- 每个账户可以展开/折叠
- 展开后显示文件夹列表（Inbox、Sent、Drafts、Spam、Trash）
- 点击文件夹链接跳转到对应页面

### `/mailbox2/:id/inbox` - 收件箱
- 显示指定账户的收件箱邮件列表
- 支持刷新功能
- 显示邮件发送者、主题、预览、时间

### 其他文件夹页面
- 目前为占位页面，显示 "Coming soon"
- 可以按照相同模式实现完整功能

## 📝 实现细节

### 账户展开/折叠
使用 `Set<string>` 来跟踪展开的账户ID：

```typescript
const [expandedAccounts, setExpandedAccounts] = createSignal<Set<string>>(new Set())

const toggleAccount = (accountId: string) => {
  const current = new Set(expandedAccounts())
  if (current.has(accountId)) {
    current.delete(accountId)
  } else {
    current.add(accountId)
  }
  setExpandedAccounts(current)
}
```

### 获取动态路由参数
使用 Solid Router 的 `useParams` hook：

```typescript
const params = useParams()
const accountId = () => params.id
```

### 导航链接
使用 `@solidjs/router` 的 `A` 组件：

```typescript
<A href={`/mailbox2/${account.id}/inbox`}>
  Inbox
</A>
```

## 🔧 vite-plugin-pages 配置

当前 `vite.config.ts` 配置：

```typescript
Pages({
  dirs: ['src/pages'],
})
```

这会自动扫描 `src/pages` 目录并生成路由。

### 路由命名约定
- `index.tsx` → `/`
- `[id].tsx` → `/:id` (动态参数)
- `folder/index.tsx` → `/folder`
- `folder/[id].tsx` → `/folder/:id`

## 🎨 UI 设计

### 左侧边栏（264px）
- 深色背景 (`bg-surface`)
- 边框分隔 (`border-r border-border`)
- 账户列表可滚动

### 右侧内容区
- 占据剩余空间 (`flex-1`)
- 默认显示欢迎信息
- 选择文件夹后显示对应内容

### 响应式
- 暂未实现移动端适配
- 固定宽度侧边栏

## 🚀 未来扩展

### 添加更多文件夹
在 `mailbox2/index.tsx` 中添加：

```typescript
const folders = [
  // ... existing folders
  { id: 'starred', name: 'Starred', icon: 'ri-star-line', path: 'starred' },
  { id: 'important', name: 'Important', icon: 'ri-flag-line', path: 'important' },
]
```

然后创建对应的页面文件。

### 添加邮件详情页
创建 `mailbox2/[id]/inbox/[uid].tsx`：

```typescript
const params = useParams()
const accountId = () => params.id
const emailUid = () => params.uid
```

### 添加子路由导航
在每个文件夹页面中添加子文件夹导航：

```typescript
const subFolders = ['Personal', 'Work', 'Projects']

<For each={subFolders}>
  {folder => (
    <A href={`/mailbox2/${accountId()}/inbox/${folder}`}>
      {folder}
    </A>
  )}
</For>
```

## 📖 参考资料

- [vite-plugin-pages 文档](https://github.com/hannoeru/vite-plugin-pages)
- [Solid Router 文档](https://www.solidjs.com/docs/latest/api-reference/router)
