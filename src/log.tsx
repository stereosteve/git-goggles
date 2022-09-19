import { useLoaderData } from "react-router-dom";
import { Commit } from "./parseGit";

export function GitLog() {
  const log = useLoaderData() as Commit[];

  return (
    <div>
      <h1>git log 2</h1>
      <pre>
        {log.map((commit) => (
          <div key={commit.sha}>
            <CommitUI commit={commit} />
          </div>
        ))}
      </pre>
    </div>
  );
}

export function CommitUI({ commit }: { commit: Commit }) {
  const commitDate = new Date(commit.authorTime * 1000);
  return (
    <div className="p-2 border whitespace-nowrap">
      <a className="block font-bold" href={`#${commit.sha}`}>
        {commit.summary}
      </a>

      <div>
        <a
          href={`?author=${encodeURIComponent(commit.author)}`}
          title={commit.authorEmail}
        >
          {commit.author}
        </a>
        <span> &middot; </span>
        <span>
          {commitDate.toLocaleDateString()} {commitDate.toLocaleTimeString()}
        </span>
      </div>

      <div className="text-xs">
        <a href={`/commit/${commit.sha}`}>show</a>
        <span> &middot; </span>
        <a href={`/stuff/tree/${commit.sha}`}>browse</a>
      </div>
    </div>
  );
}
