-- Remove hardcoded check constraints from submissions table
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_industry_check;
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_ai_category_check;

-- Ensure 'Technology & IT' exists in the industries table
INSERT INTO industries (code, title, description, order_index)
VALUES ('Technology & IT', 'Technology & IT', 'Software development, IT services, and technical consulting', 60)
ON CONFLICT (code) DO NOTHING;
