-- Create tables for game saves
-- Run this in Supabase SQL editor or as a migration

-- Table for storing game saves
CREATE TABLE IF NOT EXISTS game_saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  version TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  state JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pointer table to track current save for each user
CREATE TABLE IF NOT EXISTS game_save_pointers (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  current_save_id UUID REFERENCES game_saves(id) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security (RLS) policies
-- Users can only access their own saves

-- Enable RLS on tables
ALTER TABLE game_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_save_pointers ENABLE ROW LEVEL SECURITY;

-- Create policies for game_saves
CREATE POLICY "Users can view their own saves"
  ON game_saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saves"
  ON game_saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saves"
  ON game_saves FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saves"
  ON game_saves FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for game_save_pointers
CREATE POLICY "Users can view their own save pointer"
  ON game_save_pointers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own save pointer"
  ON game_save_pointers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own save pointer"
  ON game_save_pointers FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update timestamp on save update
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to update timestamp automatically
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON game_saves
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON game_save_pointers
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_game_saves_user_id ON game_saves(user_id);

-- Comment on tables for documentation
COMMENT ON TABLE game_saves IS 'Game save files for Derelict Dawn';
COMMENT ON TABLE game_save_pointers IS 'Tracks which save is currently active for each user'; 