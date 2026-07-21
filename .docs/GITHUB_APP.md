# skarm-ai (GitHub App)

Reference for Skarm's GitHub App, the integration that keeps repositories and
Skarm issues in sync. The app is created once per deployment; after that,
every workspace connects itself with one click and picks which repositories
to grant.

## Identity

| Field | Value |
| --- | --- |
| App name | `skarm-ai` |
| Slug | `skarm-ai` (used in the install URL) |
| App ID | `4266392` |
| Owner | MasterBhuvnesh |
| Public page | https://github.com/apps/skarm-ai |

The App ID, private key, and webhook secret key off the app itself, not its
name, so renaming the app (as we did from `cohere-bhuvnesh`) does not break
JWT auth, existing installations, or webhook delivery. Only the install URL,
which is built from the slug, changes; see `GITHUB_APP_SLUG` below.

## User-facing description

Shown to users on the app page and during installation:

> Skarm is an AI-native issue tracker for teams that plan, track, and ship
> together. This app connects your repositories to Skarm so code and issues
> stay in sync. Mention an issue key like ENG-42 in a branch name, pull
> request title, or description and Skarm links the PR to that issue and
> moves it along automatically: opened PRs shift the issue to In Review,
> merged PRs mark it Done. You can also create issues in a repo directly
> from Skarm, and edits, comments, and open or close changes made on GitHub
> flow back into Skarm. The app requests read access to repository metadata
> and pull requests, plus read and write on issues for two-way sync.

## Settings reference

The Convex site URL is `NEXT_PUBLIC_CONVEX_SITE_URL` (note `.site`, not
`.cloud`). Dev deployment today is `https://bold-deer-190.convex.site`.

| Field | Value |
| --- | --- |
| Homepage URL | the app URL, e.g. `http://localhost:3000` |
| Setup URL | `<convex-site-url>/github-setup` |
| Redirect on update | unchecked (repo changes arrive via webhook) |
| Callback URL | empty (no OAuth identity is requested) |
| Request user authorization (OAuth) during install | unchecked |
| Webhook - Active | checked |
| Webhook URL | `<convex-site-url>/github-webhook` |
| Webhook secret | a long random string, also set as `GITHUB_WEBHOOK_SECRET` |

### Repository permissions

| Permission | Access | Why |
| --- | --- | --- |
| Metadata | Read-only | added automatically |
| Pull requests | Read-only | link PRs to issues, read state on merge |
| Issues | Read and write | create issue twins, two-way sync |

### Subscribed events

| Event | Why |
| --- | --- |
| Installation | know when a workspace installs or removes the app |
| Pull request | move issues to In Review on open, Done on merge |
| Issues | reflect GitHub issue edits and open/close back into Skarm |
| Issue comment | mirror GitHub comments onto the Skarm issue |

Events from bots (including the app itself) are ignored to prevent echo loops.

## Environment variables (Convex deployment)

Set with `npx convex env set <NAME> <value>`. Never commit these values.

| Variable | Purpose |
| --- | --- |
| `GITHUB_APP_ID` | numeric App ID, used to sign the app JWT |
| `GITHUB_APP_SLUG` | slug in the install URL: `github.com/apps/<slug>/installations/new`. Must be `skarm-ai`. |
| `GITHUB_PRIVATE_KEY` | the app private key, base64-encoded (PowerShell truncates multiline values, so store base64 and decode at runtime) |
| `GITHUB_WEBHOOK_SECRET` | HMAC secret; must match the app's Webhook secret |

Production (`bright-wildcat-654`) has its own copy of every variable. After a
rename or key rotation, update prod too: `npx convex env set NAME value --prod`.

### Encoding the private key

```powershell
$pem = Get-Content C:\path\to\skarm-ai.private-key.pem -Raw
$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($pem))
npx convex env set GITHUB_PRIVATE_KEY $b64
```

Keep the `.pem` outside the repo (never in `public/`, which is web-served).
`.gitignore` already ignores `*.pem`.

## How it works

1. Connect: a workspace admin clicks Connect (Settings, Integrations). Skarm
   mints a single-use nonce and sends the admin to
   `github.com/apps/skarm-ai/installations/new?state=<nonce>`.
2. Install: the admin picks repositories on GitHub's install screen. GitHub
   redirects to the Setup URL with an `installation_id`; Skarm binds the
   installation to the org via the nonce and fetches the repo list from the
   API (so the list is never empty due to a webhook race).
3. Tokens: for each API call, Skarm signs an app JWT (RS256) with the private
   key, exchanges it for a short-lived installation token, and calls the
   GitHub REST API.
4. Projects connect repos: a project's Properties panel lists connected
   repositories and offers a live-fetched picker.
5. Issue creation: when a new issue's project has connected repos, the create
   dialog offers "Also create this issue on GitHub". The issue is created in
   Skarm first, then a scheduled action creates the GitHub twin and records
   the link.
6. PR linking: mention an issue key like ENG-42 in a branch, PR title, or
   body. Opened PRs move the issue to In Review, merged PRs to Done.
7. Two-way sync: editing, closing, reopening, or commenting on the linked
   GitHub issue flows back into Skarm. A footer on the synced body
   (`Synced from Skarm issue ...`) is stripped on inbound edits, and bot
   senders are skipped to avoid loops.
8. System actor: all automated events appear in timelines and the inbox as a
   dedicated GitHub actor with the GitHub logo, never as a workspace user.
   Sync failures are recorded on the timeline too.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Connect button 404s | `GITHUB_APP_SLUG` is wrong. It must equal the current slug (`skarm-ai`); the old slug does not redirect. |
| "GitHub is not connected" on issue create | the workspace has not installed the app, or the integration is disabled in Settings. |
| Repo list stuck empty after connect | the install webhook raced the setup redirect; the settings self-heal effect and manual Refresh re-fetch from the API. |
| JWT auth fails / DECODER errors | `GITHUB_PRIVATE_KEY` is not valid base64 of the PEM, or was truncated; re-encode and set again. |
| Webhook returns 401 | `GITHUB_WEBHOOK_SECRET` does not match the app's Webhook secret. |
| Changes not syncing back from GitHub | confirm the Issues and Issue comment events are subscribed on the app. |

## Related docs

- Full setup: [`.docs/CONFIGURE.md`](CONFIGURE.md)
- Backend transport and sync split: `convex/github/` (`client.ts`, `sync.ts`)
- Integration settings and install flow: `convex/integrations.ts`
