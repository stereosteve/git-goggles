export function Breadcrumbs({ params }: { params: Record<string, string> }) {
  const { ref, path } = params
  const segments = path.split('/')
  const treeRoot = `/tree/${ref}/`

  const crumbs2 = segments.map((seg, idx) => (
    <a
      class="m-2 text-purple-800"
      href={treeRoot + segments.slice(0, idx + 1).join('/')}
    >
      {seg}
    </a>
  ))

  return (
    <div class="p-2 border bg-gray-100">
      <a href={treeRoot}>root</a>
      {crumbs2}
    </div>
  )
}
