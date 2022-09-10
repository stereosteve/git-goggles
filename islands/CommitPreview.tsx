import { useEffect, useState } from 'preact/hooks'
import { DiffUI } from '../components/DiffUI.tsx'
import { DiffData } from '../lib/types.ts'

export default function CommitPreview() {
  const [hash, setHash] = useState('')
  const [data, setData] = useState<DiffData>()

  useEffect(() => {
    function updateHash() {
      setHash(window.location.hash.substring(1))
    }
    onhashchange = updateHash
    updateHash()
  }, [])

  useEffect(() => {
    if (!hash) return
    fetch(`/api/gitDiff?ref=${hash}`).then(async (ok) => {
      const data = await ok.json()
      setData(data)
      const el = document.getElementById('diff_preview')?.parentElement
      if (el) {
        el.scrollTop = 0
      }
    })
  }, [hash])

  // if you were to do
  //   if (!data) return null
  // you get:
  //   Uncaught TypeError: Cannot read properties of undefined (reading 'nextSibling')

  return (
    <div id="diff_preview">
      {data && <DiffUI diff={data.diff} commit={data.commit} />}
    </div>
  )
}
