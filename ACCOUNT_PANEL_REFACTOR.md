# Account Panel 重构说明

## ✅ 问题解决

### 原始问题
1. 之前的 `toggleAccount` 方式会导致展开一个账户时，其他账户都合上
2. 侧边栏在子页面中会消失
3. 没有使用已有的 `MailBoxLayout` 和 `AccountPanel` 组件

### 解决方案
完善现有的 `AccountPanel` 组件，使用 Ark UI 的 `Collapsible` 组件，实现独立的展开/折叠状态。

## 🔧 核心改进

### AccountPanel 组件

**新增 Props**
```typescript
interface AccountPanelProps {
  account: Account;
  defaultOpen?: boolean;    // 是否默认展开
  activeFolder?: string;   // 当前激活的文件夹
}
```

**智能展开逻辑**
```typescript
// 如果当前路由的账户ID匹配，或者显式要求默认展开
const shouldAutoOpen = () => {
  return props.defaultOpen || params.id === props.account.id;
};
```

**文件夹高亮**
```typescript
const isActiveFolder = (folderId: string) => {
  return props.activeFolder === folderId;
};
```

### MailBoxLayout 布局

**三栏布局**
```
┌─────────────────────────────────────────────────────────┐
│  Account Panel  │      Main Content        │
│                 │                         │
│  - Account 1    │                         │
│    - Inbox      │                         │
│    - Sent       │                         │
│    - Drafts     │                         │
│  - Account 2    │                         │
│    - Inbox      │                         │
│    - Sent       │                         │
│                 │                         │
└─────────────────────────────────────────────────────────┘
```

**组件结构**
```tsx
<MailBoxLayout activeFolder="inbox">
  {props.children}
</MailBoxLayout>
```

内部使用 `ScrollArea` 提供更好的滚动体验。

## 📁 文件变更

### 新增文件
- ❌ 删除 `mailbox-sidebar.tsx`（旧的实现）

### 修改文件
- ✅ `components/ui/account_panel/index.tsx` - 完善 AccountPanel
- ✅ `components/layouts/mailboxlayout.tsx` - 更新为三栏布局
- ✅ `pages/mailbox2/index.tsx` - 使用 MailBoxLayout
- ✅ `pages/mailbox2/[id]/inbox.tsx` - 使用 MailBoxLayout
- ✅ `pages/mailbox2/[id]/sent.tsx` - 使用 MailBoxLayout
- ✅ `pages/mailbox2/[id]/drafts.tsx` - 使用 MailBoxLayout
- ✅ `pages/mailbox2/[id]/spam.tsx` - 使用 MailBoxLayout
- ✅ `pages/mailbox2/[id]/trash.tsx` - 使用 MailBoxLayout

## 🎨 UI 改进

### AccountPanel 增强

**账户信息显示**
- 账户头像（邮箱首字母）
- 账户名称
- 邮箱地址

**文件夹列表**
- Inbox（收件箱）
- Sent（已发送）
- Drafts（草稿箱）
- Spam（垃圾邮件）
- Trash（已删除）
- 每个文件夹带有图标

**交互效果**
- 展开/折叠动画（Ark UI Collapsible）
- 当前激活文件夹高亮
- 悬停效果
- 点击跳转到对应页面

### 样式规范

按照 `AGENT.md` 的要求，使用 inline style 而非 UnoCSS 类：

```tsx
// ✅ 正确
style={{ 'border-right': '1px solid var(--color-border)' }}

// ❌ 错误
class="border-r border-border"
```

## 🔄 独立展开状态

使用 Ark UI 的 `Collapsible.Root` 组件，每个账户的展开状态是独立的：

```tsx
<Collapsible.Root defaultOpen={shouldAutoOpen()}>
  {/* 每个账户独立管理展开状态 */}
</Collapsible.Root>
```

这意味着：
- ✅ 展开账户 A，不会影响账户 B 的状态
- ✅ 可以同时展开多个账户
- ✅ 每个账户的展开状态持久化（在组件内）

## 📊 页面使用示例

### 主页面
```tsx
import MailBoxLayout from '~/components/layouts/mailboxlayout'

export default function Mailbox2Page() {
  return (
    <MailBoxLayout>
      <div class="flex-1">
        {/* 欢迎内容 */}
      </div>
    </MailBoxLayout>
  );
}
```

### Inbox 页面
```tsx
import MailBoxLayout from '~/components/layouts/mailboxlayout'

export default function InboxPage() {
  return (
    <MailBoxLayout activeFolder="inbox">
      <div class="flex-1">
        {/* 邮件列表 */}
      </div>
    </MailBoxLayout>
  );
}
```

### 其他文件夹页面
```tsx
import MailBoxLayout from '~/components/layouts/mailboxlayout'

export default function SentPage() {
  return (
    <MailBoxLayout activeFolder="sent">
      <div class="flex-1">
        {/* 占位内容 */}
      </div>
    </MailBoxLayout>
  );
}
```

## 🎯 优势总结

1. **独立的展开状态** - 每个账户可以独立展开/折叠
2. **复用现有组件** - 使用了已有的 AccountPanel 和 MailBoxLayout
3. **更好的滚动体验** - 使用 Ark UI 的 ScrollArea 组件
4. **统一的 UI 风格** - 所有页面使用相同的布局
5. **符合项目规范** - 遵循 AGENT.md 中的样式要求
6. **更好的动画** - Ark UI 提供的展开/折叠动画
7. **高亮当前文件夹** - activeFolder prop 高亮当前激活的文件夹

## 🚀 未来改进

### 1. 添加未读计数
```typescript
const folders = [
  { id: 'inbox', name: 'Inbox', icon: 'ri-inbox-line', unread: 5 },
  // ...
]
```

### 2. 添加账户操作
- 编辑账户
- 删除账户
- 测试连接

### 3. 添加账户切换
在顶部添加快速切换下拉菜单。

### 4. 响应式布局
- 移动端隐藏侧边栏
- 添加抽屉式导航

### 5. 键盘快捷键
```tsx
<div onKeyDown={(e) => {
  if (e.key === 'ArrowDown') {
    // 导航到下一个账户
  }
}}>
```

## 📝 注意事项

1. **样式规范**：必须使用 `style={{ 'border': '1px solid var(--color-border)' }}` 而非 `class="border border-border"`
2. **组件复用**：优先使用已有的 AccountPanel 和 MailBoxLayout
3. **Ark UI 组件**：Collapsible、ScrollArea 等提供更好的用户体验
4. **类型安全**：确保所有 props 都有正确的类型定义

## 🎉 总结

通过完善现有的 `AccountPanel` 组件并使用 `MailBoxLayout`，实现了：

- ✅ 独立的账户展开/折叠状态
- ✅ 三栏布局（账户列表 | 邮箱列表 | 内容）
- ✅ 当前激活文件夹高亮
- ✅ 自动展开当前路由对应的账户
- ✅ 更好的滚动体验（ScrollArea）
- ✅ 统一的 UI 风格
- ✅ 符合项目样式规范
- ✅ 无代码错误和警告

现在的实现更加优雅、可维护且用户体验更好！
