import { Handlers, PageProps, RouteConfig } from '$fresh/server.ts'
import { gitLsTree, TreeNode } from '../lib/gitLsTree.ts'
import { Breadcrumbs } from '../components/Breadcrumbs.tsx'
import { Layout } from '../components/Layout.tsx'

export const config: RouteConfig = {
  routeOverride: '/:stuff*/tree/:ref/:path*',
}

export const handler: Handlers<TreeNode[]> = {
  async GET(req, ctx) {
    let { ref, path } = ctx.params
    if (path && !path.endsWith('/')) path += '/'

    const tree = await gitLsTree({
      ref,
      prefix: path,
      attachLatestCommit: true,
    })

    if (!tree.length) {
      // on empty tree assume it's a file and redirect to blob
      return Response.redirect(req.url.replace('/tree/', '/blob/'))
    }

    return ctx.render(tree)
  },
}

export default function Tree({ data, url, params }: PageProps<TreeNode[]>) {
  let { stuff, ref, path } = params
  const treeRoot = `/${stuff}/tree/${ref}/`.replace('//', '/')

  if (path && !path.endsWith('/')) path += '/'

  const tree = data
  const dirs = tree.filter((n) => n.kind === 'tree')
  const files = tree.filter((n) => n.kind === 'blob')

  return (
    <Layout title={`tree: ${path}`}>
      <Breadcrumbs params={params} />
      <table>
        <tbody>
          {dirs.map((t, idx) => (
            <tr key={idx}>
              <td>
                <a href={`${treeRoot}${t.path}`}>{t.path.replace(path, '')}/</a>
              </td>
              <td class="text-xs">{t.commit?.summary}</td>
              <td></td>
              <td></td>
            </tr>
          ))}
          {files.map((t, idx) => (
            <tr class="hover:bg-yellow-100">
              <td>
                <a href={`/blob/${ref}/${t.path}`}>
                  {t.path.replace(path, '')}
                </a>
              </td>
              <td class="text-xs px-2">{t.commit?.summary}</td>
              <td class="text-xs px-2 text-right ">{t.size}</td>
              <td class="text-xs px-2">
                <a href={`/commits/${ref}/${t.path}`}>log</a>
                {` `}
                <a href={`/blame/${ref}/${t.path}`}>blame</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  )
}
