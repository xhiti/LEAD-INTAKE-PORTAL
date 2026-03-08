CREATE TABLE auth_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT,
  ip_address INET,
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('desktop','mobile','tablet','unknown')),
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  provider TEXT DEFAULT 'email' CHECK (provider IN ('email','google','github')),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  logged_in_at TIMESTAMPTZ DEFAULT NOW(),
  logged_out_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON auth_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON auth_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON auth_sessions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role can insert sessions"
  ON auth_sessions FOR INSERT
  WITH CHECK (TRUE);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON auth_sessions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
