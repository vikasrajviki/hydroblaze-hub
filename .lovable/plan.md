
This is a large scope. I'll break it into phased, shippable milestones so each phase is verifiable before moving on. Everything below replaces placeholders with real Supabase-backed data, real CRUD, and empty states.

## Phase 1 — Database foundation (one migration)

New tables (all with RLS, GRANTs, updated_at triggers):

- `team_members` — extends profiles metadata (workload, active flag). Actually simpler: reuse `profiles` + `user_roles`; add nullable `department`, `job_title`, `phone`, `is_active` if missing.
- `project_members` (project_id, user_id, role) — assignments
- `task_checklist_items` (task_id, label, is_done, position)
- `task_comments` (task_id, user_id, body)
- `task_attachments` (task_id, name, url, mime, size, uploaded_by) — url = Google Drive link
- `project_files` (project_id, name, url, mime, size, uploaded_by)
- `project_notes` (project_id, user_id, body)
- `content_items` (title, description, platform, status, publish_at, assigned_to)
- `assets` (name, path, mime, size, folder, tags[], uploaded_by) — Supabase Storage bucket `assets`
- `documents` (drive_file_id, name, mime, parent_folder_id, web_view_link, cached_at) — thin cache; source of truth = Google Drive
- `invoices` (client_id, number, amount, currency, status, issued_at, due_at, notes)
- `announcements` (title, body, is_pinned, author_id)
- `notifications` (user_id, type, title, body, link, read_at, meta jsonb)
- `activity_log` (actor_id, action, entity_type, entity_id, meta jsonb) — powers Recent Activity

Storage bucket: `assets` (private, RLS by authenticated).

Triggers to auto-write `activity_log` + `notifications` on: project insert, task insert/update(status=done), announcement insert, document upload.

## Phase 2 — Server functions & shared hooks

- `notifications.functions.ts` — list/markRead/markAllRead
- `activity.functions.ts` — recent activity feed
- `search.functions.ts` — global cross-entity search
- `dashboard.functions.ts` — aggregate stats (counts, completion %, monthly trend from real rows)
- `documents.functions.ts` — Google Drive: list, upload (multipart), rename, move, delete, search, get preview link — uses existing `google_drive` app-user connector; auth gated per user with OAuth consent
- `assets.functions.ts` — signed URLs for storage bucket
- Realtime subscriptions on `notifications`, `activity_log`, `projects`, `tasks`, `announcements` → invalidate React Query keys

## Phase 3 — Dashboard rewrite

- Remove all hardcoded numbers/charts
- Stats cards read from `dashboard.functions.ts`
- Charts (Recharts): Task completion = last 30d from `tasks.completed_at`; Project performance = counts by status. If zero rows → EmptyChart component.
- Recent Activity → `activity_log`
- Recent Notifications → `notifications`
- Upcoming Deadlines → union of projects.due_date & tasks.due_date, next 14 days
- Empty states with icon + CTA for each section
- Quick Actions wired to real modals: NewProjectDialog, NewTaskDialog, UploadDocumentDialog (Drive), UploadAssetDialog, NewAnnouncementDialog

## Phase 4 — Module completion

For each existing module page (Projects, Tasks, Clients, Team), add Edit dialogs, Archive, Assign members, file upload, notes, comments, checklist, attachments. Wire filters/search/tabs.

New modules built to spec:
- Content Calendar (month/week views using date-fns; CRUD dialog)
- Assets (grid + folders + tags + upload to Supabase Storage)
- Documents (Google Drive via connector; connect-Drive flow if not connected)
- Invoices (list + CRUD + status transitions + totals)
- Reports (auto-generated from data: projects by status, tasks by assignee, invoices by month, client revenue)
- Announcements (list + CRUD + pin)

## Phase 5 — Cross-cutting

- Global search in TopBar → server fn hitting projects/tasks/clients/profiles/documents/assets
- Notifications dropdown in TopBar → real feed with unread badge, realtime
- Role guards: helper `useRoleAccess()`; hide/disable actions per role
  - Admin: everything
  - Manager: CRUD projects/tasks/clients/content/invoices/announcements, view team
  - Employee: view assigned projects/tasks, update own tasks, upload assets/docs, view announcements
  - Intern: view assigned tasks, comment, no delete
- Loading skeletons, error boundaries, toast on success/failure everywhere
- Remove `ModulePlaceholder` usage entirely

## Phase 6 — Google Drive integration

- Use `google_drive` App User Connector; each user connects their own Drive
- "Connect Google Drive" CTA in Documents if not yet connected
- Store per-user connection key encrypted in `app_user_connections` (per knowledge)
- Server fns proxy Drive API: list, upload (multipart), rename (patch name), move (patch parents), delete, search (q param), get webViewLink for preview

## Delivery order (each phase = one working milestone)

1. Migration + storage bucket + connectors setup
2. Dashboard real data + empty states + quick actions
3. Projects/Tasks full CRUD + assignments + comments/checklist
4. Clients + Team full CRUD
5. Announcements + Notifications + Activity + Global Search
6. Content Calendar + Assets + Invoices + Reports
7. Documents (Google Drive)
8. Role guards pass + polish + final QA

## Risks / notes

- Google Drive requires each user to complete OAuth consent; workspace admin must first configure the Google App User Connector client. I'll build the UI + server fns, and prompt the user to configure the connector when we reach Phase 7.
- Scope is very large (~30+ new files, 1 big migration, storage, connectors). Expect this to span multiple back-and-forths — I'll ship phase by phase and check in after each.

Approving this plan starts Phase 1 (migration). I'll pause after each phase for you to sanity-check before continuing.
