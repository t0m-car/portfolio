import "server-only";

const USERNAME = "t0m-car";

const REVALIDATE_SECONDS = 600;

export type LatestCommit = {
  repo: string;
  message: string;
  dateISO: string;
  url: string;
};

type PushEvent = {
  type: string;
  repo: { name: string };
  created_at: string;
  payload: { head?: string; ref?: string };
};

type CommitResponse = {
  commit?: { message?: string; author?: { date?: string } };
  html_url?: string;
};

function ghHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    // GitHub rejects requests without a User-Agent.
    "User-Agent": "tomca.be",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export async function getLatestPublicCommit(): Promise<LatestCommit | null> {
  try {
    const eventsRes = await fetch(
      `https://api.github.com/users/${USERNAME}/events/public?per_page=30`,
      { headers: ghHeaders(), next: { revalidate: REVALIDATE_SECONDS } },
    );
    if (!eventsRes.ok) {
      const rateLimited =
        eventsRes.status === 403 &&
        eventsRes.headers.get("x-ratelimit-remaining") === "0";
      console.warn(
        rateLimited
          ? "[github] rate limit"
          : `[github] events ${eventsRes.status}`,
      );
      return null;
    }

    const events = (await eventsRes.json()) as PushEvent[];
    const push = events.find(
      (e) => e.type === "PushEvent" && Boolean(e.payload?.head),
    );
    if (!push?.payload.head) return null;

    const fullRepo = push.repo.name;
    const sha = push.payload.head;

    const commitRes = await fetch(
      `https://api.github.com/repos/${fullRepo}/commits/${sha}`,
      { headers: ghHeaders(), next: { revalidate: REVALIDATE_SECONDS } },
    );
    if (!commitRes.ok) {
      console.warn(`[github] commit ${commitRes.status}`);
      return null;
    }

    const commit = (await commitRes.json()) as CommitResponse;

    return {
      repo: fullRepo.split("/")[1] ?? fullRepo,
      message: (commit.commit?.message ?? "").split("\n")[0].trim(),
      dateISO: commit.commit?.author?.date ?? push.created_at,
      url: commit.html_url ?? `https://github.com/${fullRepo}/commit/${sha}`,
    };
  } catch (err) {
    console.warn("[github] getLatestPublicCommit failed", err);
    return null;
  }
}
