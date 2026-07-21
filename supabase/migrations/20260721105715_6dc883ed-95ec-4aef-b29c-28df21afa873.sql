
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT ALL ON public.project_members TO service_role;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read" ON public.project_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "managers manage members" ON public.project_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE TABLE IF NOT EXISTS public.project_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_notes TO authenticated;
GRANT ALL ON public.project_notes TO service_role;
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes read auth" ON public.project_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "notes insert own" ON public.project_notes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "notes delete own or admin" ON public.project_notes FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  mime text,
  size bigint,
  uploaded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_files TO authenticated;
GRANT ALL ON public.project_files TO service_role;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pfiles read" ON public.project_files FOR SELECT TO authenticated USING (true);
CREATE POLICY "pfiles insert" ON public.project_files FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "pfiles delete" ON public.project_files FOR DELETE TO authenticated USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE TABLE IF NOT EXISTS public.task_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  label text NOT NULL,
  is_done boolean NOT NULL DEFAULT false,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_checklist_items TO authenticated;
GRANT ALL ON public.task_checklist_items TO service_role;
ALTER TABLE public.task_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "check read" ON public.task_checklist_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "check write" ON public.task_checklist_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_comments TO authenticated;
GRANT ALL ON public.task_comments TO service_role;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tc read" ON public.task_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "tc insert own" ON public.task_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "tc delete own or admin" ON public.task_comments FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.task_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  mime text,
  size bigint,
  uploaded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_attachments TO authenticated;
GRANT ALL ON public.task_attachments TO service_role;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ta read" ON public.task_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "ta insert" ON public.task_attachments FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "ta delete" ON public.task_attachments FOR DELETE TO authenticated USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

DO $$ BEGIN
  CREATE TYPE public.content_status AS ENUM ('idea','draft','review','approved','scheduled','published');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  platform text,
  status public.content_status NOT NULL DEFAULT 'idea',
  publish_at timestamptz,
  assigned_to uuid,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_items TO authenticated;
GRANT ALL ON public.content_items TO service_role;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ci read" ON public.content_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "ci insert" ON public.content_items FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "ci update" ON public.content_items FOR UPDATE TO authenticated USING (created_by = auth.uid() OR assigned_to = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "ci delete" ON public.content_items FOR DELETE TO authenticated USING (created_by = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE TRIGGER trg_ci_updated BEFORE UPDATE ON public.content_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  storage_path text NOT NULL,
  mime text,
  size bigint,
  folder text NOT NULL DEFAULT '/',
  tags text[] NOT NULL DEFAULT '{}',
  uploaded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assets read" ON public.assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "assets insert" ON public.assets FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "assets update" ON public.assets FOR UPDATE TO authenticated USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "assets delete" ON public.assets FOR DELETE TO authenticated USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

CREATE POLICY "assets storage read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'assets');
CREATE POLICY "assets storage insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'assets' AND owner = auth.uid());
CREATE POLICY "assets storage update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'assets' AND (owner = auth.uid() OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "assets storage delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'assets' AND (owner = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager')));

DO $$ BEGIN
  CREATE TYPE public.invoice_status AS ENUM ('draft','pending','paid','overdue','cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  number text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status public.invoice_status NOT NULL DEFAULT 'draft',
  issued_at date NOT NULL DEFAULT CURRENT_DATE,
  due_at date,
  notes text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inv read managers" ON public.invoices FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "inv write managers" ON public.invoices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE TRIGGER trg_inv_updated BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  author_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ann read" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "ann write admin mgr" ON public.announcements FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE TRIGGER trg_ann_updated BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notif read own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif update own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_created ON public.activity_log(created_at DESC);
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "act read auth" ON public.activity_log FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  drive_file_id text NOT NULL,
  name text NOT NULL,
  mime text,
  parent_folder_id text,
  web_view_link text,
  cached_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, drive_file_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docs own" ON public.documents FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.log_activity(
  _action text, _entity text, _entity_id uuid, _meta jsonb DEFAULT '{}'::jsonb
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.activity_log (actor_id, action, entity_type, entity_id, meta)
  VALUES (auth.uid(), _action, _entity, _entity_id, _meta);
END $$;

CREATE OR REPLACE FUNCTION public.tg_project_activity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.log_activity('created', 'project', NEW.id, jsonb_build_object('name', NEW.name));
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_project_activity ON public.projects;
CREATE TRIGGER trg_project_activity AFTER INSERT ON public.projects FOR EACH ROW EXECUTE FUNCTION public.tg_project_activity();

CREATE OR REPLACE FUNCTION public.tg_task_activity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_activity('created', 'task', NEW.id, jsonb_build_object('title', NEW.title));
    IF NEW.assignee_id IS NOT NULL AND NEW.assignee_id <> auth.uid() THEN
      INSERT INTO public.notifications (user_id, type, title, body, link, meta)
      VALUES (NEW.assignee_id, 'task_assigned', 'New task assigned', NEW.title, '/tasks', jsonb_build_object('task_id', NEW.id));
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'done' AND OLD.status <> 'done' THEN
      PERFORM public.log_activity('completed', 'task', NEW.id, jsonb_build_object('title', NEW.title));
    END IF;
    IF NEW.assignee_id IS DISTINCT FROM OLD.assignee_id AND NEW.assignee_id IS NOT NULL AND NEW.assignee_id <> auth.uid() THEN
      INSERT INTO public.notifications (user_id, type, title, body, link, meta)
      VALUES (NEW.assignee_id, 'task_assigned', 'Task assigned to you', NEW.title, '/tasks', jsonb_build_object('task_id', NEW.id));
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_task_activity ON public.tasks;
CREATE TRIGGER trg_task_activity AFTER INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.tg_task_activity();

CREATE OR REPLACE FUNCTION public.tg_announcement_broadcast() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.log_activity('posted', 'announcement', NEW.id, jsonb_build_object('title', NEW.title));
  INSERT INTO public.notifications (user_id, type, title, body, link, meta)
  SELECT p.id, 'announcement', NEW.title, LEFT(NEW.body, 200), '/announcements', jsonb_build_object('announcement_id', NEW.id)
  FROM public.profiles p WHERE p.id <> NEW.author_id;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_ann_broadcast ON public.announcements;
CREATE TRIGGER trg_ann_broadcast AFTER INSERT ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.tg_announcement_broadcast();

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
