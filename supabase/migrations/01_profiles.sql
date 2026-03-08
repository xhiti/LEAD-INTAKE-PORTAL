CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  surname TEXT NOT NULL,
  initials TEXT GENERATED ALWAYS AS (UPPER(LEFT(name,1)) || UPPER(LEFT(surname,1))) STORED,
  full_name TEXT GENERATED ALWAYS AS (name || ' ' || surname) STORED,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  gender TEXT CHECK (gender IN ('male','female','non_binary','prefer_not_to_say')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user','admin','moderator','viewer')),
  avatar_url TEXT,
  locale TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light','dark','system')),
  last_login TIMESTAMPTZ,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  bio TEXT,
  company TEXT,
  job_title TEXT,
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
