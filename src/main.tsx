import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { parseCommits } from "./parseGit";
import { GitLog } from "./log";
import { GitTree } from "./tree";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello world!</div>,
  },
  {
    path: "/tree",
    element: <GitTree />,
    loader: async function ({ params }) {
      const txt = await callGit(["ls-tree", "HEAD"]);
      return txt;
    },
  },
  {
    path: "/log",
    element: <GitLog />,
    loader: async function ({ request, params }) {
      const txt = await callGit(["log", "--format=raw"]);
      const commits = parseCommits(txt);
      return commits;
    },
  },
  // {
  //   path: "/log/:ref/*",
  //   element: <GitLog />,
  //   loader: async function ({ request, params }) {
  //     console.log(params);
  //     return callGit(["log", "--format=raw"]);
  //   },
  // },
]);

async function callGit(args: string[]) {
  console.log("git", args.join(" "));
  const resp = await fetch(`/git?args=${encodeURIComponent(args.join(","))}`);
  const txt = await resp.text();
  if (resp.status != 200) {
    throw new Error(`${resp.status}: ${resp.text}`);
  }
  return txt;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
