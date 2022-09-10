import { Handlers, PageProps, RouteConfig } from '$fresh/server.ts'
import { gitLog } from '../lib/gitLog.ts'
import { Commit } from '../lib/gitcli.ts'
import { Breadcrumbs } from '../components/Breadcrumbs.tsx'
import { Layout } from '../components/Layout.tsx'
import CommitPreview from '../islands/CommitPreview.tsx'

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
    <Layout title={`commits`} tw="border-red-500">
      <Breadcrumbs params={params} />
      <div>{log.length} commits</div>
      <div class="flex max-h-screen">
        <div class="overflow-scroll border-2 border-blue-500 max-w-lg">
          {data.map((commit) => (
            <CommitUI commit={commit} />
          ))}
        </div>
        <div class="flex-grow overflow-y-scroll">
          <CommitPreview />
        </div>
      </div>
    </Layout>
  )
}

export function CommitUI({ commit }: { commit: Commit }) {
  const commitDate = new Date(commit.authorTime * 1000)
  return (
    <div class="p-2 border whitespace-nowrap">
      <a class="block font-bold" href={`#${commit.sha}`}>
        {commit.summary}
      </a>

      <div>
        <a
          href={`?author=${encodeURIComponent(commit.author)}`}
          title={commit.authorEmail}
        >
          {commit.author}
        </a>
        <span> &middot; </span>
        <span>
          {commitDate.toLocaleDateString()} {commitDate.toLocaleTimeString()}
        </span>
      </div>

      <div class="text-xs">
        <a href={`/commit/${commit.sha}`}>show</a>
        <span> &middot; </span>
        <a href={`/stuff/tree/${commit.sha}`}>browse</a>
      </div>
    </div>
  )
}
