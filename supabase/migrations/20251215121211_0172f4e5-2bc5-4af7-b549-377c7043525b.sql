-- Create session_invites table for study buddy feature
CREATE TABLE public.session_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.revision_sessions(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  unique_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.session_invites ENABLE ROW LEVEL SECURITY;

-- Users can insert their own invites
CREATE POLICY "Users can insert their own invites"
ON public.session_invites
FOR INSERT
WITH CHECK (auth.uid() = invited_by);

-- Users can view invites they created or accepted
CREATE POLICY "Users can view their own invites"
ON public.session_invites
FOR SELECT
USING (auth.uid() = invited_by OR auth.uid() = accepted_by);

-- Users can update invites to accept them
CREATE POLICY "Users can accept invites"
ON public.session_invites
FOR UPDATE
USING (accepted_by IS NULL OR auth.uid() = accepted_by);

-- Users can delete their own invites
CREATE POLICY "Users can delete their own invites"
ON public.session_invites
FOR DELETE
USING (auth.uid() = invited_by);

-- Enable realtime
ALTER TABLE public.session_invites REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_invites;

-- Create indexes for performance
CREATE INDEX idx_session_invites_token ON public.session_invites(unique_token);
CREATE INDEX idx_session_invites_session ON public.session_invites(session_id);
CREATE INDEX idx_session_invites_invited_by ON public.session_invites(invited_by);