
-- Helper: user has access to a project
CREATE OR REPLACE FUNCTION public.has_project_access(_project_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p WHERE p.id = _project_id AND p.created_by = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.project_members m WHERE m.project_id = _project_id AND m.user_id = _user_id
  ) OR public.has_role(_user_id, 'admin'::app_role)
    OR public.has_role(_user_id, 'manager'::app_role)
$$;

REVOKE ALL ON FUNCTION public.has_project_access(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_project_access(uuid, uuid) TO authenticated;

-- Helper: user has access to a task (via its project or as assignee/creator)
CREATE OR REPLACE FUNCTION public.has_task_access(_task_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = _task_id
      AND (
        t.created_by = _user_id
        OR t.assignee_id = _user_id
        OR (t.project_id IS NOT NULL AND public.has_project_access(t.project_id, _user_id))
        OR public.has_role(_user_id, 'admin'::app_role)
        OR public.has_role(_user_id, 'manager'::app_role)
      )
  )
$$;

REVOKE ALL ON FUNCTION public.has_task_access(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_task_access(uuid, uuid) TO authenticated;

-- content_items
DROP POLICY IF EXISTS "ci read" ON public.content_items;
CREATE POLICY "ci read" ON public.content_items FOR SELECT TO authenticated
USING (
  created_by = auth.uid()
  OR assigned_to = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- project_files
DROP POLICY IF EXISTS "pfiles read" ON public.project_files;
CREATE POLICY "pfiles read" ON public.project_files FOR SELECT TO authenticated
USING (public.has_project_access(project_id, auth.uid()));

-- project_members
DROP POLICY IF EXISTS "members read" ON public.project_members;
CREATE POLICY "members read" ON public.project_members FOR SELECT TO authenticated
USING (public.has_project_access(project_id, auth.uid()));

-- project_notes
DROP POLICY IF EXISTS "notes read auth" ON public.project_notes;
CREATE POLICY "notes read auth" ON public.project_notes FOR SELECT TO authenticated
USING (public.has_project_access(project_id, auth.uid()));

-- task_attachments
DROP POLICY IF EXISTS "ta read" ON public.task_attachments;
CREATE POLICY "ta read" ON public.task_attachments FOR SELECT TO authenticated
USING (public.has_task_access(task_id, auth.uid()));

-- task_comments
DROP POLICY IF EXISTS "tc read" ON public.task_comments;
CREATE POLICY "tc read" ON public.task_comments FOR SELECT TO authenticated
USING (public.has_task_access(task_id, auth.uid()));

-- task_checklist_items - restrict both read and write
DROP POLICY IF EXISTS "check read" ON public.task_checklist_items;
DROP POLICY IF EXISTS "check write" ON public.task_checklist_items;
CREATE POLICY "check read" ON public.task_checklist_items FOR SELECT TO authenticated
USING (public.has_task_access(task_id, auth.uid()));
CREATE POLICY "check insert" ON public.task_checklist_items FOR INSERT TO authenticated
WITH CHECK (public.has_task_access(task_id, auth.uid()));
CREATE POLICY "check update" ON public.task_checklist_items FOR UPDATE TO authenticated
USING (public.has_task_access(task_id, auth.uid()))
WITH CHECK (public.has_task_access(task_id, auth.uid()));
CREATE POLICY "check delete" ON public.task_checklist_items FOR DELETE TO authenticated
USING (public.has_task_access(task_id, auth.uid()));

-- activity_log
DROP POLICY IF EXISTS "act read auth" ON public.activity_log;
CREATE POLICY "act read auth" ON public.activity_log FOR SELECT TO authenticated
USING (
  actor_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- assets metadata
DROP POLICY IF EXISTS "assets read" ON public.assets;
CREATE POLICY "assets read" ON public.assets FOR SELECT TO authenticated
USING (
  uploaded_by = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- announcements - restrict to authenticated (not anon)
DROP POLICY IF EXISTS "ann read" ON public.announcements;
CREATE POLICY "ann read" ON public.announcements FOR SELECT TO authenticated
USING (true);

-- storage.objects for assets bucket - restrict read to owner/admin/manager
DROP POLICY IF EXISTS "assets storage read" ON storage.objects;
CREATE POLICY "assets storage read" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'assets' AND (
    owner = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
  )
);

-- SECURITY DEFINER function exposure: restrict to authenticated only
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.log_activity(text, text, uuid, jsonb) FROM PUBLIC, anon, authenticated;
