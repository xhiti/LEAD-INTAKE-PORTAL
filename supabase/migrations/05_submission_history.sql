CREATE TABLE submission_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  old_status TEXT,
  new_status TEXT,
  old_priority TEXT,
  new_priority TEXT,
  note TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE submission_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all history"
  ON submission_history FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
  );

CREATE POLICY "Users can view history of their own submissions"
  ON submission_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM submissions 
      WHERE submissions.id = submission_history.submission_id 
      AND submissions.submitted_by = auth.uid()
    )
  );

CREATE INDEX idx_submission_history_submission_id ON submission_history(submission_id);
CREATE INDEX idx_submission_history_created_at ON submission_history(created_at DESC);
