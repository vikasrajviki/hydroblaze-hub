
-- Tighten SELECT policies and lock down user_roles writes

-- clients: creator or admin/manager
DROP POLICY IF EXISTS "Authenticated can view clients" ON public.clients;
CREATE POLICY "View clients: creator or admin/manager"
  ON public.clients FOR SELECT TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

-- projects: creator or admin/manager
DROP POLICY IF EXISTS "Authenticated can view projects" ON public.projects;
CREATE POLICY "View projects: creator or admin/manager"
  ON public.projects FOR SELECT TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

-- tasks: creator, assignee, or admin/manager
DROP POLICY IF EXISTS "Authenticated can view tasks" ON public.tasks;
CREATE POLICY "View tasks: creator, assignee or admin/manager"
  ON public.tasks FOR SELECT TO authenticated
  USING (auth.uid() = created_by OR auth.uid() = assignee_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

-- profiles: self or admin/manager
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "View profile: self or admin/manager"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

-- user_roles: only admins can write; restrict SELECT to self or admin
DROP POLICY IF EXISTS "Roles are viewable by authenticated users" ON public.user_roles;
CREATE POLICY "View roles: self or admin"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
