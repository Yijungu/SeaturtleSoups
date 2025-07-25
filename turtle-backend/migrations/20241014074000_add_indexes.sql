CREATE UNIQUE INDEX IF NOT EXISTS idx_stories_date ON stories(date);
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at);
