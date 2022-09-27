import { QueryClient, QueryFunctionContext } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  },
});

///////
// websocket stuff

let ws: WebSocket;

function connect() {
  ws = new WebSocket(`ws://${window.location.host}/gitws`);

  ws.onopen = function () {
    console.log("ws open");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    queryClient.setQueryData(data.args, data.output);
  };

  ws.onclose = function (e) {
    console.log("ws close", e.reason);
    setTimeout(connect, 1000);
  };

  ws.onerror = function (err) {
    console.error(err);
    ws.close();
  };
}

connect();

export function gitFire({ queryKey }: { queryKey: string[] }) {
  // todo: check ready
  ws.send(JSON.stringify(queryKey));
  return "";
}

/////////
// http stuff
export async function callGit(args: string[], ctx?: QueryFunctionContext) {
  const url = buildUrl(args);
  const resp = await fetch(url, {
    // @ts-ignore
    priority: "low",
    signal: ctx?.signal,
  });
  const txt = await resp.text();
  if (resp.status != 200) {
    throw new Error(`${resp.status}: ${txt}`);
  }
  return txt;
}

function buildUrl(args: string[]) {
  console.log("git", args.join(" "));
  const searchParams = new URLSearchParams();
  for (let arg of args) {
    searchParams.append("args", arg);
  }
  return `/git?${searchParams.toString()}`;
}
