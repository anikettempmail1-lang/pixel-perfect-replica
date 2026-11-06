import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/app-shell";

// Mock-authenticated recruiter layout. Real auth gating goes here later.
export const Route = createFileRoute("/_workspace")({
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
