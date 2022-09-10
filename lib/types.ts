import { Commit } from './gitcli.ts'
import { DiffFile } from './wipParseDiff.ts'

export type DiffData = {
  diff: DiffFile[]
  commit: Commit
}
