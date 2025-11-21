import { Octokit } from "@octokit/rest";

export default async function handler(req, res) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = "Masterjelly777";
  const repo = "masterjelly777";
  const path = "posts.json";

  let logs = []; // collect server logs to return to front-end

  try {
    // ================= GET POSTS =================
    if (req.method === "GET") {
      try {
        const { data: file } = await octokit.repos.getContent({ owner, repo, path });
        const content = Buffer.from(file.content, "base64").toString();
        logs.push("Posts loaded successfully");
        return res.status(200).json({ posts: JSON.parse(content), logs });
      } catch (err) {
        if (err.status === 404) {
          logs.push("Posts file not found, returning empty array");
          return res.status(200).json({ posts: [], logs });
        }
        logs.push("GitHub GET error: " + err.message);
        return res.status(500).json({ error: "GitHub GET error", details: err.message, logs });
      }
    }

    // ================= POST / SAVE POSTS =================
    if (req.method === "POST") {
      const { posts } = req.body;
      if (!posts) {
        logs.push("Missing posts data");
        return res.status(400).json({ error: "Missing posts data", logs });
      }

      let sha;
      try {
        const { data: file } = await octokit.repos.getContent({ owner, repo, path });
        sha = file.sha;
        logs.push("Existing posts.json found, SHA: " + sha);
      } catch (err) {
        if (err.status !== 404) {
          logs.push("GitHub GET SHA error: " + err.message);
          return res.status(500).json({ error: "GitHub GET SHA error", details: err.message, logs });
        }
        logs.push("posts.json does not exist yet, will create a new file");
        sha = undefined;
      }

      try {
        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path,
          message: sha ? "Update posts" : "Create posts.json",
          content: Buffer.from(JSON.stringify(posts, null, 2)).toString("base64"),
          sha,
        });
        logs.push("Posts saved successfully");
        return res.status(200).json({ success: true, logs });
      } catch (err) {
        logs.push("GitHub POST error: " + err.message);
        return res.status(500).json({ error: "GitHub POST error", details: err.message, logs });
      }
    }

    // ================= METHOD NOT ALLOWED =================
    res.setHeader("Allow", ["GET", "POST"]);
    logs.push(`Method ${req.method} not allowed`);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed`, logs });

  } catch (err) {
    logs.push("Serverless function failed: " + err.message);
    return res.status(500).json({ error: "Serverless function failed", details: err.message, logs });
  }
}
        repo,
        path,
        message: sha ? "Update posts" : "Create posts.json",
        content: Buffer.from(JSON.stringify(posts, null, 2)).toString("base64"),
        sha, // undefined if new file
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
