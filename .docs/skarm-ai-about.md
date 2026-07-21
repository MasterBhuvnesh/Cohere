# Skarm for GitHub

**Ship at the speed of thought.** Skarm is an AI-native issue tracker for
teams that plan, track, and ship together. This app keeps your code and your
issues in sync, so nothing falls through the cracks between a pull request and
the work it closes.

## What it does

Connect your repositories once, and Skarm does the rest:

- **Links pull requests to issues automatically.** Mention an issue key like
  `ENG-42` in a branch name, pull request title, or description, and Skarm
  attaches the PR to that issue.
- **Moves work along on its own.** Open a linked PR and the issue slides to
  In Review. Merge it and the issue is marked Done. No manual status updates.
- **Creates GitHub issues straight from Skarm.** File an issue in Skarm and
  have its twin created in the connected repository, linked both ways.
- **Syncs both directions.** Edits, comments, and open or close actions made
  on GitHub flow back into Skarm, and changes in Skarm mirror out to GitHub.
- **Keeps the timeline honest.** Every automated update appears as a GitHub
  actor on the issue timeline and in your inbox, never disguised as a
  teammate.

## Why teams use it

- **One source of truth.** Engineers live in GitHub, everyone else lives in
  Skarm. This app keeps both current without anyone copying statuses by hand.
- **Zero busywork.** Status changes happen as a natural side effect of
  opening and merging pull requests.
- **Fast to set up.** One click to install, pick the repositories you want to
  grant, and you are connected. No per-project webhook wiring.

## Permissions, and why

Skarm asks for the minimum it needs:

- **Repository metadata** (read): to identify your repositories.
- **Pull requests** (read): to link PRs and read their state on merge.
- **Issues** (read and write): to create issue twins and keep them in sync
  both ways.

Skarm never requests access to your source code contents.

## Getting started

1. Install the app and choose which repositories to grant.
2. In Skarm, open Settings, Integrations, and connect your workspace.
3. Connect repositories to a project, then reference issue keys like `ENG-42`
   in your branches and pull requests.

That is it. Skarm handles the linking and status updates from there.

Learn more at your Skarm workspace.
