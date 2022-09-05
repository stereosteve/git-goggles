/** @jsx h */
import { h } from 'preact'
import { tw } from '@twind'
import { Handlers, PageProps, RouteConfig } from '$fresh/server.ts'
import { BlameOutput, gitBlame, gitShow } from '../lib/gitcli.ts'
import { Head } from '$fresh/runtime.ts'

export const config: RouteConfig = {
  routeOverride: '/blame/:ref/:path*',
}

export const handler: Handlers<BlameOutput> = {
  async GET(req, ctx) {
    const { ref, path } = ctx.params
    const blame = await gitBlame({ ref, path })
    return ctx.render(blame)
  },
}

export default function Home({ data, params }: PageProps<BlameOutput>) {
  const { path } = params
  const { hunks, commits } = data
  return (
    <div className="page">
      <Head>
        <title>Blame: {path}</title>
      </Head>
      <h1>Blame {path}</h1>
      <table>
        <tbody>
          {hunks.map((hunk, idx) => {
            const commit = commits[hunk.sha]
            return (
              <tr key={idx} class={tw`border`}>
                <td class={tw`align-top`}>
                  <a href={`/log?author=${encodeURIComponent(commit.author)}`}>
                    <b>{commit.author}</b>
                  </a>
                  {` `}
                  <a href={`/show/${commit.sha}`}>
                    <em>{commit.summary.substring(0, 20)}</em>
                  </a>
                </td>
                <td>
                  {hunk.lines.map((line, idx) => (
                    <pre key={idx}>
                      {hunk.startLine + idx}: {line}
                    </pre>
                  ))}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
