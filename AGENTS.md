# AGENTS.md

Marketing site for Blank CO PH Solutions: React 19 + Vite + Tailwind 4 + React Router, backed by Supabase (projects, team members, admin inbox).

## Commands

- `npm run dev` — Vite dev server on port 5174 (the customer portal uses 5173 locally).
- `npm run lint` — ESLint; run before finishing.
- `npm run build` — syncs the sibling portal build, runs `vite build`, then `scripts/prerender.mjs`.
- There is no test suite. Verify with lint + build.

## Where things live

- `src/pages/` — public routes plus the lazy-loaded `AdminWorkspace`.
- `src/components/` — contact form/ticket dialog, header/footer, admin terminal.
- `src/data/` — Supabase access for projects, team members, and messages.
- `supabase/schema.sql` — tables, grants, RLS, storage policies, seeds. This is the backend source of truth.
- `scripts/prerender.mjs` — writes static HTML for public routes, `sitemap.xml`, `404.html`, and the noindex admin shell.
- `scripts/sync-portal.mjs` — builds `../CPL` with `VITE_BASE_PATH=/portal/` and copies it to `public/portal`; skips when the sibling checkout is absent.

## Behaviors to preserve

- Admin has no visible entry point. `Ctrl/Cmd+Shift+A` opens the access console, then `admin` navigates to `/admin`; auth + the `admin_users` allowlist still gate the page. Do not add an admin link or button.
- The contact page has two customer actions: open `/portal/` and submit a support ticket. Both portal tickets and contact-page tickets are inserted into `public.messages`; portal tickets use the `CPL support · <category> · <subject>` prefix and render a “Portal ticket” badge in Admin → Messages.
- Anonymous users may only INSERT into `messages` with the policy's validation constraints (name/company 2–100, email valid, service_interest 10–300, message 20–500, consent true, unread). Reads/updates/deletes are admin-only.
- `.env.local` (gitignored) holds `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and optionally `VITE_PORTAL_URL`. Never use a service-role key in the browser.
- `public/portal` is a deliberately committed build so deploys without the `../CPL` checkout still serve a working portal.
