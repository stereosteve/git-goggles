/** @jsx h */
import { h } from 'preact'
import { tw } from '@twind'
import { Handlers, PageProps, RouteConfig } from '$fresh/server.ts'
import { gitShow } from '../lib/gitcli.ts'

export const config: RouteConfig = {
  routeOverride: '/show/:sha',
}

export const handler: Handlers<string> = {
  async GET(req, ctx) {
    const { sha } = ctx.params
    const blob = await gitShow({ sha })
    return ctx.render(blob)
  },
}

export default function Show({ data }: PageProps<string>) {
  return (
    <div class={tw`p-4`}>
      <pre>{data}</pre>
    </div>
  )
}
