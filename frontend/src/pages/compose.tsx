import { ScrollArea, Splitter } from '@ark-ui/solid'
import clsx from 'clsx';
import { createSignal, For, onMount } from 'solid-js'
import splitterStyles from "~/components/ui/splitter/index.module.css";
import scrollStyles from "~/components/ui/scroll_area/index.module.css";
import { formatDate } from '~/utils/date';

import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import '~/components/ui/editor/editor.css'

interface Note {
  title: string
  content: string
  createAt: string
  updateAt: string
}

interface NoteFolder {
  name: string
  notes: Note[]
}

export default function ComposePage() {

  const [noteFolders, setNoteFolders] = createSignal<NoteFolder[]>([])

  const [currentFolder, setCurrentFolder] = createSignal<NoteFolder | null>()

  const [currentNote, setCurrentNote] = createSignal<Note | null>(null)

  const [editor, setEditor] = createSignal<HTMLElement>()

  let quillEditor: Quill | null = null

  onMount(() => {
    quillEditor = new Quill(editor()!, {
      debug: 'info',
      modules: {
        toolbar: true,
      },
      placeholder: 'Compose an epic...',
      theme: 'snow',
    })
  })

  return (
    <Splitter.Root class={clsx(splitterStyles.Root, "flex h-screen")} panels={[{ id: 'f', minSize: 10 }, { id: 'n', minSize: 10 }, { id: 'c', minSize: 20 }]} defaultSize={[15, 15, 70]}>
      <Splitter.Panel id="f" class={clsx(splitterStyles.Panel, "w-full")}>
        <div class="h-3rem p-4 font-700 flex items-center" style={{ 'border-bottom': '1px solid var(--color-border)' }}>Folders</div>
        <ScrollArea.Root class={clsx(scrollStyles.Root, "w-full")} style={{ 'height': 'calc(100% - 40px - 3rem)' }}>
          <ScrollArea.Viewport class={scrollStyles.Viewport}>
            <ScrollArea.Content
              class={clsx(scrollStyles.Content, "p-2 h-full")}
            >
              <div class="flex flex-col gap-2">
                <For each={noteFolders()}>
                  {(f) => (
                    <div class="flex items-center justify-between">
                      <span class="truncate">{f.name}</span>
                      <span class="w-3rem text-right text-mut-fg">{f.notes.length}</span>
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

      <Splitter.ResizeTrigger 
        class={splitterStyles.ResizeTrigger} 
        id="f:n" 
        aria-label="Resize">
        <Splitter.ResizeTriggerIndicator
          class={splitterStyles.ResizeTriggerIndicator}
        />
      </Splitter.ResizeTrigger>

      <Splitter.Panel id="n" class={clsx(splitterStyles.Panel, "w-full")}>
        <div class="h-3rem p-4 font-700 flex items-center" style={{ 'border-bottom': '1px solid var(--color-border)' }}>Notes</div>
        <ScrollArea.Root class={clsx(scrollStyles.Root, "w-full")} style={{ 'height': 'calc(100% - 40px - 3rem)' }}>
          <ScrollArea.Viewport class={scrollStyles.Viewport}>
            <ScrollArea.Content
              class={clsx(scrollStyles.Content, "p-2 h-full")}
            >
              <div class="flex flex-col gap-2">
                <For each={currentFolder()?.notes}>
                  {(f) => (
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <h5 class="truncate">{f.title}</h5>
                        <span>{formatDate(f.updateAt)}</span>
                      </div>
                      <div class="text-sm truncate">{f.content.slice(0, 30)}</div>
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

      <Splitter.ResizeTrigger 
        class={splitterStyles.ResizeTrigger}
        id="n:c"
        aria-label="Resize">
        <Splitter.ResizeTriggerIndicator
          class={splitterStyles.ResizeTriggerIndicator}
        />
      </Splitter.ResizeTrigger>

      <Splitter.Panel id="c" class={clsx(splitterStyles.Panel, "w-full")}>
        <div style={{'height': 'calc(100% - 40px)'}}>
          <div class="text-text bg-bg" ref={el => setEditor(el)} />
        </div>
      </Splitter.Panel>
    </Splitter.Root>
  )
}
