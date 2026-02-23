import type { Editor } from '@tiptap/core'
import { useEditorIsActive } from 'solid-tiptap'

export function menubarStateAccessor(editor: Editor) {
  return {
    isBold: useEditorIsActive(
      () => editor,
      () => 'bold',
    ),
    isItalic: useEditorIsActive(
      () => editor,
      () => 'italic',
    ),
    isStrike: useEditorIsActive(
      () => editor,
      () => 'strike',
    ),
    isCode: useEditorIsActive(
      () => editor,
      () => 'code',
    ),

    // Block types
    isParagraph: useEditorIsActive(
      () => editor,
      () => 'paragraph',
    ),
    isHeading1: useEditorIsActive(
      () => editor,
      () => 'heading',
      { level: 1 },
    ),
    isHeading2: useEditorIsActive(
      () => editor,
      () => 'heading',
      { level: 2 },
    ),
    isHeading3: useEditorIsActive(
      () => editor,
      () => 'heading',
      { level: 3 },
    ),
    isHeading4: useEditorIsActive(
      () => editor,
      () => 'heading',
      { level: 4 },
    ),
    isHeading5: useEditorIsActive(
      () => editor,
      () => 'heading',
      { level: 5 },
    ),
    isHeading6: useEditorIsActive(
      () => editor,
      () => 'heading',
      { level: 6 },
    ),

    // Lists and blocks
    isBulletList: useEditorIsActive(
      () => editor,
      () => 'bulletList',
    ),
    isOrderedList: useEditorIsActive(
      () => editor,
      () => 'orderedList',
    ),
    isCodeBlock: useEditorIsActive(
      () => editor,
      () => 'codeBlock',
    ),
    isBlockquote: useEditorIsActive(
      () => editor,
      () => 'blockquote',
    ),
  }
}
