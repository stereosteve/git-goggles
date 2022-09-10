import { ComponentChildren } from 'preact'
import { Head, IS_BROWSER } from '$fresh/runtime.ts'
type LayoutProps = {
  title: string
  tw?: string
  children: ComponentChildren
}

export function Layout({ title, tw, children }: LayoutProps) {
  return (
    <div class={`border-t-8 border-green-200 ${tw}`}>
      <Head>
        <title>{title}</title>
      </Head>
      <a href="/">HOME</a>
      {children}
    </div>
  )
}
