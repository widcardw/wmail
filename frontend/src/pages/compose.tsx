import { ScrollArea, Splitter } from '@ark-ui/solid'
import { Dialog } from '@ark-ui/solid/dialog'
import { Portal } from 'solid-js/web'
import clsx from 'clsx'
import { createSignal, For, Show, onMount, createEffect } from 'solid-js'
import splitterStyles from '~/components/ui/splitter/index.module.css'
import scrollStyles from '~/components/ui/scroll_area/index.module.css'
import dialogStyles from '~/components/ui/dialog/index.module.css'
import fieldStyles from '~/components/ui/fields/field.module.css'
import buttonStyles from '~/components/ui/button/index.module.css'
import { formatDate } from '~/utils/date'
import { NoteService, Note as BackendNote, NoteFolder as BackendNoteFolder } from '#/wmail/services'
import { toaster } from '~/components/ui/toaster'

import { createTiptapEditor } from 'solid-tiptap'
import StarterKit from '@tiptap/starter-kit'
import { TextStyleKit } from '@tiptap/extension-text-style'
import '~/components/ui/editor/editor.scss'
import EditorMenubar from '~/components/ui/editor/menubar'
import { TableKit } from '@tiptap/extension-table'
import { Button } from '~/components/ui/button'
import { Field } from '@ark-ui/solid'

const DEFAULT_FOLDER_NAME = 'Default'

