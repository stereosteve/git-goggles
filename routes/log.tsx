/** @jsx h */
import { h } from 'preact'
import { tw } from '@twind'
import { Handlers, PageProps, RouteConfig } from '$fresh/server.ts'
import { gitLog } from '../lib/gitLog.ts'
import { Commit } from '../lib/gitcli.ts'
import { Breadcrumbs } from '../components/Breadcrumbs.tsx'

export const config: RouteConfig = {
  routeOverride: '/commits/:ref/:path*',
}

export const handler: Handlers<Commit[]> = {
  async GET(req, ctx) {
    const { ref, path } = ctx.params
    const url = new URL(req.url)
    const log = await gitLog({
      ref,
      path,
      n: 1000,
      author: url.searchParams.get('author') || undefined,
    })
    return ctx.render(log)
  },
}

export default function Log({ data, params }: PageProps<Commit[]>) {
  const log = data
  return (
    <div>
      <Breadcrumbs params={params} />
      <div>{log.length} commits</div>
      <div>
        {data.map((commit) => (
          <CommitUI commit={commit} />
        ))}
      </div>
    </div>
  )
}

export function CommitUI({ commit }: { commit: Commit }) {
  return (
    <div style={{ margin: 20, border: '2px solid purple' }}>
      <div>
        Commit: <a href={`/commit/${commit.sha}`}>{commit.sha}</a>
      </div>
      <div>
        Browse: <a href={`/stuff/tree/${commit.sha}`}>{commit.tree}</a>
      </div>
      <div>
        WHO:
        <a href={`?author=${encodeURIComponent(commit.author)}`}>
          {commit.author}
        </a>
        -- {commit.authorEmail}
      </div>
      <div>
        WHEN: {commit.authorTime} {commit.authorTz}
      </div>

      <pre>{commit.summary}</pre>
    </div>
  )
}
