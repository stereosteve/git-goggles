import { Commit, gitcli, parseCommits } from './gitcli.ts'

type GitLogParams = {
  ref?: string
  n?: number
  skip?: number
  author?: string
  path?: string
}

export async function gitLog(opts?: GitLogParams): Promise<Commit[]> {
  const args = ['log', '--format=raw']

  {
    const { ref, n = 20, skip, author, path } = opts || {}
    args.push('-n', `${n}`)
    skip && args.push('--skip', `${skip}`)
    ref && args.push(ref)
    author && args.push('--author', author)
    path && args.push('--', path)
  }

  const out = await gitcli(args)
  return parseCommits(out)
}