export default function ComposePage() {
  const [noteFolders, setNoteFolders] = createSignal<BackendNoteFolder[]>([])
  const [notes, setNotes] = createSignal<BackendNote[]>([])
  const [currentFolder, setCurrentFolder] = createSignal<string>('')
  const [currentNote, setCurrentNote] = createSignal<BackendNote | null>(null)
  const [editor, setEditor] = createSignal<HTMLElement>()
  const [loading, setLoading] = createSignal(false)

  // Dialog states
  const [folderDialogOpen, setFolderDialogOpen] = createSignal(false)
  const [folderName, setFolderName] = createSignal('')

  const tiptapEditor = createTiptapEditor(() => ({
    element: editor()!,
    extensions: [TextStyleKit, StarterKit, TableKit],
    onUpdate: ({ editor }) => {
      if (currentNote()) {
        saveCurrentNote(editor.getJSON())
      }
    },
  }))

  // Load folders on mount
  onMount(async () => {
    await loadFolders()
    // Set default folder
    if (noteFolders().find(f => f.name === DEFAULT_FOLDER_NAME)) {
      setCurrentFolder(DEFAULT_FOLDER_NAME)
    } else if (noteFolders().length > 0) {
      setCurrentFolder(noteFolders()[0].name)
    }
  })

  // Load notes when folder changes
  createEffect(async () => {
    const folder = currentFolder()
    if (folder) {
      await loadNotes(folder)
    }
  })

  async function loadFolders() {
    setLoading(true)
    try {
      const folders = await NoteService.GetFolders()
      setNoteFolders(folders)
    } catch (error) {
      console.error('Failed to load folders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadNotes(folder: string) {
    setLoading(true)
    try {
      const noteList = await NoteService.GetNotes(folder)
      setNotes(noteList)
      if (currentNote()?.folder !== folder) {
        setCurrentNote(null)
        tiptapEditor()?.commands.clearContent()
      }
    } catch (error) {
      console.error('Failed to load notes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createNote() {
    const newNote: BackendNote = {
      id: '',
      title: 'Untitled',
      content: '{"type":"doc","content":[]}',
      preview: '',
      createdAt: '',
      updatedAt: '',
      folder: currentFolder(),
    }
    try {
      await NoteService.SaveNote(currentFolder(), newNote)
      await loadNotes(currentFolder())
      if (notes().length > 0) {
        selectNote(notes()[0])
      }
    } catch (error) {
      console.error('Failed to create note:', error)
      toaster.error({
        title: 'Failed to create note',
        description: String(error),
      })
    }
  }

  function openCreateFolderDialog() {
    setFolderName('')
    setFolderDialogOpen(true)
  }

  async function handleCreateFolder() {
    const name = folderName().trim()
    if (!name) {
      toaster.error({ title: 'Folder name cannot be empty' })
      return
    }

    try {
      await NoteService.CreateFolder(name)
      await loadFolders()
      setFolderDialogOpen(false)
      setFolderName('')
      setCurrentFolder(name)
      toaster.success({ title: `Folder "${name}" created successfully` })
    } catch (error) {
      console.error('Failed to create folder:', error)
      toaster.error({
        title: 'Failed to create folder',
        description: String(error),
      })
    }
  }

  async function deleteFolder(name: string) {
    try {
      await NoteService.DeleteFolder(name)
      await loadFolders()
      if (currentFolder() === name) {
        setCurrentFolder('')
        setNotes([])
      }
      toaster.success({ title: `Folder "${name}" deleted` })
    } catch (error) {
      console.error('Failed to delete folder:', error)
      toaster.error({
        title: 'Failed to delete folder',
        description: String(error),
      })
    }
  }

  function selectNote(note: BackendNote) {
    setCurrentNote(note)
    if (note.content) {
      try {
        const content = JSON.parse(note.content)
        tiptapEditor()?.commands.setContent(content)
      } catch (error) {
        console.error('Failed to parse note content:', error)
      }
    }
  }

  async function saveCurrentNote(content: any) {
    const note = currentNote()
    if (!note) return

    try {
      note.content = JSON.stringify(content)
      await NoteService.SaveNote(currentFolder(), note)
      await loadNotes(currentFolder())
    } catch (error) {
      console.error('Failed to save note:', error)
    }
  }

  return (
    <>
    <Splitter.Root
      class={clsx(splitterStyles.Root, 'flex h-screen')}
      panels={[
        { id: 'f', minSize: 10 },
        { id: 'n', minSize: 10 },
        { id: 'c', minSize: 20 },
      ]}
      defaultSize={[15, 15, 70]}
    >
      <Splitter.Panel id="f" class={clsx(splitterStyles.Panel, 'w-full')}>
        <div
          class="h-3rem p-4 font-700 flex justify-between items-center"
          style={{ 'border-bottom': '1px solid var(--color-border)' }}
        >
          <span>Folders</span>{' '}
          <Button size="icon" variant="ghost" onClick={openCreateFolderDialog}>
            <div class="i-ri-folder-add-line w-4 h-4" />
          </Button>
        </div>
        <ScrollArea.Root
          class={clsx(scrollStyles.Root, 'w-full')}
          style={{ height: 'calc(100% - 40px - 3rem)' }}
        >
          <ScrollArea.Viewport class={scrollStyles.Viewport}>
            <ScrollArea.Content class={clsx(scrollStyles.Content, 'p-2 h-full')}>
              <div class="flex flex-col gap-2">
                <Show when={loading()}>
                  <div class="text-center text-sm text-muted-foreground">Loading...</div>
                </Show>
                <For each={noteFolders()}>
                  {(f) => (
                    <div
                      class={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer ${
                        currentFolder() === f.name ? 'bg-primary-hvbg' : ''
                      }`}
                      onClick={() => setCurrentFolder(f.name)}
                    >
                      <span class="truncate flex-1">{f.name}</span>
                      <div class="flex items-center gap-2">
                        <Show when={f.name !== DEFAULT_FOLDER_NAME}>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e: any) => {
                              e.stopPropagation()
                              deleteFolder(f.name)
                            }}
                          >
                            <div class="i-ri-delete-bin-line w-4 h-4" />
                          </Button>
                        </Show>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar class={scrollStyles.Scrollbar}>
            <ScrollArea.Thumb class={scrollStyles.Thumb} />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner class={scrollStyles.Corner} />
        </ScrollArea.Root>
      </Splitter.Panel>

      <Splitter.ResizeTrigger class={splitterStyles.ResizeTrigger} id="f:n" aria-label="Resize">
        <Splitter.ResizeTriggerIndicator class={splitterStyles.ResizeTriggerIndicator} />
      </Splitter.ResizeTrigger>

      <Splitter.Panel id="n" class={clsx(splitterStyles.Panel, 'w-full')}>
        <div
          class="h-3rem p-4 font-700 flex justify-between items-center"
          style={{ 'border-bottom': '1px solid var(--color-border)' }}
        >
          <span>Notes</span>{' '}
          <Button size="icon" variant="ghost" onClick={createNote}>
            <div class="i-ri-edit-box-line w-4 h-4" />
          </Button>
        </div>
        <ScrollArea.Root
          class={clsx(scrollStyles.Root, 'w-full')}
          style={{ height: 'calc(100% - 40px - 3rem)' }}
        >
          <ScrollArea.Viewport class={scrollStyles.Viewport}>
            <ScrollArea.Content class={clsx(scrollStyles.Content, 'h-full')}>
              <div class="flex flex-col gap-2">
                <Show when={!currentFolder()}>
                  <div class="text-center text-sm text-muted-foreground">Select a folder</div>
                </Show>
                <Show when={notes().length === 0 && currentFolder()}>
                  <div class="text-center text-sm text-muted-foreground">No notes yet. Create one!</div>
                </Show>
                <For each={notes()}>
                  {(note) => (
                    <div
                      class={clsx('p-4 space-y-1 cursor-pointer', currentNote()?.id === note.id && 'bg-primary-hvbg')}
                      style={{ 'border-bottom': '1px solid var(--color-border)' }}
                      onClick={() => selectNote(note)}
                    >
                      <div class="flex justify-between items-center">
                        <span class="font-700 truncate">{note.title}</span>
                        <span class="text-sm text-mut-foreground whitespace-nowrap">{formatDate(note.updatedAt)}</span>
                      </div>
                      <div
                        class={clsx(
                          'text-sm text-mut-foreground leading-tight',
                          'h-2rem of-y-hidden w-full whitespace-break-spaces break-all',
                        )}
                      >
                        {note.preview || 'No content'}
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar class={scrollStyles.Scrollbar}>
            <ScrollArea.Thumb class={scrollStyles.Thumb} />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner class={scrollStyles.Corner} />
        </ScrollArea.Root>
      </Splitter.Panel>

      <Splitter.ResizeTrigger class={splitterStyles.ResizeTrigger} id="n:c" aria-label="Resize">
        <Splitter.ResizeTriggerIndicator class={splitterStyles.ResizeTriggerIndicator} />
      </Splitter.ResizeTrigger>

      <Splitter.Panel id="c" class={clsx(splitterStyles.Panel, 'w-full flex flex-col')}>
        <Show when={currentNote()}>
          <EditorMenubar editor={tiptapEditor()} />
          <div class="text-text bg-bg flex-1 editor-parent" ref={(el) => setEditor(el)} />
        </Show>
        <Show when={!currentNote()}>
          <div class="flex items-center justify-center h-full text-muted-foreground">
            Select a note to edit
          </div>
        </Show>
      </Splitter.Panel>
    </Splitter.Root>

    <Dialog.Root
      open={folderDialogOpen()}
      onOpenChange={(e) => setFolderDialogOpen(e.open)}
      closeOnInteractOutside={false}
    >
      <Portal>
        <Dialog.Backdrop class={dialogStyles.Backdrop} />
        <Dialog.Positioner class={dialogStyles.Positioner}>
          <Dialog.Content class={dialogStyles.Content}>
            <Dialog.CloseTrigger class={dialogStyles.CloseTrigger}>
              <div class="i-ri-close-large-fill w-4 h-4" />
            </Dialog.CloseTrigger>
            <Dialog.Title class={dialogStyles.Title}>Create New Folder</Dialog.Title>
            <div class={clsx(dialogStyles.ScrollContainer, 'w-full')}>
              <Field.Root class={fieldStyles.Root}>
                <Field.Label class={fieldStyles.Label}>Folder Name</Field.Label>
                <Field.Input
                  class={fieldStyles.Input}
                  placeholder="Enter folder name"
                  value={folderName()}
                  onInput={(e) => setFolderName(e.target.value)}
                />
              </Field.Root>
            </div>
            <div class={dialogStyles.Actions}>
              <Dialog.CloseTrigger
                class={buttonStyles.Root}
                data-variant="outline"
              >
                Cancel
              </Dialog.CloseTrigger>
              <Dialog.CloseTrigger
                class={buttonStyles.Root}
                data-variant="solid"
                onClick={handleCreateFolder}
              >
              Create
            </Dialog.CloseTrigger>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  </Dialog.Root>
  </>
  )
}
