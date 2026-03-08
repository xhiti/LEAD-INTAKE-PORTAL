CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  industry TEXT NOT NULL CHECK (industry IN ('Healthcare','Real Estate','Legal','Finance','Professional Services','Other')),
  help_request TEXT NOT NULL,
  ai_summary TEXT,
  ai_category TEXT CHECK (ai_category IN ('Automation','Website','AI Integration','SEO','Custom Software','Other')),
  ai_confidence_score NUMERIC(4,2),
  ai_model_used TEXT,
  ai_processed_at TIMESTAMPTZ,
  ai_raw_response JSONB,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','reviewed','in_progress','closed','archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  notes TEXT,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all submissions"
  ON submissions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
  );

CREATE POLICY "Users can view own submissions"
  ON submissions FOR SELECT
  USING (submitted_by = auth.uid());

CREATE POLICY "Anyone can insert submission"
  ON submissions FOR INSERT
  WITH CHECK (TRUE);

CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_ai_category ON submissions(ai_category);
CREATE INDEX idx_submissions_industry ON submissions(industry);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX idx_submissions_submitted_by ON submissions(submitted_by);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
