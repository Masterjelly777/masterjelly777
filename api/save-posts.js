import { Octokit } from "@octokit/rest";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { posts } = req.body;

  if (!posts) {
    return res.status(400).json({ error: "Missing posts data" });
  }

  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const owner = "Masterjelly777";  // your GitHub username
    const repo = "masterjelly777";   // your GitHub repo name
    const path = "posts.json";       // file to update

    // Get current file SHA
    const { data: file } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    // Update file
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: "Update posts",
      content: Buffer.from(JSON.stringify(posts, null, 2)).toString("base64"),
      sha: file.sha,
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: "GitHub error", details: err.message });
  }
      }
