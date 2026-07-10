# Configuring the GitHub Integration

Cohere's GitHub integration is a [GitHub App](https://docs.github.com/en/apps).
Creating the app is a one-time step per deployment; after that, every
workspace connects itself with one click (Settings → Integrations → Connect)
and picks which repositories to grant.

## 1. Create the GitHub App

GitHub → Settings → Developer settings → GitHub Apps → **New GitHub App**.

Your Convex site URL is the `NEXT_PUBLIC_CONVEX_SITE_URL` value in
`.env.local` (e.g. `https://your-deployment.convex.site` — note `.site`,
not `.cloud`).

| Field | Value |
| --- | --- |
| GitHub App name | `Cohere` (any unique name works — only the slug matters) |
| Description | see below |
| Homepage URL | your app URL, e.g. `http://localhost:3000` |
| Callback URL | leave empty (no OAuth identity is requested) |
| Request user authorization (OAuth) during installation | unchecked |
| Enable Device Flow | unchecked |
| Setup URL | `<convex-site-url>/github-setup` |
| Redirect on update | **unchecked** (repo changes sync via webhook) |
| Webhook → Active | checked |
| Webhook URL | `<convex-site-url>/github-webhook` |
| Webhook secret | a long random string — you set the same value on Convex below |
| Repository permissions | **Pull requests: Read-only** (Metadata read is added automatically) |
| Subscribe to events | **Pull request** (installation events are delivered automatically) |
| Where can this app be installed? | "Only on this account" is fine; "Any account" if other GitHub orgs need it |

Suggested description:

> Cohere is an AI-native issue tracker for teams that plan, track, and ship
> together. This app links pull requests to Cohere issues: mention an issue
> key like ENG-42 in a branch name, PR title, or description and Cohere
> attaches the PR to that issue and keeps its status in sync — opened PRs
> move issues to In Review, merged PRs mark them Done.

Generate a webhook secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 2. Set Convex environment variables

The app slug is in the app page URL: `github.com/settings/apps/<slug>`.

```bash
npx convex env set GITHUB_APP_SLUG <slug>
npx convex env set GITHUB_WEBHOOK_SECRET <webhook secret from step 1>
# Production only — where /github-setup redirects users after install.
# Defaults to http://localhost:3000 when unset.
npx convex env set SITE_URL https://your-app.example.com
```

## 3. Connect a workspace

In Cohere: Settings → Integrations → **Connect** (workspace admins only).
GitHub opens its install screen where you select one, several, or all
repositories, then redirects you back to the settings page. The granted
repositories appear as chips and can be changed any time from the GitHub
App's installation settings — the list re-syncs automatically.

## How it works

- **Connect** mints a single-use nonce (valid 15 minutes) bound to your
  workspace and user, and sends you to
  `github.com/apps/<slug>/installations/new?state=<nonce>`.
- After you pick repositories, GitHub redirects to
  `<convex-site>/github-setup?installation_id=…&state=<nonce>`. Cohere
  verifies the nonce and stores the installation id against the workspace —
  that's the entire binding; no tokens or private keys are stored.
- GitHub then delivers webhooks (HMAC-signed with the app secret) to
  `<convex-site>/github-webhook`:
  - `installation` / `installation_repositories` events keep the granted
    repository list in sync (and disconnect the workspace if the app is
    uninstalled on GitHub).
  - `pull_request` events are scanned for issue identifiers (`ENG-42`) in
    the branch name, PR title, and body. Each referenced issue gets the PR
    attached (visible on the issue's detail sidebar), and statuses move:
    opened/reopened PR → **In Review** (from backlog/todo/in progress),
    merged PR → **Done**. Every transition writes the activity log and
    notifies the issue's creator and assignee in their inbox.
- The enable/disable switch in Settings → Integrations pauses event
  processing without disconnecting; Disconnect removes the binding but
  keeps already-linked PRs on their issues.
- Optionally, link a repository to a project from the project's Properties
  panel — the dropdown lists the granted repos and shows who connected it.
