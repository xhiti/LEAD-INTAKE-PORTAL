CREATE TABLE notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  in_app_new_submission BOOLEAN DEFAULT TRUE,
  in_app_status_changes BOOLEAN DEFAULT TRUE,
  in_app_system_alerts BOOLEAN DEFAULT TRUE,
  in_app_account_updates BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT FALSE,
  push_subscription JSONB,
  push_new_submission BOOLEAN DEFAULT TRUE,
  push_status_changes BOOLEAN DEFAULT TRUE,
  push_system_alerts BOOLEAN DEFAULT TRUE,
  email_new_submission BOOLEAN DEFAULT FALSE,
  email_status_changes BOOLEAN DEFAULT TRUE,
  email_weekly_digest BOOLEAN DEFAULT FALSE,
  dnd_enabled BOOLEAN DEFAULT FALSE,
  dnd_start_time TIME,
  dnd_end_time TIME,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (TRUE);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
