import useSWR from "swr";

function gitFetcher() {
  const args = Array.from(arguments).join(",");
  console.log("git", args.replace(",", " "));
  return fetch(`/git?args=${encodeURIComponent(args)}`).then((r) => r.text());
}

function useGit(args: string[]) {
  return useSWR(args, gitFetcher);
}

function App() {
  const { data } = useGit(["ls-tree", "HEAD"]);

  return (
    <div>
      <pre>{data}</pre>
    </div>
  );
}

export default App;
