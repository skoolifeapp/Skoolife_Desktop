-- Allow admins to view all subjects for stats
CREATE POLICY "Admins can view all subjects"
ON public.subjects
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all revision sessions for stats
CREATE POLICY "Admins can view all revision_sessions"
ON public.revision_sessions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all calendar events for stats
CREATE POLICY "Admins can view all calendar_events"
ON public.calendar_events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update conversation messages (for read status)
CREATE POLICY "Admins can update conversation messages"
ON public.conversation_messages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));