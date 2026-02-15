/* @refresh reload */
import { render, Suspense } from 'solid-js/web'
import { Router } from '@solidjs/router'
import routes from '~solid-pages'
import BaseLayout from './components/layouts/baselayout'
import { setGoos } from './stores/os'
import { OsService } from '#/wmail/services'

import 'virtual:uno.css'
import { onMount, Show } from 'solid-js'

import toastStyles from './components/ui/toaster/index.module.css'
import { Toast, Toaster } from '@ark-ui/solid'
import { toaster } from './components/ui/toaster'

import './styles/global.css'

render(
  () => {
    onMount(async () => {
      setGoos(await OsService.GetOs())
    })
    return (
      <Router
        root={(props) => (
          <Suspense
            fallback={
              <div class="flex items-center justify-center h-screen">
                <div class="i-ri-loader-4-line w-8 h-8 animate-spin text-primary" />
              </div>
            }
          >
            <BaseLayout>{props.children}</BaseLayout>
            <Toaster toaster={toaster}>
              {(toast) => (
                <Toast.Root class={toastStyles.Root}>
                  <Show when={toast().title}>
                    <Toast.Title class={toastStyles.Title}>{toast().title}</Toast.Title>
                  </Show>
                  <Show when={toast().description}>
                    <Toast.Description class={toastStyles.Description}>
                      {toast().description}
                    </Toast.Description>
                  </Show>
                  <Toast.CloseTrigger class={toastStyles.CloseTrigger}>
                    <div class="i-ri-close-line" />
                  </Toast.CloseTrigger>
                </Toast.Root>
              )}
            </Toaster>
          </Suspense>
        )}
      >
        {routes}
      </Router>
    )
  },
  document.getElementById('root') as HTMLElement,
)
