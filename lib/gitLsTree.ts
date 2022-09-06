import { gitcli, parseCommits, Commit } from './gitcli.ts'

type LsTreeParams = {
  ref: string
  prefix?: string
  attachLatestCommit?: boolean
}

export type TreeNode = {
  mode: string
  kind: 'tree' | 'blob'
  sha: string
  size: number
  path: string

  commit?: Commit
}

export async function gitLsTree({
  ref,
  prefix,
  attachLatestCommit,
}: LsTreeParams): Promise<TreeNode[]> {
  prefix = prefix || '.'
  const out = await gitcli(['ls-tree', '-l', ref, prefix])
  const nodes = out
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((l) => {
      const [mode, kind, sha, size, path] = l.split(/\s+/)
      return {
        mode,
        kind,
        sha,
        size: parseInt(size),
        path,
      } as TreeNode
    })

  if (attachLatestCommit) {
    await attachLatestCommitToTreeNodes(nodes)
  }
  return nodes
}

async function attachLatestCommitToTreeNodes(nodes: TreeNode[]) {
  return await Promise.all(
    nodes.map(async (node) => {
      const out = await gitcli([
        'log',
        '--format=raw',
        '-n',
        '1',
        '--',
        node.path,
      ])
      node.commit = parseCommits(out)[0]
    })
  )
}
