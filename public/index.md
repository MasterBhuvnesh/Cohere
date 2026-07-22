# Skarm

**Ship at the speed of thought.**

Skarm is an AI-native issue tracker for teams that plan, track, and ship
together. It combines a fast, keyboard-first workspace with an AI agent, a
visual dependency graph, scheduled email digests, and two-way GitHub and
Figma sync. It is a multi-tenant SaaS built with Next.js, Convex, and Clerk,
with real-time updates across every client.

- Home: /
- Pricing: /pricing (markdown: /pricing.md)
- Sign up: /sign-up
- Sign in: /sign-in
- LLM summary: /llms.txt
- Source: https://github.com/MasterBhuvnesh/skarm

## Who it is for

Product and engineering teams who want the speed of a keyboard-first tool
without giving up structure. Skarm suits a single team tracking bugs and
features, or a whole organization running multiple teams, projects, and
sprints in parallel.

## Core concepts

- **Organization (workspace).** The top-level tenant. Every organization is
  a Clerk organization; billing, members, and all data are scoped to it.
- **Team.** A group inside an organization with its own board, cycles, and
  issue key prefix. Issues are numbered per team, shown as keys like
  `ENG-42` or `DESIGN-7`.
- **Issue.** The core unit of work: title, description, status, priority,
  assignee, estimate, due date, labels, and relations.
- **Project.** A cross-team initiative that groups issues toward a goal, with
  a status, lead, target date, and live progress.
- **Cycle.** A time-boxed sprint for a team, auto-numbered, with burndown and
  velocity analytics.

## Features

### Issues and boards

- Full issue tracking with six statuses (Backlog, Todo, In Progress, In
  Review, Done, Canceled), five priority levels, assignees, estimates, due
  dates, and labels.
- A Kanban board with drag and drop and fractional sort ordering; moves sync
  to every client instantly.
- A list view grouped by status, and cursor-paginated queries with cheap
  CSS virtualization so large workspaces stay fast.
- Team-scoped issue keys with per-team numbering.
- A command palette (Cmd+K) and single-key shortcuts for keyboard-first
  navigation and actions.

### Search and duplicate detection

- Full-text search over issue titles and descriptions, with search on both
  the list and board views, showing why each result matched.
- A duplicate warning at creation: as you type an issue title, Skarm searches
  the workspace and surfaces similar existing issues before you file a twin.
- Semantic duplicate detection for the AI agent, powered by vector
  embeddings on every issue.

### Collaboration

- Comments with @mentions and a full activity feed on every issue.
- Emoji reactions on comments, with tooltips showing who reacted.
- One level of reply threads, so discussions stay organized.
- An inbox with tabbed notifications (All, Mentions, Assigned, Status,
  GitHub) and per-tab unread counts, plus a live unread badge in the sidebar.
- Sub-issues and issue relations (blocks, blocked by, related, duplicate of).
- File attachments backed by Convex storage.
- Live presence, so you can see who else is viewing the same issue.
- Public issue sharing: read-only links with an Open Graph preview card for
  unfurls and print-to-PDF export, revocable instantly.

### Notifications and email digests

- Per-channel notification preferences: toggle mentions, assignments, status
  changes, and GitHub activity independently.
- Scheduled email digests delivered on your own schedule: choose morning,
  evening, or any time; daily, weekly, or specific weekdays; and which
  sections to include (assigned to you, in progress, mentions, needs focus).
- Digests are delivered in each member's local timezone, and empty digests
  are skipped so you only get mail when there is something to see.

### Projects and cycles

- Projects group issues across teams with a status, lead, target date, and
  live progress.
- Cycles are time-boxed sprints per team, auto-numbered with current-cycle
  tracking.
- Cycle analytics: a burndown chart with an ideal guideline, velocity across
  recent cycles, and scope-change tracking (added and removed points),
  reconstructed from the activity log.
- A dependency graph: a canvas that maps a project or cycle's issues as nodes
  with their blocks, related, and duplicate relations as directed edges. Drag
  issues in, draw links, auto-arrange by blocking depth, and layouts persist
  per scope.

### Issue templates and recurring issues

- Per-team templates prefill an issue's title, description, priority, and
  labels.
- Recurring issues (rituals) like weekly standups are created automatically
  on a daily, weekdays, weekly, or monthly cadence.

### AI agent (Pro and Enterprise)

- A workspace-aware chat agent with org-scoped tools: it can look up teams,
  members, projects, cycles, and issues, run reports, search (full-text and
  semantic), and create or update issues.
- AI issue drafting: turn a one-line idea into a full spec with acceptance
  criteria, priority, estimate, labels, sub-issues, and relations to real
  existing issues, with adjustable length and a rephrase option.
- Triage assistance: suggested priority and labels for new issues, and
  duplicate detection before work is duplicated.
- Chat and drafting share one daily allowance on Pro and are unlimited on
  Enterprise.

### Integrations

**GitHub** (one-click GitHub App install per workspace)

- Connect repositories on GitHub's install screen; the repo list is pulled
  from the API with no manual webhook setup.
- Projects connect one or more repositories.
- Reference an issue key like `ENG-42` in a branch, pull request title, or
  description and Skarm links the PR to that issue. Opened PRs move the issue
  to In Review; merged PRs mark it Done.
- Create GitHub issues directly from Skarm, and have edits, comments, and
  open or close actions on GitHub flow back into Skarm (two-way sync).
- Automated events appear as a dedicated GitHub actor in the timeline and
  inbox, never disguised as a teammate.

**Figma** (OAuth per workspace)

- Attach designs to issues by pasting a Figma link, or have figma.com URLs in
  descriptions and comments auto-detected.
- Live preview with the design name, a rendered thumbnail, and an
  "edited X ago" freshness stamp.
- Post issue comments to the linked design, and push a resource into Figma
  Dev Mode that links back and stays in sync.

### Billing and multi-tenancy

- Every workspace is a Clerk organization; users, memberships, and
  subscriptions sync automatically.
- Two-layer plan gating: the UI reflects the plan, and the server enforces
  it, so free-tier limits on seats, projects, and issues are authoritative.

## Pricing

| Plan | Members | Projects | Issues | AI agent | Support |
| --- | --- | --- | --- | --- | --- |
| Free | 3 | 2 | 100 | No | No |
| Pro ($20/mo) | 10 (+$10/seat) | Unlimited | Unlimited | 50 msgs/user/day | No |
| Enterprise ($99/mo) | Unlimited | Unlimited | Unlimited | Unlimited | Yes |

Full details: /pricing (markdown: /pricing.md).

## Technology

- **Frontend:** Next.js (App Router) with shadcn/ui and Tailwind CSS.
- **Backend:** Convex, a reactive database and function platform that pushes
  real-time updates to every client.
- **Auth and billing:** Clerk, providing organizations, authentication, and
  B2B subscription billing.
- **AI:** an embedding model for semantic search and duplicate detection, and
  a chat model powering the agent, drafting, and triage.

## Getting started

1. Create an account at /sign-up.
2. Create an organization (your workspace).
3. Create a team; its key becomes your issue prefix (for example ENG).
4. Start filing issues, or connect GitHub and Figma from Settings.

## Links

- [Home](/)
- [Pricing](/pricing)
- [Sign up](/sign-up)
- [Sign in](/sign-in)
- [llms.txt](/llms.txt)
- [Source repository](https://github.com/MasterBhuvnesh/skarm)
