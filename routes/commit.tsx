import { tw } from 'twind'
import { Handlers, PageProps, RouteConfig } from '$fresh/server.ts'
import { Commit } from '../lib/gitcli.ts'
import { Breadcrumbs } from '../components/Breadcrumbs.tsx'
import { gitLog } from '../lib/gitLog.ts'
import { DiffFile, gitDiff } from '../lib/wipParseDiff.ts'
import { CommitUI } from './log.tsx'
import { Layout } from '../components/Layout.tsx'
import { DiffUI } from '../components/DiffUI.tsx'

export const config: RouteConfig = {
  routeOverride: '/commit/:ref',
}

type DataStruct = {
  commit: Commit
  diff: DiffFile[]
}

export const handler: Handlers<DataStruct> = {
  async GET(req, ctx) {
    const { ref } = ctx.params
    const [commits, diff] = await Promise.all([
      gitLog({ ref, n: 1 }),
      gitDiff({ ref }),
    ])
    return ctx.render({ commit: commits[0], diff })
  },
}

export default function ({ data, params }: PageProps<DataStruct>) {
  const { commit, diff } = data
  return (
    <Layout title={`Commit: ${commit.summary}`}>
      <div class="bg-gray-50">
        <CommitUI commit={commit} />
        <DiffUI commit={commit} diff={diff} />
      </div>
    </Layout>
  )
}
