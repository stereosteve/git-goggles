import { Handlers, PageProps, RouteConfig } from '$fresh/server.ts'
import { gitcli } from '../lib/gitcli.ts'

export const handler: Handlers<string> = {
  async GET(req, ctx) {
    // NB this won't work on "baseless" checkout...
    const branchOutput = await gitcli(['branch'])
    const branch = branchOutput.replace('* ', '')
    return ctx.render(branch)
  },
}

export default function Home({ data }: PageProps<string>) {
  const branch = data
  return (
    <div class="p-4 mx-auto max-w-screen-md">
      <img
        src="/logo.svg"
        height="100px"
        alt="the fresh logo: a sliced lemon dripping with juice"
      />
      <h1 class="text-xl my-2 font-bold">on: {branch}</h1>
      <ul>
        <li>
          <a href={`/commits/${branch}`}>log</a> <br />
        </li>
        <li>
          <a href={`/tree/${branch}`}>tree</a>
        </li>
      </ul>
    </div>
  )
}
