<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules (TalentIQ)

- Domain types in `src/lib/types.ts` mirror the backend Prisma schema exactly; matching types (`MatchResult` etc.) are frontend-only and never added to Candidate/Job. Why: the UI is meant to be ported onto the user's existing backend.
- All data flows through `src/lib/store.ts` (`useTalentStore` + `talentActions`) seeded from `src/lib/mock-data.ts`; no backend, APIs, or Lovable Cloud. Why: frontend-only build to be wired to the user's own Next.js backend later.
- Upload, job-extraction, and evaluation logic live only in `src/lib/upload-service.ts`, `src/lib/job-extraction.ts`, and `src/lib/matching.ts` behind swappable functions/interfaces. Why: so real Supabase Storage / API calls replace one file each.
- Screens are framework-agnostic components in `src/components/<area>/`; route files under `src/routes/` stay thin wrappers. Why: easy transfer into a Next.js App Router project.
- Skill groups (ANY/ALL/PREFERRED → skills) and accepted degrees stay nested objects end to end; never flatten. Why: user requirement mirrored in schema.
