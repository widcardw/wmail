import { Component } from 'solid-js'
import { type Editor } from '@tiptap/core'
// import { menubarStateAccessor } from '~/components/ui/editor/menubar-state'
import clsx from 'clsx'

import './menubar.scss'
import { createEditorTransaction } from 'solid-tiptap'
import { Toggle } from '@ark-ui/solid'
import toggleStyles from '~/components/ui/toggle/index.module.css'
import { Button } from '../button'

const EditorMenubar: Component<{ editor?: Editor }> = (props) => {
  if (!props.editor) {
    return null
  }

  const state = createEditorTransaction(
    () => props.editor,
    (editor) => ({
      isBold: editor?.isActive('bold'),
      canBold: editor?.can().chain().focus().toggleBold().run(),
      isItalic: editor?.isActive('italic'),
      canItalic: editor?.can().chain().focus().toggleItalic().run(),
      isStrike: editor?.isActive('strike'),
      canStrike: editor?.can().chain().focus().toggleStrike().run(),
      isCode: editor?.isActive('code'),
      canCode: editor?.can().chain().focus().toggleCode().run(),
      isUnderline: editor?.isActive('underline'),
      canUnderline: editor?.can().chain().focus().toggleUnderline().run(),
      isParagraph: editor?.isActive('paragraph'),
      isHeading1: editor?.isActive('heading', { level: 1 }),
      isHeading2: editor?.isActive('heading', { level: 2 }),
      isHeading3: editor?.isActive('heading', { level: 3 }),
      isHeading4: editor?.isActive('heading', { level: 4 }),
      isBulletList: editor?.isActive('bulletList'),
      isOrderedList: editor?.isActive('orderedList'),
      isCodeBlock: editor?.isActive('codeBlock'),
      isBlockquote: editor?.isActive('blockquote'),
      canUndo: editor?.can().chain().focus().undo().run(),
      canRedo: editor?.can().chain().focus().redo().run(),
    }),
  )

  return (
    <div
      class="control-group h-3rem flex items-center gap-1 px-1"
      style={{ 'border-bottom': '1px solid var(--color-border)' }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => props.editor!.chain().focus().undo().run()}
        disabled={!state().canUndo}
      >
        <div class="i-ri-arrow-go-back-fill w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => props.editor!.chain().focus().redo().run()}
        disabled={!state().canRedo}
      >
        <div class="i-ri-arrow-go-forward-fill w-5 h-5" />
      </Button>
      <div class="h-5" style={{'border-right': '1px solid var(--color-border)'}} />
      <Toggle.Root
        pressed={state().isBold}
        onPressedChange={() => props.editor!.chain().focus().toggleBold().run()}
        disabled={!state().canBold}
        class={clsx(toggleStyles.Root)}
      >
        <div class="i-ri-bold w-5 h-5"></div>
      </Toggle.Root>
      <Toggle.Root
        pressed={state().isItalic}
        onPressedChange={() => props.editor!.chain().focus().toggleItalic().run()}
        disabled={!state().canItalic}
        class={clsx(toggleStyles.Root)}
      >
        <div class="i-ri-italic w-5 h-5"></div>
      </Toggle.Root>
      <Toggle.Root
        pressed={state().isStrike}
        onPressedChange={() => props.editor!.chain().focus().toggleStrike().run()}
        disabled={!state().canStrike}
        class={clsx(toggleStyles.Root)}
      >
        <div class="i-ri-strikethrough w-5 h-5"></div>
      </Toggle.Root>
      <Toggle.Root
        pressed={state().isUnderline}
        onPressedChange={() => props.editor!.chain().focus().toggleUnderline().run()}
        disabled={!state().canUnderline}
        class={clsx(toggleStyles.Root)}
      >
        <div class="i-ri-underline w-5 h-5"></div>
      </Toggle.Root>
      <Toggle.Root
        pressed={state().isCode}
        onPressedChange={() => props.editor!.chain().focus().toggleCode().run()}
        disabled={!state().canCode}
        class={clsx(toggleStyles.Root, state().isCode && 'is-active')}
      >
        <div class="i-ri-code-s-slash-line w-5 h-5"></div>
      </Toggle.Root>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => props.editor!.chain().focus().unsetAllMarks().run()}
      >
        <div class="i-ri-eraser-line w-5 h-5" />
      </Button>
      <div class="h-5" style={{'border-right': '1px solid var(--color-border)'}} />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => props.editor!.chain().focus().setParagraph().run()}
        class={clsx(state().isParagraph && 'is-active')}
      >
        <div class="i-ri-paragraph w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => props.editor!.chain().focus().toggleHeading({ level: 1 }).run()}
        class={clsx(state().isHeading1 && 'is-active')}
      >
        <div class="i-lucide-heading-1 w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => props.editor!.chain().focus().toggleHeading({ level: 2 }).run()}
        class={clsx(state().isHeading2 && 'is-active')}
      >
        <div class="i-lucide-heading-2 w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => props.editor!.chain().focus().toggleHeading({ level: 3 }).run()}
        class={clsx(state().isHeading3 && 'is-active')}
      >
        <div class="i-lucide-heading-3 w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => props.editor!.chain().focus().toggleHeading({ level: 4 }).run()}
        class={clsx(state().isHeading4 && 'is-active')}
      >
        <div class="i-lucide-heading-4 w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => props.editor!.chain().focus().toggleBulletList().run()}
        class={clsx(state().isBulletList && 'is-active')}
      >
        <div class="i-ri-list-check w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => props.editor!.chain().focus().toggleOrderedList().run()}
        class={clsx(state().isOrderedList && 'is-active')}
      >
        <div class="i-ri-list-ordered-2 w-5 h-5" />
      </Button>
      <Toggle.Root
        pressed={state().isCodeBlock}
        onPressedChange={() => props.editor!.chain().focus().toggleCodeBlock().run()}
        class={toggleStyles.Root}
      >
        <div class="i-ri-code-block w-5 h-5" />
      </Toggle.Root>
      <Toggle.Root
        pressed={state().isBlockquote}
        onPressedChange={() => props.editor!.chain().focus().toggleBlockquote().run()}
        class={toggleStyles.Root}
      >
        <div class="i-ri-double-quotes-l w-5 h-5" />
      </Toggle.Root>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => props.editor!.chain().focus().clearNodes().run()}
      >
        <div class="i-ri-eraser-fill w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => props.editor!.chain().focus().setHorizontalRule().run()}
      >
        <div class="i-lucide-separator-horizontal w-5 h-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => props.editor!.chain().focus().setHardBreak().run()}
      >
        <div class="i-ri-text-wrap w-5 h-5" />
      </Button>
    </div>
  )
}

export default EditorMenubar
