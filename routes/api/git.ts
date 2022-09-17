import { HandlerContext } from '$fresh/server.ts'
import { gitcli } from '../../lib/gitcli.ts'

export const handler = async (req: Request, _ctx: HandlerContext) => {
  const url = new URL(req.url)
  const args = url.searchParams.get('a')?.split(',')
  if (!args) {
    return new Response('missing a query param', { status: 400 })
  }
  try {
    const out = await gitcli(args)
    return new Response(out)
  } catch (e) {
    console.log(e)
    return new Response(e, { status: 500 })
  }
}
