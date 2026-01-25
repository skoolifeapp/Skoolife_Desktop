-- Add event_type_colors column to store custom colors as JSON
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS event_type_colors jsonb DEFAULT NULL;

-- Comment for documentation
COMMENT ON COLUMN public.user_preferences.event_type_colors IS 'Stores custom colors for each event type as JSON object like {"cours": "#3B82F6", "sport": "#22C55E"}';