# Simple Backend Roadmap

## Goal

Start with a simple internal system that receives contact-form inquiries, lets the team view and manage them, and shows basic lead activity.

Keep the landing page and admin system separate. Build only what the team needs now, then add features when there is a real need.

## Phase 1 — Define the workflow

Decide and document:

- What information the contact form collects: name, email, company, service interest, and message.
- The lead stages: New, Contacted, Qualified, and Closed.
- Who on the internal team can access the admin system.
- Which Discord channel receives new-inquiry notifications.
- A simple privacy notice and consent checkbox for the contact form.

Success: everyone agrees on what happens from form submission until a lead is closed.

## Phase 2 — Make the contact form functional

Connect the existing contact form so that each submission is saved.

For every inquiry:

- Save all submitted information.
- Show the visitor a success or error message.
- Send a Discord notification containing lead details except the message.
- Keep the full message visible only inside the admin system.

Success: no inquiry is lost, and the team is notified when a new one arrives.

## Phase 3 — Build the basic admin system

Create a separate internal site with login access for the team.

Include only these pages:

- Login page
- Dashboard page
- Lead list page
- Lead detail page

The lead list should show name, email, company, service interest, date received, and current status.

The lead detail page should show the full message and allow staff to:

- Change the status.
- Mark when they first contacted the lead.
- Add internal notes.
- Delete a lead when necessary.

Success: the team can manage all inquiries without checking code, email, or Discord history.

## Phase 4 — Add basic KPI reports

Show simple reports based on saved lead data:

- Total inquiries received.
- New inquiries.
- Inquiries by status.
- Inquiries by service interest.
- Number of inquiries over time.
- Average time before first contact.

Start with date filters such as today, last 7 days, last 30 days, and a custom range.

Success: the team can quickly understand whether inquiries are increasing and whether follow-up is happening quickly.

## Phase 5 — Prepare for safe operation

Before launch:

- Test normal, invalid, and failed form submissions.
- Confirm that only internal users can access lead messages.
- Confirm Discord notifications never include the full message.
- Create a process for deleting old or requested-to-be-deleted inquiry data.
- Write a short team guide explaining how to check, update, and close leads.

## Later additions

Do not build these until the basic system is in regular use:

- Assigning leads to individual staff.
- Follow-up reminders and tasks.
- Quotation and project tracking.
- Customer relationship management features.
- Website traffic and conversion analytics.
- Financial and revenue reports.

## Assumptions

- The first version is only for internal team members.
- The admin system handles contact-form inquiries only.
- Discord is for alerts, not for storing private inquiry messages.
- The first priority is reliable lead collection and follow-up, not a large all-in-one business system.
