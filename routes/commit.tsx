import { tw } from 'twind'
import { Handlers, PageProps, RouteConfig } from '$fresh/server.ts'
import { Commit } from '../lib/gitcli.ts'
import { Breadcrumbs } from '../components/Breadcrumbs.tsx'
import { gitLog } from '../lib/gitLog.ts'
import { DiffFile, gitDiff } from '../lib/wipParseDiff.ts'
import { CommitUI } from './log.tsx'
import { Layout } from '../components/Layout.tsx'

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

export default function Blob({ data, params }: PageProps<DataStruct>) {
  const { commit, diff } = data
  return (
    <Layout title={`Commit: ${commit.summary}`}>
      <div class="bg-gray-50">
        <CommitUI commit={commit} />
        {diff.map((diffFile) => (
          <div
            class="bg-white mx-8 my-10 border-2 border-blue-400 rounded-xl overflow-hidden shadow-xl"
          >
            <div class="p-3 bg-blue-50 flex justify-between">
              <div class="font-bold">{diffFile.filename}</div>
              <div>
                {!diffFile.isNew && (
                  <a href={`/blob/${commit.parent}/${diffFile.filename}`}>
                    before
                  </a>
                )}
                {!diffFile.isNew && !diffFile.isDeleted && <span> / </span>}
                {!diffFile.isDeleted && (
                  <a href={`/blob/${commit.sha}/${diffFile.filename}`}>after</a>
                )}
              </div>
            </div>
            <div>
              {diffFile.lines.map((line) => (
                <pre class={tw`${diffLineClass(line)}`}>
                  <span class="select-none text-gray-500">
                    {line.charAt(0)}
                  </span>
                  {line.substring(1)}
                </pre>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}

function diffLineClass(line: string) {
  switch (line.charAt(0)) {
    case '+':
      return 'bg-green-50'
    case '-':
      return 'bg-red-50'
    case '@':
      return 'bg-blue-200 select-none'
  }
  return ''
}
