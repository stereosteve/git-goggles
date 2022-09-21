import { useEffect, useMemo, useState } from "react";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import { callGit } from "./junk";
import { Commit, parseDiff } from "./parseGit";

export function GitLog() {
  const log = useLoaderData() as Commit[];
  const location = useLocation();
  const [rawDiff, setRawDiff] = useState("");

  const commit = useMemo(() => {
    const currentSha = location.hash.replace("#", "");
    return log.find((c) => c.sha == currentSha);
  }, [location]);

  useEffect(() => {
    if (!commit) return;
    const parent = commit.parent || "4b825dc642cb6eb9a060e54bf8d69288fbee4904";
    callGit(["diff", "--no-prefix", parent, commit.sha]).then((txt) => {
      setRawDiff(txt);
      const diff = parseDiff(txt);
      console.log(diff);
    });
  }, [commit]);

  useEffect(() => {
    console.log("location", location, commit);
  }, [location]);

  return (
    <div style={{ display: "flex", whiteSpace: "nowrap" }}>
      <div>
        {log.map((commit) => (
          <div key={commit.sha}>
            <CommitUI commit={commit} />
          </div>
        ))}
      </div>
      <div>
        <pre>{rawDiff}</pre>
      </div>
    </div>
  );
}

export function CommitUI({ commit }: { commit: Commit }) {
  const commitDate = new Date(commit.authorTime * 1000);
  const navigate = useNavigate();

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
