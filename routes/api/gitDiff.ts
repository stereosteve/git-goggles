import { HandlerContext } from '$fresh/server.ts'
import { gitLog } from '../../lib/gitLog.ts'
import { gitDiff } from '../../lib/wipParseDiff.ts'

export const handler = async (req: Request, _ctx: HandlerContext) => {
  const url = new URL(req.url)
  const ref = url.searchParams.get('ref')
  if (!ref) {
    return new Response('missing ref query param', { status: 400 })
  }
  const [commits, diff] = await Promise.all([
    gitLog({ ref, n: 1 }),
    gitDiff({ ref }),
  ])
  return new Response(
    JSON.stringify({
      commit: commits[0],
      diff,
    })
  )
}
