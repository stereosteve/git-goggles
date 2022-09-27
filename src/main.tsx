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
import { QueryClientProvider } from "@tanstack/react-query";
import { parseCommits, parseTree } from "./parseGit";
import { GitLog } from "./screens/log";
import { GitTree } from "./screens/tree";
import { callGit, queryClient } from "./junk";
import { GitBlob } from "./screens/blob";
import { GitBlame } from "./screens/blame";
import { Home } from "./screens/home";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <div
          className={`bg-green-50 dark:bg-gray-900 h-12 flex items-center px-4 space-x-2`}
        >
          <Link to="/tree/HEAD">Tree</Link> <Link to="/log">Log</Link>
        </div>

        <Outlet />
        <ScrollRestoration />
      </div>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/tree/:ref/*",
        element: <GitTree />,
        loader: async function ({ params }) {
          const ref = params.ref || "HEAD";
          const prefix = params["*"] || ".";
          const txt = await callGit(["ls-tree", "-l", ref, prefix + "/"]);
          return parseTree(txt);
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
  // <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
  // </React.StrictMode>
);
