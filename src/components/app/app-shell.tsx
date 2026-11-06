import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  ChevronRight,
  FileText,
  LayoutGrid,
  LogOut,
  Plus,
  Settings,
  Sparkles,
  Upload,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { InitialsAvatar, Logo } from "@/components/shared/primitives";
import { MOCK_RECRUITER_PROFILE } from "@/lib/mock-data";
import { useTalentStore, type ActivityType } from "@/lib/store";
import { formatRelative } from "@/lib/talent-utils";
import { UploadDialogProvider, useUploadDialog } from "./upload-context";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutGrid },
  { to: "/candidates", label: "Candidates", icon: Users },
  { to: "/jobs", label: "Jobs", icon: Briefcase },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <UploadDialogProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0 bg-background">
          <AppHeader />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </SidebarInset>
      </UploadDialogProvider>
    </SidebarProvider>
  );
}

function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setOpenMobile } = useSidebar();
  const jobsCount = useTalentStore((s) => s.jobs.filter((j) => j.status === "ACTIVE").length);
  const { openUpload } = useUploadDialog();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 justify-center border-b border-sidebar-border px-3">
        <Link to="/dashboard" className="flex items-center group-data-[collapsible=icon]:justify-center">
          <Logo className="group-data-[collapsible=icon]:hidden" />
          <Logo compact className="hidden group-data-[collapsible=icon]:inline-flex" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                      <Link to={item.to} onClick={() => setOpenMobile(false)}>
                        <item.icon />
                        <span>{item.label}</span>
                        {item.to === "/jobs" && jobsCount > 0 && (
                          <span className="ml-auto rounded-md bg-sidebar-accent px-1.5 text-[11px] tabular-nums text-muted-foreground group-data-[collapsible=icon]:hidden">
                            {jobsCount}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Quick actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Upload resumes"
                  onClick={() => {
                    setOpenMobile(false);
                    openUpload();
                  }}
                >
                  <Upload />
                  <span>Upload resumes</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Create job">
                  <Link to="/jobs/new" onClick={() => setOpenMobile(false)}>
                    <Plus />
                    <span>Create job</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 rounded-md p-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
          <InitialsAvatar name={MOCK_RECRUITER_PROFILE.name} className="size-7" />
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-medium">{MOCK_RECRUITER_PROFILE.name}</p>
            <p className="truncate text-xs text-muted-foreground">{MOCK_RECRUITER_PROFILE.company}</p>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

type Crumb = {
  label: string;
  href?: { to: "/candidates" } | { to: "/jobs" } | { to: "/jobs/$id"; params: { id: string } };
};

function useBreadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const candidates = useTalentStore((s) => s.candidates);
  const jobs = useTalentStore((s) => s.jobs);
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  const root = parts[0];
  if (root === "dashboard") crumbs.push({ label: "Overview" });
  if (root === "settings") crumbs.push({ label: "Settings" });
  if (root === "candidates") {
    crumbs.push({ label: "Candidates", href: parts[1] ? { to: "/candidates" } : undefined });
    if (parts[1]) crumbs.push({ label: candidates.find((c) => c.id === parts[1])?.name ?? "Candidate" });
  }
  if (root === "jobs") {
    crumbs.push({ label: "Jobs", href: parts[1] ? { to: "/jobs" } : undefined });
    if (parts[1] === "new") crumbs.push({ label: "New job" });
    else if (parts[1]) {
      const title = jobs.find((j) => j.id === parts[1])?.title ?? "Job";
      crumbs.push({ label: title, href: parts[2] ? { to: "/jobs/$id", params: { id: parts[1] } } : undefined });
      if (parts[2] === "matches") crumbs.push({ label: "Matches" });
      if (parts[2] === "edit") crumbs.push({ label: "Edit" });
    }
  }
  return crumbs;
}

function AppHeader() {
  const crumbs = useBreadcrumbs();
  const { openUpload } = useUploadDialog();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur-md sm:px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1 text-sm">
        {crumbs.map((c, i) => (
          <span key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />}
            {c.href ? (
              <Link {...c.href} className="truncate text-muted-foreground hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span className="truncate font-medium">{c.label}</span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={openUpload}>
          <Upload /> Upload
        </Button>
        <NotificationsMenu />
        <ProfileMenu />
      </div>
    </header>
  );
}

const ACTIVITY_ICON: Record<ActivityType, typeof FileText> = {
  resume: FileText,
  candidate: UserRound,
  job: Briefcase,
  evaluation: Sparkles,
};

function NotificationsMenu() {
  const activity = useTalentStore((s) => s.activity);
  const items = activity.slice(0, 6);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell />
          {items.length > 0 && <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => toast("All caught up")}>
            Mark all read
          </button>
        </div>
        <ul className="max-h-80 overflow-y-auto py-1">
          {items.map((a) => {
            const Icon = ACTIVITY_ICON[a.type];
            return (
              <li key={a.id} className="flex gap-3 px-4 py-2.5">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-muted">
                  <Icon className="size-3.5 text-muted-foreground" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm leading-snug">{a.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatRelative(a.at)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function ProfileMenu() {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Account menu">
          <InitialsAvatar name={MOCK_RECRUITER_PROFILE.name} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium">{MOCK_RECRUITER_PROFILE.name}</p>
          <p className="truncate text-xs text-muted-foreground">{MOCK_RECRUITER_PROFILE.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate({ to: "/settings" })}>
          <Settings /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            toast.success("Signed out");
            navigate({ to: "/" });
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
