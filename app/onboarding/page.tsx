import { OrganizationList } from "@clerk/nextjs";

/**
 * Org selection / creation. Every user needs an active organization
 * (workspace) before entering the app; Clerk redirects to /:slug after
 * selecting or creating one.
 */
export default function OnboardingPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Choose your workspace
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select an organization or create a new one to get started.
        </p>
      </div>
      <OrganizationList
        hidePersonal
        afterSelectOrganizationUrl="/:slug"
        afterCreateOrganizationUrl="/:slug"
      />
    </main>
  );
}
