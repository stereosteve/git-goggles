/** @jsx h */
import { h } from 'preact'
import { tw } from '@twind'

export function Breadcrumbs({ params }: { params: Record<string, string> }) {
  const { ref, path } = params
  const segments = path.split('/')
  const treeRoot = `/tree/${ref}/`

  const crumbs2 = segments.map((seg, idx) => (
    <a
      class={tw(`m-2 text-purple-800`)}
      href={treeRoot + segments.slice(0, idx + 1).join('/')}
    >
      {seg}
    </a>
  ))

  return (
    <div class={tw`p-2 border bg-gray-100`}>
      <a href={treeRoot}>root</a>
      {crumbs2}
    </div>
  )
}
