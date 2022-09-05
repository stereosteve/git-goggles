/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import { Handlers, PageProps, RouteConfig } from "$fresh/server.ts";
import { gitLsTree, TreeNode } from "../lib/gitLsTree.ts";

export const config: RouteConfig = {
  routeOverride: "/:stuff*/tree/:ref/:prefix*",
};

export const handler: Handlers<TreeNode[]> = {
  async GET(req, ctx) {
    let { ref, prefix } = ctx.params;
    if (prefix && !prefix.endsWith("/")) prefix += "/";

    const tree = await gitLsTree({
      ref,
      prefix,
      attachLatestCommit: true,
    });
    return ctx.render(tree);
  },
};

export default function Home({ data, url, params }: PageProps<TreeNode[]>) {
  let { stuff, ref, prefix } = params;
  const segments = prefix.split("/");
  const treeRoot = `/${stuff}/tree/${ref}/`.replace("//", "/");

  if (prefix && !prefix.endsWith("/")) prefix += "/";

  const tree = data;
  const dirs = tree.filter((n) => n.kind === "tree");
  const files = tree.filter((n) => n.kind === "blob");

  const crumbs2 = segments.map((seg, idx) => (
    <a
      class={tw(`m-2 text-purple-800`)}
      href={treeRoot + segments.slice(0, idx + 1).join("/")}
    >
      {seg}
    </a>
  ));

  return (
    <div>
      <div class={tw`p-2 border bg-gray-100`}>
        <a href={treeRoot}>root</a>
        {crumbs2}
      </div>
      <table>
        <tbody>
          {dirs.map((t, idx) => (
            <tr key={idx}>
              <td>
                <a href={`${treeRoot}${t.path}`}>
                  {t.path.replace(prefix, "")}/
                </a>
              </td>
              <td class={tw`text-xs`}>{t.commit?.summary}</td>
              <td></td>
              <td></td>
            </tr>
          ))}
          {files.map((t, idx) => (
            <tr key={idx}>
              <td>
                <a href={`/show/${t.sha}`}>{t.path.replace(prefix, "")}</a>
              </td>
              <td class={tw`text-xs`}>{t.commit?.summary}</td>
              <td class={tw`text-xs`}>{t.size}</td>
              <td>
                <a href={`/log/?path=${t.path}`}>log</a>
                <a href={`/blame/${ref}/${t.path}`}>blame</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
