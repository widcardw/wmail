# 共享侧边栏实现说明

## ✅ 问题解决

之前的问题是：当进入 inbox 等子页面时，账户列表侧边栏会消失。

## 🔧 解决方案

创建了一个共享的 `MailboxSidebar` 组件，在所有 mailbox2 相关页面中复用。

## 📁 新增文件

```
frontend/src/components/
└── mailbox-sidebar.tsx  # 共享侧边栏组件
```

## 🎯 组件特性

### MailboxSidebar 组件

**Props**
```typescript
interface MailboxSidebarProps {
  activeFolder?: string  // 当前激活的文件夹 ID（可选）
}
```

**功能**
- ✅ 显示所有账户列表
- ✅ 每个账户可展开/折叠
- ✅ 展开后显示文件夹导航
- ✅ 高亮当前激活的文件夹
- ✅ 自动展开当前路由对应的账户
- ✅ 空状态提示（无账户时）

**自动展开逻辑**
```typescript
// 如果有当前账户ID（从路由参数获取），自动展开该账户
createEffect(() => {
  if (params.id && !expandedAccounts().has(params.id)) {
    const current = new Set(expandedAccounts())
    current.add(params.id)
    setExpandedAccounts(current)
  }
})
```

## 🔄 页面更新

### 更新的页面

| 页面 | 更新内容 |
|------|---------|
| `mailbox2/index.tsx` | 使用 `<MailboxSidebar />` |
| `mailbox2/[id]/inbox.tsx` | 使用 `<MailboxSidebar activeFolder="inbox" />` |
| `mailbox2/[id]/sent.tsx` | 使用 `<MailboxSidebar activeFolder="sent" />` |
| `mailbox2/[id]/drafts.tsx` | 使用 `<MailboxSidebar activeFolder="drafts" />` |
| `mailbox2/[id]/spam.tsx` | 使用 `<MailboxSidebar activeFolder="spam" />` |
| `mailbox2/[id]/trash.tsx` | 使用 `<MailboxSidebar activeFolder="trash" />` |

### 使用示例

```tsx
import MailboxSidebar from '~/components/mailbox-sidebar'

export default function InboxPage() {
  return (
    <div class="flex h-screen">
      {/* 侧边栏始终可见 */}
      <MailboxSidebar activeFolder="inbox" />

      {/* 右侧内容 */}
      <div class="flex-1">
        {/* 邮件列表 */}
      </div>
    </div>
  )
}
```

## 🎨 UI 效果

### 主页面 (`/mailbox2`)
- 左侧：完整的账户和文件夹导航
- 右侧：欢迎信息

### 子页面 (`/mailbox2/:id/inbox`)
- 左侧：完整的账户和文件夹导航（当前账户自动展开，inbox 高亮）
- 右侧：邮件列表

## 📊 状态管理

侧边栏组件内部管理展开状态：

```typescript
const [expandedAccounts, setExpandedAccounts] = createSignal<Set<string>>(new Set())
```

这意味着：
- 每个页面的侧边栏状态是独立的
- 在不同页面之间切换时，展开状态会重置
- 但通过 `createEffect` 自动展开当前账户，体验仍然流畅

## 🚀 优势

1. **代码复用**：侧边栏代码只写一次，在所有页面复用
2. **一致性**：所有页面的侧边栏外观和行为完全一致
3. **易于维护**：修改侧边栏只需改一个文件
4. **用户体验**：侧边栏始终可见，可以快速切换账户和文件夹

## 🔮 未来改进

### 1. 共享展开状态
如果希望在页面间保持展开状态，可以使用全局状态：

```typescript
// stores/mailbox.ts
export const mailboxStore = createStore({
  expandedAccounts: new Set<string>(),
  activeFolder: '',
  // ...
})

// mailbox-sidebar.tsx
const expandedAccounts = () => mailboxStore.expandedAccounts
```

### 2. 添加未读计数
```typescript
const folders = [
  { id: 'inbox', name: 'Inbox', icon: 'ri-inbox-line', path: 'inbox', unread: 5 },
  // ...
]
```

### 3. 添加账户切换下拉菜单
在顶部添加当前账户的下拉选择器。

### 4. 添加快捷键支持
```typescript
onKeyDown={(e) => {
  if (e.key === 'ArrowRight') {
    // 展开/折叠
  }
}}
```

## 📝 总结

通过创建共享的 `MailboxSidebar` 组件，解决了侧边栏在子页面消失的问题。现在：

- ✅ 所有页面共享同一个侧边栏组件
- ✅ 侧边栏在所有页面都可见
- ✅ 当前激活的文件夹会高亮显示
- ✅ 代码更加模块化和易于维护
- ✅ 无代码错误和警告

用户体验得到了显著提升！🎉
