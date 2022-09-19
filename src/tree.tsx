import { useLoaderData } from "react-router-dom";

export function GitTree() {
  const txt = useLoaderData() as string;
  return (
    <div>
      tree
      <pre>{txt}</pre>
    </div>
  );
}
