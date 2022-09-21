import useSWRImmutable from "swr/immutable";

export async function callGit(args: string[]) {
  const url = buildUrl(args);
  const resp = await fetch(url);
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

export function useGit(args: string[]) {
  return useSWRImmutable(buildUrl(args), (u) => fetch(u).then((r) => r.text()));
}
