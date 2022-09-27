import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useMemo, useRef } from "react";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import { callGit } from "../junk";
import { Commit, DiffFile, parseDiff } from "../parseGit";

export function GitLog() {
  const log = useLoaderData() as Commit[];
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);

  const currentSha = location.hash.replace("#", "");

  const currentCommit = useMemo(() => {
    if (!currentSha) return log[0];
    return log.find((c) => c.sha == currentSha);
  }, [log, currentSha]);

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = 0;
    }
  }, [currentCommit]);

  return (
    <div className={`flex absolute  top-12 bottom-0 w-full`}>
      <div
        className={`whitespace-nowrap overflow-y-scroll overflow-x-hidden w-1/4 border-r`}
      >
        {log.map((commit) => (
          <div
            key={commit.sha}
            // className={`${}`}
            className={clsx({
              "bg-yellow-100 dark:bg-yellow-600": commit == currentCommit,
            })}
          >
            <CommitUI commit={commit} />
          </div>
        ))}
      </div>
      <div ref={panelRef} className={`flex-grow w-3/4 overflow-scroll`}>
        {currentCommit && <DiffUI commit={currentCommit} />}
      </div>
    </div>
  );
}

export function CommitUI({ commit }: { commit: Commit }) {
  const commitDate = new Date(commit.authorTime * 1000);
  const navigate = useNavigate();

  return (
    <div className={`p-3 border-t dark:border-black whitespace-nowrap`}>
      <a className={`block font-bold`} href={`#${commit.sha}`}>
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

      <div className={`text-xs`}>
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
    <div className="p-2">
      {data.map((diffFile, idx) => (
        <div
          key={idx}
          className={`bg-white dark:bg-gray-700 mx-2 mb-8 border-2 border-blue-400 shadow-xl`}
          style={{ marginBottom: 20 }}
        >
          <div
            className={`p-3 bg-blue-50 dark:bg-blue-700 flex justify-between`}
          >
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
              <pre key={idx} className={`${diffLineClass(line)}`}>
                <span className={`select-none text-gray-500`}>
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
      return "bg-green-50 dark:bg-green-900";
    case "-":
      return "bg-red-50  dark:bg-red-900";
    case "@":
      return "bg-blue-200 dark:bg-blue-800 select-none";
  }
  return "";
}
