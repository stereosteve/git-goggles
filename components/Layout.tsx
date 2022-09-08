/** @jsx h */
import { ComponentChildren, h } from 'preact'
import { Head, IS_BROWSER } from '$fresh/runtime.ts'
import { tw } from '@twind'

type LayoutProps = {
  title: string
  children: ComponentChildren
}

export function Layout({ title, children }: LayoutProps) {
  return (
    <div class={tw`border-t-8 border-purple-800`}>
      <Head>
        <title>{title}</title>
      </Head>
      <a href="/">HOME</a>
      {children}
    </div>
  )
}
