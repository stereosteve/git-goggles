import { useLoaderData, useParams } from "react-router-dom";
import { parseBlame } from "../parseGit";

export function GitBlame() {
  const { ref, "*": path } = useParams();
  const txt = useLoaderData() as string;

  const { hunks, commits } = parseBlame(txt);

  return (
    <div>
      <table>
        <tbody>
          {hunks.map((hunk, idx) => {
            const commit = commits[hunk.sha];
            return (
              <tr key={idx} className="border dark:text-green-500">
                <td className="align-top whitespace-nowrap">
                  <a
                    href={`/commits?author=${encodeURIComponent(
                      commit.author
                    )}`}
                  >
                    <b>{commit.author}</b>
                  </a>
                  {` `}
                  <a href={`/show/${commit.sha}`}>
                    <em>{commit.summary.substring(0, 20)}</em>
                  </a>
                </td>
                <td>
                  {hunk.lines.map((line, idx) => (
                    <pre key={idx}>
                      {hunk.startLine + idx}: {line}
                    </pre>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
