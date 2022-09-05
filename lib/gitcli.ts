import { decoder } from 'https://deno.land/std@0.83.0/encoding/utf8.ts'

export async function gitcli(args: string[]) {
  // todo: better cwd config
  const cwd = Deno.args[0]

  const git = Deno.run({
    cmd: ['git', ...args],
    stdout: 'piped',
    stderr: 'piped',
    cwd,
  })

  const stdout = decoder.decode(await git.output())
  const stderr = decoder.decode(await git.stderrOutput())

  console.log(args.join(' '))

  const { success } = await git.status()
  if (!success) {
    console.log('bad news', stderr)
    throw new Error(stderr)
  }
  return stdout
}

export async function gitShow({ sha }: { sha: string }) {
  const blob = await gitcli(['show', sha])
  return blob
}

export interface Commit {
  sha: string
  tree: string
  parent?: string
  author: string
  authorEmail: string
  authorTime: number
  authorTz: string
  committer: string
  committerEmail: string
  committerTime: number
  committerTz: string
  summary: string
  message: string
}

export function parseCommits(raw: string) {
  let commit = {} as Commit
  const commits: Commit[] = []

  const lines = raw.split('\n')
  for (const line of lines) {
    if (line.startsWith('    ')) {
      if (!commit.summary) commit.summary = line.substr(4)
      commit.message += line.substr(4) + '\n'
      continue
    }

    const fields = line.split(' ')
    switch (fields[0]) {
      case 'commit':
        commit = {
          sha: fields[1],
          message: '',
        } as Commit
        commits.push(commit)
        break
      case 'tree':
        commit.tree = fields[1]
        break
      case 'parent':
        commit.parent = fields[1]
        break
      case 'author':
        commit.authorTz = fields.pop()!
        commit.authorTime = parseInt(fields.pop()!)
        commit.authorEmail = fields.pop()!
        commit.author = fields.slice(1).join(' ')
        break
      case 'committer':
        commit.committerTz = fields.pop()!
        commit.committerTime = parseInt(fields.pop()!)
        commit.committerEmail = fields.pop()!
        commit.committer = fields.slice(1).join(' ')
        break
      default:
        // console.log('skipping', line)
        break
    }
  }

  return commits
}

type BlameArgs = {
  ref: string
  path: string
}

export async function gitBlame({ ref, path }: BlameArgs) {
  const output = await gitcli(['blame', '-p', ref, path])
  return parseBlame(output)
}

export type BlameHunk = {
  sha: string
  startLine: number
  lines: string[]
}

export type BlameOutput = {
  hunks: BlameHunk[]
  commits: Record<string, Commit>
}

export function parseBlame(output: string): BlameOutput {
  const commits: Record<string, Commit> = {}
  const hunks: BlameHunk[] = []
  let lastSha = ''

  for (const line of output.split('\n')) {
    // code lines start with tab
    if (line.startsWith('\t')) {
      const hunk = hunks[hunks.length - 1]
      hunk.lines.push(line.substr(1))
      continue
    }

    const fields = line.split(' ')

    // header starts with 40 byte sha
    // if 4th hunkLength field is present,
    // start a new blame hunk
    if (fields[0].length === 40) {
      const [sha, _lineBefore, line, hunkLength] = fields
      lastSha = sha
      if (hunkLength) {
        hunks.push({
          sha,
          startLine: parseInt(line),
          lines: [],
        })
      }
    } // otherwise assign `key value` data to commit
    else {
      commits[lastSha] = commits[lastSha] || {
        sha: lastSha,
      }
      const commit = commits[lastSha]
      const k = fields.shift()
      const v = fields.join(' ')

      switch (k) {
        case 'author':
          commit.author = v
          break
        case 'author-mail':
          commit.authorEmail = v
          break
        case 'author-time':
          commit.authorTime = parseInt(v)
          break
        case 'author-tz':
          commit.authorTz = v
          break
        case 'committer':
          commit.committer = v
          break
        case 'committer-mail':
          commit.committerEmail = v
          break
        case 'committer-time':
          commit.committerTime = parseInt(v)
          break
        case 'committer-tz':
          commit.committerTz = v
          break
        case 'summary':
          commit.summary = v
          break
        default:
          // skip lines like:
          // previous 3de25db88cdcba1bb3a97f790a3fce56aade3811 README.md
          // filename README.md
          // console.log('blame skipping', line)
          break
      }
    }
  }

  return {
    hunks,
    commits,
  }
}
