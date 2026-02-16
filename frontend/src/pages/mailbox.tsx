// import { For, Show, createSignal, onMount } from 'solid-js'
// import { mailStore } from '~/stores/mail'
// import { MailService } from '#/wmail/services'
// import AccountSwitcher from '~/components/ui/account-switcher'

// export default function MailboxPage() {
//   const [folders, setFolders] = createSignal<any[]>([])
//   const [emails, setEmails] = createSignal<any[]>([])
//   const [loading, setLoading] = createSignal(false)
//   const [selectedFolder, setSelectedFolder] = createSignal('INBOX')

//   onMount(async () => {
//     if (mailStore.state.currentAccount) {
//       await loadFolders()
//       await loadEmails()
//     }
//   })

//   const loadFolders = async () => {
//     if (!mailStore.state.currentAccount) return

//     setLoading(true)
//     try {
//       const result = await MailService.GetFolders(mailStore.state.currentAccount.id)
//       setFolders(result)
//     } catch (error) {
//       console.error('Failed to load folders:', error)
//     }
//     setLoading(false)
//   }

//   const loadEmails = async () => {
//     if (!mailStore.state.currentAccount || !selectedFolder()) return

//     setLoading(true)
//     try {
//       const result = await MailService.GetEmails(
//         mailStore.state.currentAccount.id,
//         selectedFolder(),
//         1,
//         50,
//       )
//       setEmails(result)
//     } catch (error) {
//       console.error('Failed to load emails:', error)
//     }
//     setLoading(false)
//   }

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString)
//     const now = new Date()
//     const diff = now.getTime() - date.getTime()
//     const days = Math.floor(diff / (1000 * 60 * 60 * 24))

//     if (days === 0) {
//       return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
//     } else if (days < 7) {
//       return date.toLocaleDateString('en-US', { weekday: 'short' })
//     } else {
//       return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
//     }
//   }

//   return (
//     <div class="flex h-screen">
//       {/* Sidebar - Folders */}
//       <div class="w-64 border-r border-border bg-surface flex flex-col">
//         <div class="p-4 border-b border-border">
//           <AccountSwitcher />
//         </div>
//         <div class="p-4 border-b border-border">
//           <h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
//             Folders
//           </h2>
//         </div>
//         <div class="p-2 flex-1 overflow-y-auto">
//           <Show
//             when={loading()}
//             fallback={
//               <For each={folders()}>
//                 {(folder) => (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setSelectedFolder(folder.name)
//                       loadEmails()
//                     }}
//                     class={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
//                       selectedFolder() === folder.name
//                         ? 'bg-primary/10 text-primary'
//                         : 'text-muted-foreground hover:text-white hover:bg-surface'
//                     }`}
//                   >
//                     <div class="flex items-center gap-3">
//                       <div class={`i-ri-${getFolderIcon(folder.name)} w-5 h-5`} />
//                       <span class="truncate">{folder.name}</span>
//                     </div>
//                     <Show when={folder.unread > 0}>
//                       <span class="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
//                         {folder.unread}
//                       </span>
//                     </Show>
//                   </button>
//                 )}
//               </For>
//             }
//           >
//             <div class="text-center py-4">
//               <div class="i-ri-loader-4-line w-6 h-6 animate-spin text-primary mx-auto" />
//             </div>
//           </Show>
//         </div>
//       </div>

//       {/* Main Content - Email List */}
//       <div class="flex-1 flex flex-col">
//         <div class="p-4 border-b border-border bg-surface flex items-center justify-between">
//           <h1 class="text-xl font-bold text-white">{selectedFolder()}</h1>
//           <button
//             type="button"
//             class="p-2 text-muted-foreground hover:text-white hover:bg-surface rounded transition-colors"
//             onClick={() => loadEmails()}
//             title="Refresh"
//           >
//             <div class="i-ri-refresh-line w-5 h-5" />
//           </button>
//         </div>

//         <Show
//           when={emails().length > 0}
//           fallback={
//             <div class="flex-1 flex items-center justify-center">
//               <div class="text-center">
//                 <div class="i-ri-mail-line w-16 h-16 text-muted-foreground mx-auto mb-4" />
//                 <p class="text-muted-foreground">No emails in this folder</p>
//               </div>
//             </div>
//           }
//         >
//           <div class="flex-1 overflow-y-auto">
//             <For each={emails()}>
//               {(email) => (
//                 <div class="px-6 py-4 border-b border-border hover:bg-surface transition-colors cursor-pointer">
//                   <div class="flex items-start gap-4">
//                     <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
//                       <span class="text-primary font-semibold">
//                         {email.from.charAt(0).toUpperCase()}
//                       </span>
//                     </div>
//                     <div class="flex-1 min-w-0">
//                       <div class="flex items-center justify-between mb-1">
//                         <span
//                           class={`font-semibold truncate ${!email.isRead ? 'text-white' : 'text-muted-foreground'}`}
//                         >
//                           {email.from}
//                         </span>
//                         <span class="text-sm text-muted-foreground shrink-0 ml-2">
//                           {formatDate(email.date)}
//                         </span>
//                       </div>
//                       <h3
//                         class={`text-sm truncate mb-1 ${!email.isRead ? 'text-white' : 'text-muted-foreground'}`}
//                       >
//                         {email.subject}
//                       </h3>
//                       <p class="text-sm text-muted-foreground truncate">{email.body}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </For>
//           </div>
//         </Show>
//       </div>
//     </div>
//   )
// }

// function getFolderIcon(folderName: string): string {
//   const name = folderName.toUpperCase()
//   if (name.includes('INBOX')) return 'inbox-line'
//   if (name.includes('SENT')) return 'send-plane-line'
//   if (name.includes('DRAFT')) return 'file-text-line'
//   if (name.includes('TRASH') || name.includes('DELETED')) return 'delete-bin-line'
//   if (name.includes('SPAM') || name.includes('JUNK')) return 'spam-line'
//   if (name.includes('STAR') || name.includes('IMPORTANT')) return 'star-line'
//   return 'folder-line'
// }
