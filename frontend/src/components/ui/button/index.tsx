import { Component, JSXElement, mergeProps } from 'solid-js'
import clsx from 'clsx'

const VariantClasses = {
  default: 'bg-primary text-primary-fg hover:bg-primary-hover',
  destructive: 'bg-destructive text-destructive-fg hover:bg-destructive-hover',
  destructive_icon: 'bg-transparent text-destructive-fg hover:bg-destructive',
  secondary: 'bg-secondary text-secondary-fg hover:bg-secondary-hover',
  ghost: 'bg-transparent text-text hover:bg-primary-hvbg',
}

const SizeClasses = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-9 px-3 text-xs',
  lg: 'h-11 px-8 text-md',
  icon: 'size-8 text-sm',
}

const Button: Component<{
  disabled?: boolean
  variant?: 'default' | 'secondary' | 'destructive' | 'ghost' | 'destructive_icon'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  onClick?: (args: unknown) => unknown
  children?: JSXElement
  class?: string
  title?: string
}> = (props) => {
  const p = mergeProps(
    {
      variant: 'default',
      onClick: () => {},
      children: '',
      disabled: false,
      size: 'default',
      class: '',
      title: '',
    },
    props,
  )
  const commonClass =
    'border-none inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

  return (
    <button
      disabled={p.disabled}
      class={clsx(
        commonClass,
        VariantClasses[p.variant],
        SizeClasses[p.size],
        'font-sans',
        p.class,
      )}
      title={p.title}
      onClick={p.onClick}
    >
      {p.children}
    </button>
  )
}

export { Button }
