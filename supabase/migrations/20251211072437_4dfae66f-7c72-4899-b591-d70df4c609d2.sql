-- Add admin policy to view all ai_plans
CREATE POLICY "Admins can view all ai_plans"
ON public.ai_plans
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));