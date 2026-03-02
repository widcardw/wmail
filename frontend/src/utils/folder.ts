// @unocss-include

import { Folder } from '#/wmail/services'

const MAPPING = {
  inbox: {
    name: 'Inbox',
    icon: 'i-ri-inbox-2-line',
    path: 'inbox',
    alias: ['inbox', 'receive', '收件箱'],
  },
  sent: {
    name: 'Sent',
    icon: 'i-ri-send-plane-line',
    path: 'sent',
    alias: ['sent', 'send', '已发送', '发件', 'sent messages'],
  },
  drafts: {
    name: 'Drafts',
    icon: 'i-ri-draft-line',
    path: 'drafts',
    alias: ['drafts', 'draft', '草稿', '草稿箱'],
  },
  spam: {
    name: 'Spam',
    icon: 'i-ri-spam-2-line',
    path: 'spam',
    alias: ['spam', 'junk', '垃圾', '垃圾邮件'],
  },
  trash: {
    name: 'Trash',
    icon: 'i-ri-delete-bin-line',
    path: 'trash',
    alias: ['trash', 'deleted', 'deletions', '删除', '已删除', '回收站', 'bin'],
  },
  other: {
    name: '$1',
    icon: 'i-ri-folder-line',
    path: 'other',
    alias: [],
  },
} as const

interface PanelItem {
  name: string
  icon: string
  path: string
  unread: number
  total: number
  children: PanelItem[]
}

/**
 * 计算两个字符串的相似度分数（基于Levenshtein距离）
 * 返回0-1之间的分数，1表示完全匹配
 */
function similarityScore(str1: string, str2: string): number {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()

  if (s1 === s2) return 1

  const len1 = s1.length
  const len2 = s2.length
  const maxLen = Math.max(len1, len2)

  if (maxLen === 0) return 1

  // 计算Levenshtein距离
  const matrix: number[][] = []
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }

  const distance = matrix[len1][len2]
  return 1 - distance / maxLen
}

/**
 * 根据文件夹名称匹配对应的语义类型
 */
function matchFolderType(folderName: string): string {
  const lowerName = folderName.toLowerCase()

  let bestMatch: { type: string; score: number } | null = null

  for (const [type, config] of Object.entries(MAPPING)) {
    if (type === 'other') continue

    // 精确匹配（最高优先级）
    if (lowerName === type) return type

    // 遍历别名计算相似度分数
    for (const alias of config.alias) {
      const lowerAlias = alias.toLowerCase()

      // 精确匹配别名
      if (lowerName === lowerAlias) return type

      // 包含匹配（较长的别名才启用）
      if (alias.length >= 4 && lowerName.includes(lowerAlias)) {
        return type
      }

      // 计算相似度分数
      const score = similarityScore(lowerName, lowerAlias)
      if (score >= 0.7) {
        // 阈值0.7，表示至少70%相似
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { type, score }
        }
      }
    }
  }

  return bestMatch?.type || 'other'
}

/**
 * 将 IMAP 文件夹列表转换为面板项目列表
 * 按语义类型分类：收件箱、已发送、草稿箱、垃圾邮件、已删除、其他
 */
function foldersToPanel(folders: Array<Folder>): PanelItem[] {
  // 按类型分类文件夹
  const categorized: Record<string, Folder[]> = {
    inbox: [],
    sent: [],
    drafts: [],
    spam: [],
    trash: [],
    other: [],
  }

  // 遍历所有文件夹，按语义类型进行分类
  folders.forEach((folder) => {
    const type = matchFolderType(folder.name)
    categorized[type].push(folder)
  })

  // 构建结果
  const result: PanelItem[] = []

  // 定义标准文件夹的显示顺序
  const order: Array<keyof typeof MAPPING> = ['inbox', 'sent', 'drafts', 'spam', 'trash']

  order.forEach((type) => {
    const items = categorized[type]
    if (items.length > 0) {
      items.forEach((item) => {
        const mapping = MAPPING[type]
        result.push({
          name: mapping.name,
          icon: mapping.icon,
          path: mapping.path,
          unread: item.unread,
          total: item.total,
          children: [],
        })
      })
    }
  })

  // 处理 "其他" 文件夹（包含子文件夹）
  const otherFolders = categorized.other
  if (otherFolders.length > 0) {
    // 分离父文件夹和子文件夹（用 "/" 分隔）
    const parentFolders = otherFolders.filter((f) => !f.name.includes('/'))
    const childFolders = otherFolders.filter((f) => f.name.includes('/'))

    // 优先找名为 "其他文件夹" 或 "Other" 的作为父级
    let otherFolder = parentFolders.find(
      (f) => f.name.toLowerCase().includes('其他') || f.name.toLowerCase().includes('other'),
    )

    // 如果没有明确的 "其他文件夹"，取第一个作为代表
    if (!otherFolder && parentFolders.length > 0) {
      otherFolder = parentFolders[0]
    }

    if (otherFolder) {
      const parentName = otherFolder.name
      // 查找属于该父文件夹的子文件夹
      const children = childFolders
        .filter((f) => f.name.startsWith(parentName + '/'))
        .map((f) => ({
          name: f.name.split('/').pop() || f.name,
          icon: 'i-ri-folder-line',
          path: f.name,
          unread: f.unread,
          total: f.total,
          children: [],
        }))

      result.push({
        name: otherFolder.name,
        icon: 'i-ri-folder-line',
        path: otherFolder.name,
        unread: otherFolder.unread,
        total: otherFolder.total,
        children,
      })

      // 处理剩余的独立子文件夹（不属于任何已匹配的父文件夹）
      const processedParents = new Set([parentName])
      parentFolders.forEach((p) => {
        if (!processedParents.has(p.name)) {
          const children2 = childFolders
            .filter((f) => f.name.startsWith(p.name + '/'))
            .map((f) => ({
              name: f.name.split('/').pop() || f.name,
              icon: 'i-ri-folder-line',
              path: f.name,
              unread: f.unread,
              total: f.total,
              children: [],
            }))

          result.push({
            name: p.name,
            icon: 'i-ri-folder-line',
            path: p.name,
            unread: p.unread,
            total: p.total,
            children: children2,
          })
        }
      })
    }
  }

  console.log('result', result)
  return result
}

export { MAPPING, type PanelItem, foldersToPanel }
