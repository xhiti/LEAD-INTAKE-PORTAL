CREATE TABLE industries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

INSERT INTO industries (code, title, description, order_index) VALUES
('Healthcare', 'Healthcare', 'Medical services and health insurance', 10),
('Real Estate', 'Real Estate', 'Property management and sales', 20),
('Legal', 'Legal', 'Legal advice and representation', 30),
('Finance', 'Finance', 'Financial services and banking', 40),
('Professional Services', 'Professional Services', 'Consulting and specialized business services', 50),
('Other', 'Other', 'Other business sectors', 90);

ALTER TABLE industries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active industries"
  ON industries FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage industries"
  ON industries FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER set_industries_updated_at
  BEFORE UPDATE ON industries
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
