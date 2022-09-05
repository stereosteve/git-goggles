/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import { Handlers, PageProps } from "$fresh/server.ts";
import { gitLog } from "../lib/gitLog.ts";
import { Commit } from "../lib/gitcli.ts";

export const handler: Handlers<Commit[]> = {
  async GET(req, ctx) {
    const log = await gitLog();
    console.log(log);
    return ctx.render(log);
  },
};

export default function Home({ data }: PageProps<Commit[]>) {
  const log = data;
  return (
    <div class={tw`p-4 mx-auto max-w-screen-md`}>
      {log.map((commit) => (
        <div>{commit.author}</div>
      ))}
    </div>
  );
}
