import { defineConfig, presetIcons, presetWind3, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [presetWind3(), presetIcons()],
  transformers: [transformerDirectives()],
  theme: {
    fontFamily: {
      mono: 'var(--font-mono)',
      sans: 'var(--font-sans)',
    },
    colors: {
      primary: {
        DEFAULT: 'var(--color-primary)',
        hover: 'var(--color-primary-hover)',
        fg: 'var(--color-primary-fg)',
      },
      secondary: {
        DEFAULT: 'var(--color-secondary)',
        hover: 'var(--color-secondary-hover)',
        fg: 'var(--color-secondary-fg)',
      },
      mut: {
        DEFAULT: 'var(--color-mut)',
        fg: 'var(--color-fg)',
      },
      destructive: {
        DEFAULT: 'var(--color-destructive)',
        hover: 'var(--color-destructive-hover)',
        fg: 'var(--color-destructive-fg)',
      },
      // 背景和文本颜色
      bg: 'var(--color-bg)',
      text: 'var(--color-fg)',
      border: 'var(--color-mut)',
    },
  },
})
