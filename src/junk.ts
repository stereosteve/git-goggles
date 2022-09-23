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

const webSocket = new WebSocket(`ws://${window.location.host}/gitws`);

webSocket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  queryClient.setQueryData(data.args, data.output);
};

export function gitFire({ queryKey }: { queryKey: string[] }) {
  // todo: check ready
  webSocket.send(JSON.stringify(queryKey));
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
