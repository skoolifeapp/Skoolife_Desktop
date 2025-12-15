-- Add RLS policy to allow users to view sessions they've been invited to
CREATE POLICY "Users can view sessions they are invited to" 
ON public.revision_sessions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.session_invites 
    WHERE session_invites.session_id = revision_sessions.id 
    AND session_invites.accepted_by = auth.uid()
  )
);

-- Also allow viewing the subject of an invited session
CREATE POLICY "Users can view subjects of sessions they are invited to" 
ON public.subjects 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.session_invites 
    JOIN public.revision_sessions ON revision_sessions.id = session_invites.session_id
    WHERE session_invites.accepted_by = auth.uid()
    AND revision_sessions.subject_id = subjects.id
  )
);