import { useLoaderData } from "react-router-dom";

export function GitBlob() {
  const txt = useLoaderData() as string;
  return <pre>{txt}</pre>;
}
