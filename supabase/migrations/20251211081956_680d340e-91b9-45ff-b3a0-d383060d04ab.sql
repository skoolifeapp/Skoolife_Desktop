-- Create stats_snapshots table to store historical metrics
CREATE TABLE public.stats_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
  total_users integer NOT NULL DEFAULT 0,
  active_users integer NOT NULL DEFAULT 0,
  new_users_this_month integer NOT NULL DEFAULT 0,
  total_subjects integer NOT NULL DEFAULT 0,
  total_sessions integer NOT NULL DEFAULT 0,
  completed_sessions integer NOT NULL DEFAULT 0,
  total_conversations integer NOT NULL DEFAULT 0,
  open_conversations integer NOT NULL DEFAULT 0,
  total_events integer NOT NULL DEFAULT 0,
  nb_planning_generated_first_time integer NOT NULL DEFAULT 0,
  nb_planning_generated_weekly integer NOT NULL DEFAULT 0,
  users_generated_planning_weekly integer NOT NULL DEFAULT 0,
  active_users_this_week integer NOT NULL DEFAULT 0,
  nb_users_2plus_sessions_weekly integer NOT NULL DEFAULT 0,
  nb_users_3plus_sessions_weekly integer NOT NULL DEFAULT 0,
  nb_users_returning_without_nudge integer NOT NULL DEFAULT 0,
  nb_core_users integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(snapshot_date)
);

-- Enable RLS
ALTER TABLE public.stats_snapshots ENABLE ROW LEVEL SECURITY;

-- Only admins can view snapshots
CREATE POLICY "Admins can view stats_snapshots"
ON public.stats_snapshots
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert snapshots
CREATE POLICY "Admins can insert stats_snapshots"
ON public.stats_snapshots
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER TABLE public.stats_snapshots REPLICA IDENTITY FULL;