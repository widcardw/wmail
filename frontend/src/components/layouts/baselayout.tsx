import { Component, JSXElement } from 'solid-js'
import clsx from 'clsx'
import { goos } from '~/stores/os'

const BaseLayout: Component<{ children: JSXElement }> = (props) => {
  return (
    <div class="min-h-screen w-full bg-bg flex">
      <nav>Side bar</nav>
      <main
        class={clsx(
          'flex-1 container min-w-600px max-w-1200px mx-auto px-6 py-6',
          goos() === 'darwin' && 'mt-20px',
        )}
      >
        {props.children}
      </main>
    </div>
  )
}

export default BaseLayout
