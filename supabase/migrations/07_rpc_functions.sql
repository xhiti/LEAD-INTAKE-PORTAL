CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, surname, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.id::text || '@no-email.internal'),
    COALESCE(NEW.raw_user_meta_data->>'given_name', split_part(NEW.email,'@',1), 'User'),
    COALESCE(NEW.raw_user_meta_data->>'family_name', ''),
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    surname = EXCLUDED.surname;

  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET last_login = NOW() WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_session_created
  AFTER INSERT ON auth_sessions
  FOR EACH ROW EXECUTE FUNCTION handle_user_login();

CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM notifications
  WHERE user_id = p_user_id
    AND is_read = FALSE
    AND is_deleted = FALSE;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS VOID AS $$
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id
    AND is_read = FALSE;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_submissions', (SELECT COUNT(*) FROM submissions WHERE is_deleted = FALSE),
    'new_today', (SELECT COUNT(*) FROM submissions WHERE DATE(created_at) = CURRENT_DATE AND is_deleted = FALSE),
    'new_this_week', (SELECT COUNT(*) FROM submissions WHERE created_at >= NOW() - INTERVAL '7 days' AND is_deleted = FALSE),
    'by_status', (
      SELECT json_object_agg(status, count)
      FROM (SELECT status, COUNT(*) as count FROM submissions WHERE is_deleted = FALSE GROUP BY status) t
    ),
    'by_category', (
      SELECT json_object_agg(COALESCE(ai_category, 'Uncategorized'), count)
      FROM (SELECT ai_category, COUNT(*) as count FROM submissions WHERE is_deleted = FALSE GROUP BY ai_category) t
    ),
    'by_industry', (
      SELECT json_object_agg(industry, count)
      FROM (SELECT industry, COUNT(*) as count FROM submissions WHERE is_deleted = FALSE GROUP BY industry) t
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
