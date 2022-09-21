import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  Link,
  Outlet,
  RouterProvider,
  ScrollRestoration,
} from "react-router-dom";
import { parseCommits } from "./parseGit";
import { GitLog } from "./log";
import { GitTree } from "./tree";
import { callGit } from "./junk";
import { GitBlob } from "./blob";
import { GitBlame } from "./blame";
import { SWRConfig } from "swr";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <Link to="/tree/HEAD">Tree</Link> <Link to="/log">Log</Link>
        <hr />
        <Outlet />
        <ScrollRestoration />
      </div>
    ),
    children: [
      {
        path: "/tree/:ref/*",
        element: <GitTree />,
        loader: async function ({ params }) {
          const ref = params.ref || "HEAD";
          const prefix = params["*"] || ".";
          const txt = await callGit(["ls-tree", "-l", ref, prefix + "/"]);
          return txt;
        },
      },
      {
        path: "/blob/:ref/*",
        element: <GitBlob />,
        loader: async function ({ params }) {
          const { ref, "*": path } = params;
          const txt = await callGit(["show", `${ref}:${path}`]);
          return txt;
        },
      },
      {
        path: "/blame/:ref/*",
        element: <GitBlame />,
        loader: async function ({ params }) {
          const { ref, "*": path } = params;
          const txt = await callGit(["blame", "-p", ref!, path!]);
          return txt;
        },
      },
      {
        path: "/log",
        element: <GitLog />,
        loader: async function ({ request, params }) {
          const txt = await callGit(["log", "--format=raw", "-n", "1000"]);
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
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
