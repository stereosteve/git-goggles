import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef } from "react";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import { tw } from "twind";
import { callGit } from "./junk";
import { Commit, DiffFile, parseDiff } from "./parseGit";

export function GitLog() {
  const log = useLoaderData() as Commit[];
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);

  const currentSha = location.hash.replace("#", "");

  const currentCommit = useMemo(() => {
    if (!currentSha) return log[0];
    return log.find((c) => c.sha == currentSha);
  }, [log, currentSha]);

  return (
    <div className={tw`flex absolute border top-12 bottom-12 w-full`}>
      <div
        className={tw`whitespace-nowrap overflow-y-scroll overflow-x-hidden w-1/3`}
      >
        {log.map((commit) => (
          <div
            key={commit.sha}
            style={{
              background: commit == currentCommit ? "lightyellow" : "",
            }}
          >
            <CommitUI commit={commit} />
          </div>
        ))}
      </div>
      <div ref={panelRef} className={tw`flex-grow w-2/3 overflow-scroll`}>
        {currentCommit && <DiffUI commit={currentCommit} />}
      </div>
    </div>
  );
}

export function CommitUI({ commit }: { commit: Commit }) {
  const commitDate = new Date(commit.authorTime * 1000);
  const navigate = useNavigate();

  return (
    <div className={tw`p-2 border whitespace-nowrap`}>
      <a className={tw`block font-bold`} href={`#${commit.sha}`}>
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

      <div className={tw`text-xs`}>
        <a href={`/commit/${commit.sha}`}>show</a>
        <span> &middot; </span>
        <a href={`/stuff/tree/${commit.sha}`}>browse</a>
      </div>
    </div>
  );
}

export function DiffUI({ commit }: { commit: Commit }) {
  const parent = commit.parent
    ? `${commit.sha}^`
    : "4b825dc642cb6eb9a060e54bf8d69288fbee4904";

  const args = ["diff", "--no-prefix", parent, commit.sha];

  const { data } = useQuery<DiffFile[]>(args, async function () {
    const raw = await callGit(args);
    return parseDiff(raw);
  });

  if (!data) return null;

  return (
    <div>
      {data.map((diffFile, idx) => (
        <div
          key={idx}
          className={tw`bg-white mx-2 mb-8 border-2 border-blue-400 shadow-xl`}
          style={{ marginBottom: 20 }}
        >
          <div className={tw`p-3 bg-blue-50 flex justify-between`}>
            <div className="font-bold">{diffFile.filename}</div>
            <div>
              {!diffFile.isNew && (
                <a href={`/blob/${commit.parent}/${diffFile.filename}`}>
                  before
                </a>
              )}
              {!diffFile.isNew && !diffFile.isDeleted && <span> / </span>}
              {!diffFile.isDeleted && (
                <a href={`/blob/${commit.sha}/${diffFile.filename}`}>after</a>
              )}
            </div>
          </div>
          <div>
            {diffFile.lines.map((line, idx) => (
              <pre key={idx} className={tw`${diffLineClass(line)}`}>
                <span className={tw`select-none text-gray-500`}>
                  {line.charAt(0)}
                </span>
                {line.substring(1)}
              </pre>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function diffLineClass(line: string) {
  switch (line.charAt(0)) {
    case "+":
      return "bg-green-50";
    case "-":
      return "bg-red-50";
    case "@":
      return "bg-blue-200 select-none";
  }
  return "";
}
