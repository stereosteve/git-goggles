import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link, useLoaderData, useParams } from "react-router-dom";
import { callGit, gitFire } from "../junk";
import { parseCommits, parseTree, TreeNode } from "../parseGit";

export function GitTree() {
  const params = useParams();
  const tree = useLoaderData() as TreeNode[];

  const ref = params.ref;
  const path = params["*"] || "";
  const treeRoot = `/tree/${ref}/`;

  const dirs = tree.filter((n) => n.kind === "tree");
  const files = tree.filter((n) => n.kind === "blob");

  return (
    <div>
      <Breadcrumbs params={params as any} />
      <table>
        <tbody>
          {dirs.map((t, idx) => (
            <tr key={idx}>
              <td>
                <Link to={`${treeRoot}${t.path}`}>
                  {t.path.replace(path, "")}/
                </Link>
              </td>
              <td className="text-xs">
                <LatestCommitInfo path={t.path} />
              </td>
              <td></td>
              <td></td>
            </tr>
          ))}
          {files.map((t, idx) => (
            <tr key={idx} className="hover:bg-yellow-100">
              <td>
                <Link to={`/blob/${ref}/${t.path}`}>
                  {t.path.replace(path, "")}
                </Link>
              </td>
              <td className="text-xs px-2">
                <LatestCommitInfo path={t.path} />
              </td>
              <td className="text-xs px-2 text-right ">{t.size}</td>
              <td className="text-xs px-2">
                <Link to={`/commits/${ref}/${t.path}`}>log</Link>
                {` `}
                <Link to={`/blame/${ref}/${t.path}`}>blame</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LatestCommitInfo({ path }: { path: string }) {
  const { ref } = useParams();
  const args = ["log", ref!, "--format=raw", "-n", "1", "--", path];

  // const { data } = useQuery(args, async function (ctx) {
  //   const raw = await callGit(args, ctx);
  //   const commits = parseCommits(raw);
  //   return commits[0];
  // });

  const { data } = useQuery(args, gitFire);

  const commit = useMemo(() => {
    if (!data) return;
    const commits = parseCommits(data);
    return commits[0];
  }, [data]);

  if (!commit) return null;
  return <div>{commit.summary}</div>;
}

export function Breadcrumbs({ params }: { params: Record<string, string> }) {
  const { ref, "*": path } = params;
  const segments = path.split("/");
  const treeRoot = `/tree/${ref}/`;

  const crumbs2 = segments.map((seg, idx) => (
    <Link
      key={idx}
      className={`m-2 text-purple-800`}
      style={{ margin: 10 }}
      to={treeRoot + segments.slice(0, idx + 1).join("/")}
    >
      {seg}
    </Link>
  ));

  return (
    <div className="p-2 border bg-gray-100">
      <Link to={treeRoot}>root</Link>
      {crumbs2}
    </div>
  );
}
