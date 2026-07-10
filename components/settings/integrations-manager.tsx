"use client";

import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { formatRelativeTime } from "@/components/issue-detail/format";
import { GithubIcon } from "@/components/shared/github-icon";

export function IntegrationsManager() {
  const data = useQuery(api.integrations.get);
  const beginInstall = useMutation(api.integrations.beginInstall);
  const setEnabled = useMutation(api.integrations.setEnabled);
  const disconnect = useMutation(api.integrations.disconnect);
  const [connecting, setConnecting] = useState(false);

  const onError = (error: unknown) => {
    setConnecting(false);
    toast.error(error instanceof Error ? error.message : "Something went wrong");
  };

  const connect = async () => {
    setConnecting(true);
    try {
      // GitHub shows its install screen where the user picks repositories,
      // then redirects back here via the app's Setup URL.
      window.location.href = await beginInstall();
    } catch (error) {
      onError(error);
    }
  };

  const connection = data?.connection ?? null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
      <div>
        <h2 className="text-base font-semibold">Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Connect external tools to your workspace.
        </p>
      </div>

      <div className="rounded-lg border">
        <div className="flex items-center gap-3 p-4">
          <GithubIcon className="size-6 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">GitHub</div>
            <p className="truncate text-xs text-muted-foreground">
              {connection
                ? `Connected by ${connection.connectedByName} · ${formatRelativeTime(connection.connectedAt)}`
                : "Link pull requests to issues and update statuses on merge."}
            </p>
          </div>
          {data === undefined ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : connection === null ? (
            <Button
              size="sm"
              disabled={!data.appConfigured || connecting}
              onClick={() => void connect()}
            >
              {connecting && <Loader2 className="size-3.5 animate-spin" />}
              Connect
            </Button>
          ) : (
            <Switch
              checked={connection.enabled}
              onCheckedChange={(enabled) =>
                setEnabled({ enabled }).catch(onError)
              }
              aria-label="Enable GitHub integration"
            />
          )}
        </div>

        {data !== undefined && connection === null && !data.appConfigured && (
          <>
            <Separator />
            <p className="p-4 text-xs text-muted-foreground">
              The GitHub App isn&apos;t configured on this deployment yet. An
              admin needs to create one (GitHub → Settings → Developer
              settings → GitHub Apps) with webhook URL{" "}
              <code className="rounded bg-muted px-1">
                {process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/github-webhook
              </code>
              , setup URL{" "}
              <code className="rounded bg-muted px-1">
                {process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/github-setup
              </code>{" "}
              (with redirect on install enabled), pull-request read
              permission, and pull request + installation events. Then run{" "}
              <code className="rounded bg-muted px-1">
                npx convex env set GITHUB_APP_SLUG your-app-slug
              </code>{" "}
              and{" "}
              <code className="rounded bg-muted px-1">
                npx convex env set GITHUB_WEBHOOK_SECRET whsec…
              </code>
            </p>
          </>
        )}

        {connection && (
          <>
            <Separator />
            <div className="flex flex-col gap-3 p-4">
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  Repositories
                </span>
                {connection.repositories.length === 0 ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Syncing from GitHub — the list fills in as events arrive.
                  </p>
                ) : (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {connection.repositories.map((repo) => (
                      <span
                        key={repo}
                        className="rounded-md border bg-muted/50 px-2 py-0.5 font-mono text-xs"
                      >
                        {repo}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Reference issues as{" "}
                <code className="rounded bg-muted px-1">ENG-42</code> in a
                branch name, PR title or body. Opened PRs move issues to In
                Review; merged PRs move them to Done. Manage repository access
                from your GitHub App installation settings.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit text-destructive hover:text-destructive"
                  >
                    Disconnect
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect GitHub?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Events stop being processed for this workspace.
                      Already-linked pull requests stay on their issues. To
                      revoke repository access entirely, also uninstall the
                      app from GitHub.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => disconnect().catch(onError)}
                      className="bg-destructive text-white hover:bg-destructive/90"
                    >
                      Disconnect
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
