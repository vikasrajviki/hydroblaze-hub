
-- Promote Vikas to admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('74527909-bf72-47a5-adaf-e19500b2badb', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Remove the previous employee role so admin is the sole role
DELETE FROM public.user_roles
WHERE user_id = '74527909-bf72-47a5-adaf-e19500b2badb' AND role = 'employee';
