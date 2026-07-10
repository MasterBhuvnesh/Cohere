"use node";

import { sign } from "node:crypto";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { action, internalAction } from "../_generated/server";

/**
 * GitHub REST client, authenticated as the GitHub App installation.
 * Node runtime because the app JWT needs an RS256 signature.
 *
 * This is the transport half of the sync layer: convex/github/sync.ts owns
 * all database reads/writes; this file only talks HTTP. Future automations
 * (two-way sync, branch creation, commit linking) add an action here plus a
 * recording mutation there.
 */

function base64url(input: Buffer | string): string {
  return (typeof input === "string" ? Buffer.from(input) : input).toString(
    "base64url"
  );
}

/** Short-lived JWT identifying the GitHub App (RS256, private key from env). */
function appJwt(): string {
  const appId = process.env.GITHUB_APP_ID;
  // Env vars often store PEMs with literal \n — restore real newlines.
  const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!appId || !privateKey) {
    throw new Error(
      "GITHUB_APP_ID / GITHUB_PRIVATE_KEY are not set on the Convex deployment"
    );
  }
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({ iat: now - 60, exp: now + 9 * 60, iss: appId })
  );
  const signature = base64url(
    sign("RSA-SHA256", Buffer.from(`${header}.${payload}`), privateKey)
  );
  return `${header}.${payload}.${signature}`;
}

async function githubFetch<T>(
  token: string,
  method: "GET" | "POST" | "PATCH",
  path: string,
  body?: unknown
): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "cohere-issue-tracker",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `GitHub ${method} ${path} failed (${response.status}): ${text.slice(0, 200)}`
    );
  }
  return (await response.json()) as T;
}

// ponytail: a fresh installation token per call (2 requests/op, tokens are
// valid 1h) — cache them in a table if rate limits ever bite.
async function installationToken(installationId: number): Promise<string> {
  const data = await githubFetch<{ token: string }>(
    appJwt(),
    "POST",
    `/app/installations/${installationId}/access_tokens`
  );
  return data.token;
}

type GithubRepo = {
  full_name: string;
  name: string;
  private: boolean;
  owner: { login: string } | null;
};

export const repositoryValidator = v.object({
  fullName: v.string(),
  owner: v.string(),
  name: v.string(),
  private: v.boolean(),
});

/**
 * Live list of repositories the org's installation can access — powers the
 * repo pickers. Auth: resolved from the caller's Clerk identity.
 */
export const listRepositories = action({
  args: {},
  returns: v.array(repositoryValidator),
  handler: async (ctx) => {
    const { installationId } = await ctx.runQuery(
      internal.github.sync.getAuthedInstallation,
      {}
    );
    const token = await installationToken(installationId);
    const data = await githubFetch<{ repositories?: GithubRepo[] }>(
      token,
      "GET",
      "/installation/repositories?per_page=100"
    );
    return (data.repositories ?? []).map((repo) => ({
      fullName: repo.full_name,
      owner: repo.owner?.login ?? repo.full_name.split("/")[0],
      name: repo.name,
      private: repo.private,
    }));
  },
});

/** Create the GitHub twin of a Cohere issue and record the link. */
export const pushIssue = internalAction({
  args: { issueId: v.id("issues"), repo: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const info = await ctx.runQuery(internal.github.sync.getIssueForSync, {
      issueId: args.issueId,
    });
    if (!info) {
      return null; // integration disconnected or issue deleted since scheduling
    }
    try {
      const token = await installationToken(info.installationId);
      const created = await githubFetch<{ number: number; html_url: string }>(
        token,
        "POST",
        `/repos/${args.repo}/issues`,
        {
          title: info.title,
          body: `${info.description ?? ""}\n\n---\n_Synced from Cohere issue **${info.identifier}**._`,
        }
      );
      await ctx.runMutation(internal.github.sync.recordGithubIssue, {
        orgId: info.orgId,
        issueId: args.issueId,
        repo: args.repo,
        number: created.number,
        url: created.html_url,
      });
    } catch (error) {
      await ctx.runMutation(internal.github.sync.recordSyncFailure, {
        orgId: info.orgId,
        issueId: args.issueId,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
    return null;
  },
});
