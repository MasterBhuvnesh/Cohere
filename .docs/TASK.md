# Repo Gaps — TASK Checklist

Scaffolding/quality gaps found in the repo. App logic (webhooks, rate limiting,
vector agent) is solid — these are the things missing around it.

## Real gaps

- [ ] **Add CI** — `.github/workflows/ci.yml` running `lint` + `tsc --noEmit` + `build` on push/PR
- [ ] **Add `README.md`** — current setup/run instructions (only `OLD.README.md` exists)
- [ ] **Add Next.js error/loading/not-found UI** in `app/`:
  - [ ] `app/error.tsx` and/or `app/global-error.tsx`
  - [ ] `app/not-found.tsx`
  - [ ] `app/loading.tsx` (Suspense fallback for async routes)
- [ ] **Add `typecheck` script** — `tsc --noEmit` in `package.json`


## Cheap high-value wins (do first)

- [ ] error/loading/not-found files
- [ ] minimal CI workflow

## TAKE IT FURTHER

Ideas to build on top of the base app.

### ADVANCED FEATURES

- [ ] Inbox and notifications: in-app feed for mentions, assignments, and status changes
- [ ] Roadmap view: timeline/Gantt visualization of projects and target dates
- [ ] Cycle analytics: burndown charts, velocity, and scope-change tracking
- [ ] Issue templates and recurring issues: standardize bug reports and rituals

### AI IMPROVEMENTS

- [ ] AI issue drafting: turn a one-line idea into a fully specced issue with acceptance criteria
- [ ] Backlog grooming agent: suggest stale issues to close and duplicates to merge
- [ ] Voice standup: speech-to-text standup notes summarized into a cycle report
- [ ] GitHub integration: link PRs to issues and update statuses on merge

### INFRASTRUCTURE AND SCALING

- [ ] Pagination: cursor-based pagination for orgs with tens of thousands of issues
- [ ] Public issue sharing: read-only public links for individual issues
- [ ] Import/export: bring in issues from CSV, Jira, or Linear export format

### MONETIZATION

- [ ] Per-seat metering: track active seats and surface usage on the billing page
- [ ] Add-on features: sell the AI agent as a standalone add-on with Clerk features
- [ ] Trials: time-boxed Pro trials for new organizations