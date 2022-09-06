/** @jsx h */
import { h } from 'preact'
import { tw } from '@twind'
import { Handlers, PageProps, RouteConfig } from '$fresh/server.ts'
import { gitShow } from '../lib/gitcli.ts'
import { Breadcrumbs } from '../components/Breadcrumbs.tsx'

export const config: RouteConfig = {
  routeOverride: '/blob/:ref/:path*',
}

export const handler: Handlers<string> = {
  async GET(req, ctx) {
    const { ref, path } = ctx.params
    const blob = await gitShow({ ref, path })
    return ctx.render(blob)
  },
}

export default function Blob({ data, params }: PageProps<string>) {
  return (
    <div>
      <Breadcrumbs params={params} />
      <a href={`/commits/${params.ref}/${params.path}`}>history</a>
      {` `}
      <a href={`/blame/${params.ref}/${params.path}`}>blame</a>
      <pre class={tw`p-4`}>{data}</pre>
    </div>
  )
}
