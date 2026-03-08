CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (get_user_role() = 'admin');

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can view all sessions" ON auth_sessions;

CREATE POLICY "Admins can view all sessions"
  ON auth_sessions FOR SELECT
  USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Admins can manage all submissions" ON submissions;

CREATE POLICY "Admins can manage all submissions"
  ON submissions FOR ALL
  USING (get_user_role() IN ('admin', 'moderator'));

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (get_user_role() = 'admin');
