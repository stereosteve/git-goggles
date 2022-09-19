export interface Commit {
  sha: string;
  tree: string;
  parent?: string;
  author: string;
  authorEmail: string;
  authorTime: number;
  authorTz: string;
  committer: string;
  committerEmail: string;
  committerTime: number;
  committerTz: string;
  summary: string;
  message: string;
}

export function parseCommits(raw: string) {
  let commit = {} as Commit;
  const commits: Commit[] = [];

  const lines = raw.split("\n");
  for (const line of lines) {
    if (line.startsWith("    ")) {
      if (!commit.summary) commit.summary = line.substr(4);
      commit.message += line.substr(4) + "\n";
      continue;
    }

    const fields = line.split(" ");
    switch (fields[0]) {
      case "commit":
        commit = {
          sha: fields[1],
          message: "",
        } as Commit;
        commits.push(commit);
        break;
      case "tree":
        commit.tree = fields[1];
        break;
      case "parent":
        commit.parent = fields[1];
        break;
      case "author":
        commit.authorTz = fields.pop()!;
        commit.authorTime = parseInt(fields.pop()!);
        commit.authorEmail = fields.pop()!;
        commit.author = fields.slice(1).join(" ");
        break;
      case "committer":
        commit.committerTz = fields.pop()!;
        commit.committerTime = parseInt(fields.pop()!);
        commit.committerEmail = fields.pop()!;
        commit.committer = fields.slice(1).join(" ");
        break;
      default:
        // console.log('skipping', line)
        break;
    }
  }

  return commits;
}
