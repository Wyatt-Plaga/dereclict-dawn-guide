-- Create a table to store player game progress
CREATE TABLE IF NOT EXISTS "public"."game_progress" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "user_id" text NOT NULL,
  "last_online" timestamp with time zone NOT NULL DEFAULT now(),
  "resources" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "upgrades" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "unlocked_logs" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "game_progress_user_id_key" UNIQUE ("user_id")
);

-- Create RLS policies
ALTER TABLE "public"."game_progress" ENABLE ROW LEVEL SECURITY;

-- Users can only view and modify their own game progress
CREATE POLICY "Users can view own game progress" 
  ON "public"."game_progress" 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game progress" 
  ON "public"."game_progress" 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own game progress" 
  ON "public"."game_progress" 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to update the updated_at timestamp automatically
CREATE TRIGGER update_game_progress_updated_at
  BEFORE UPDATE ON "public"."game_progress"
  FOR EACH ROW
  EXECUTE PROCEDURE update_modified_column(); 