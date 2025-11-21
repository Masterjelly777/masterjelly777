import { Octokit } from "@octokit/rest";

export default async function handler(req, res) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = "Masterjelly777";
  const repo = "masterjelly777";
  const path = "posts.json";

  try {
    if (req.method === "GET") {
      try {
        const { data: file } = await octokit.repos.getContent({ owner, repo, path });
        const content = Buffer.from(file.content, "base64").toString();
        return res.status(200).json({ posts: JSON.parse(content) });
      } catch (err) {
        if (err.status === 404) return res.status(200).json({ posts: [] });
        throw err;
      }
    }

    if (req.method === "POST") {
      if (!req.body) return res.status(400).json({ error: "Missing request body" });
      const { posts } = req.body;
      if (!posts) return res.status(400).json({ error: "Missing posts data" });

      let sha;
      try {
        const { data: file } = await octokit.repos.getContent({ owner, repo, path });
        sha = file.sha; // existing file
      } catch (err) {
        if (err.status !== 404) throw err;
        sha = undefined; // file doesn’t exist yet
      }

      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: sha ? "Update posts" : "Create posts.json",
        content: Buffer.from(JSON.stringify(posts, null, 2)).toString("base64"),
        sha,
      });

      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("GitHub error:", err);
    return res.status(500).json({ error: "GitHub error", details: err.message });
  }
        }
          
