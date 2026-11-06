# Blank CO PH Solutions

**We Solve Your Problems.**

Blank CO PH Solutions is a Cagayan-based company that takes ownership of broken, stuck, or missing systems — strategy, automation, digital tools, and support — and delivers solutions that actually work. No runaround, just results.

## What we provide

| Service | Description |
| --- | --- |
| **Strategic Consulting** | We dig into the root of the problem and give you a clear, actionable plan to move forward. |
| **Business Automation** | Repetitive work disappears. We streamline your workflows so your team focuses on what matters. |
| **Digital Solutions** | Websites, platforms, and tools built to perform — fast, reliable, and built for growth. |
| **Support & Maintenance** | Problems don't clock out. Neither do we. Ongoing support keeps everything running smoothly. |

## How we work

Four steps, no surprises:

1. **Listen** — We hear you out. No assumptions, no jumping ahead.
2. **Diagnose** — We find the real root of the problem, not just the symptoms.
3. **Fix** — We solve it, test it, and make sure it holds.
4. **Support** — We stay close so the problem stays gone.

## Our promise

If it isn't solved, we aren't done. Straight answers, real results, done right.

## Contact

- Location: San Jose, Baggao, Cagayn, Philippines
- Availability: Most work happens remotely, so timezone and location aren't a problem. On-call support available 24/7.

## Supabase setup

The app uses Supabase for project records, contact inquiries, and admin authentication. The browser uses only the project URL and anon key; never put the database password or a service-role key in frontend environment variables.

1. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Restart the dev server after changing environment variables.
2. With the Supabase CLI linked to the project, push [`supabase/schema.sql`](supabase/schema.sql). Rerun it after schema changes; it creates and updates tables, row-level security policies, the public team-avatar bucket, and verified project seeds.
3. In Supabase Authentication, create an admin user. Disable public sign-ups in the Auth settings.
4. Add that user's email to the admin allowlist by running this in the SQL Editor, replacing the example address:

	```sql
	insert into public.admin_users (user_id, email)
	select id, email from auth.users where email = 'admin@example.com'
	on conflict (user_id) do update set email = excluded.email;
	```

5. Sign in at `/admin`. The dashboard checks both the Supabase Auth session and the `admin_users` allowlist. RLS independently protects project writes and the message inbox.

Public visitors can submit contact inquiries, read published projects, and view published team profiles at `/members`, with each member's full profile at `/team/:slug`. In the admin project form, enter a GitHub username, organization, or profile URL to browse, search, and import its public repositories and declared homepages. Published projects need a valid GitHub URL; a live-site URL is optional for native apps. The attendance-checker Flutter app uses a mobile preview fallback. Admins can manage projects, member resumes and skills, uploaded member photos, and client messages. Replies open the visitor's email address in the configured mail app.
