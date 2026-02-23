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
      isParagraph: editor?.isActive('paragraph'),
      isHeading1: editor?.isActive('heading', { level: 1 }),
      isHeading2: editor?.isActive('heading', { level: 2 }),
      isHeading3: editor?.isActive('heading', { level: 3 }),
      isHeading4: editor?.isActive('heading', { level: 4 }),
      isHeading5: editor?.isActive('heading', { level: 5 }),
      isHeading6: editor?.isActive('heading', { level: 6 }),
      isBulletList: editor?.isActive('bulletList'),
      isOrderedList: editor?.isActive('orderedList'),
      isCodeBlock: editor?.isActive('codeBlock'),
      isBlockquote: editor?.isActive('blockquote'),
      canUndo: editor?.can().chain().focus().undo().run(),
      canRedo: editor?.can().chain().focus().redo().run(),
    }),
  )

  return (
    <div class="control-group">
      <div class="button-group">
        <Toggle.Root
          pressed={state().isBold}
          onPressedChange={() => props.editor!.chain().focus().toggleBold().run()}
          disabled={!state().canBold}
          class={clsx(toggleStyles.Root)}
        >
          <div class="i-ri-bold"></div>
        </Toggle.Root>
        <Toggle.Root
          pressed={state().isItalic}
          onPressedChange={() => props.editor!.chain().focus().toggleItalic().run()}
          disabled={!state().canItalic}
          class={clsx(toggleStyles.Root)}
        >
          <div class="i-ri-italic"></div>
        </Toggle.Root>
        <Toggle.Root
          pressed={state().isStrike}
          onPressedChange={() => props.editor!.chain().focus().toggleStrike().run()}
          disabled={!state().canStrike}
          class={clsx(toggleStyles.Root)}
        >
          <div class="i-ri-strikethrough"></div>
        </Toggle.Root>
        <Toggle.Root
          pressed={state().isCode}
          onPressedChange={() => props.editor!.chain().focus().toggleCode().run()}
          disabled={!state().canCode}
          class={clsx(toggleStyles.Root, state().isCode && 'is-active')}
        >
          <div class="i-ri-code-s-slash-line"></div>
        </Toggle.Root>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => props.editor!.chain().focus().unsetAllMarks().run()}
        >
          <div class="i-ri-eraser-line" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => props.editor!.chain().focus().clearNodes().run()}
        >
          <div class="i-ri-eraser-fill" />
        </Button>
        <button
          onClick={() => props.editor!.chain().focus().setParagraph().run()}
          class={clsx(state().isParagraph && 'is-active')}
        >
          Paragraph
        </button>
        <button
          onClick={() => props.editor!.chain().focus().toggleHeading({ level: 1 }).run()}
          class={clsx(state().isHeading1 && 'is-active')}
        >
          H1
        </button>
        <button
          onClick={() => props.editor!.chain().focus().toggleHeading({ level: 2 }).run()}
          class={clsx(state().isHeading2 && 'is-active')}
        >
          H2
        </button>
        <button
          onClick={() => props.editor!.chain().focus().toggleHeading({ level: 3 }).run()}
          class={clsx(state().isHeading3 && 'is-active')}
        >
          H3
        </button>
        <button
          onClick={() => props.editor!.chain().focus().toggleHeading({ level: 4 }).run()}
          class={clsx(state().isHeading4 && 'is-active')}
        >
          H4
        </button>
        <button
          onClick={() => props.editor!.chain().focus().toggleHeading({ level: 5 }).run()}
          class={clsx(state().isHeading5 && 'is-active')}
        >
          H5
        </button>
        <button
          onClick={() => props.editor!.chain().focus().toggleHeading({ level: 6 }).run()}
          class={clsx(state().isHeading6 && 'is-active')}
        >
          H6
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => props.editor!.chain().focus().toggleBulletList().run()}
          class={clsx(state().isBulletList && 'is-active')}
        >
          <div class="i-ri-list-check" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => props.editor!.chain().focus().toggleOrderedList().run()}
          class={clsx(state().isOrderedList && 'is-active')}
        >
          <div class="i-ri-list-ordered-2" />
        </Button>
        <Toggle.Root
          pressed={state().isCodeBlock}
          onPressedChange={() => props.editor!.chain().focus().toggleCodeBlock().run()}
          class={toggleStyles.Root}
        >
          <div class="i-ri-code-block" />
        </Toggle.Root>
        <Toggle.Root
          pressed={state().isBlockquote}
          onPressedChange={() => props.editor!.chain().focus().toggleBlockquote().run()}
          class={toggleStyles.Root}
        >
          <div class="i-ri-double-quotes-l" />
        </Toggle.Root>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => props.editor!.chain().focus().setHorizontalRule().run()}
        >
          Hr
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => props.editor!.chain().focus().setHardBreak().run()}
        >
          <div class="i-ri-arrow-left-down-long-line" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => props.editor!.chain().focus().undo().run()}
          disabled={!state().canUndo}
        >
          <div class="i-ri-arrow-go-back-fill" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => props.editor!.chain().focus().redo().run()}
          disabled={!state().canRedo}
        >
          <div class="i-ri-arrow-go-forward-fill" />
        </Button>
      </div>
    </div>
  )
}

export default EditorMenubar
