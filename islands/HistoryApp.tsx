import { useEffect, useState } from 'preact/hooks'
import { DiffUI } from '../components/DiffUI.tsx'
import { Commit, parseCommits } from '../lib/gitcli.ts'
import { DiffFile, parseDiff } from '../lib/wipParseDiff.ts'
import { CommitUI } from '../routes/log.tsx'

import { signal } from '@preact/signals'

const selectedFile = signal('')

export default function () {
  const [data, setData] = useState<Commit[]>()
  const [diff, setDiff] = useState<DiffFile[]>()
  const [hash, setHash] = useState('')

  useEffect(() => {
    function updateHash() {
      setHash(window.location.hash.substring(1))
      setDiff(undefined)
      selectedFile.value = ''
    }
    onhashchange = updateHash
    updateHash()
  }, [])

  useEffect(() => {
    fetch('/api/git?a=log,--format=raw,-n,50').then(async (ok) => {
      const raw = await ok.text()
      const commits = parseCommits(raw)
      setData(commits)
    })
  }, [])

  useEffect(() => {
    if (!hash) return
    fetch(`/api/git?a=show,--no-prefix,${hash}`).then(async (ok) => {
      let raw = await ok.text()

      if (ok.status != 200) {
        console.error(raw)
        return
      }

      // crappy thing to skip past the "commit" to the "diff"
      // this doesn't actually work correctly for merge commits...
      // previous approach of:
      //   git diff sha^ sha
      // worked better
      const diffStart = raw.indexOf('diff')
      if (diffStart == -1) return
      raw = raw.substring(diffStart)

      const diff = parseDiff(raw)
      setDiff(diff)

      const el = document.getElementById('diff_preview')?.parentElement
      if (el) {
        el.scrollTop = 0
      }
    })
  }, [hash])

  const commit = data?.find((c) => c.sha == hash)

  let visibleDiff = diff
  if (diff && selectedFile.value) {
    visibleDiff = diff.filter((f) => f.filename == selectedFile.value)
  }

  return (
    <div class="flex absolute border top-12 bottom-12 w-full">
      <div class="whitespace-nowrap overflow-y-scroll overflow-x-hidden w-1/3">
        {data?.map((commit) => (
          <div
            style={{
              background: commit.sha == hash ? 'yellow' : '',
            }}
          >
            <CommitUI commit={commit} />
            {commit.sha == hash && diff && (
              <div>
                {diff.map((d) => (
                  <div
                    class="text-xs p-1"
                    onClick={() => (selectedFile.value = d.filename)}
                  >
                    {d.filename}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div class="flex-grow w-2/3 overflow-scroll">
        <h1>{selectedFile}</h1>
        {visibleDiff && commit && <DiffUI diff={visibleDiff} commit={commit} />}
      </div>
    </div>
  )
}
