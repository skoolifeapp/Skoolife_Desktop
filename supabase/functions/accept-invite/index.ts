import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get auth header to verify user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the user's JWT
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { invite_id, first_name } = await req.json()

    if (!invite_id) {
      return new Response(
        JSON.stringify({ error: 'invite_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Accepting invite:', { invite_id, user_id: user.id, first_name })

    // 1. Get invite first to validate it (expiry + single-use)
    const { data: existingInvite, error: inviteError } = await supabase
      .from('session_invites')
      .select('id, session_id, expires_at, accepted_by')
      .eq('id', invite_id)
      .maybeSingle()

    if (inviteError) {
      console.error('Invite fetch error:', inviteError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch invite', details: inviteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!existingInvite) {
      return new Response(
        JSON.stringify({ error: 'Invite not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date()
    const expiresAt = new Date(existingInvite.expires_at)
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: 'Invite has expired', expired: true }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If the invite has already been accepted by someone else, do NOT overwrite it.
    if (existingInvite.accepted_by && existingInvite.accepted_by !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Invite already accepted', already_accepted: true }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Mark invite as accepted (idempotent)
    if (!existingInvite.accepted_by) {
      const { data: updatedInvite, error: updateError } = await supabase
        .from('session_invites')
        .update({
          accepted_by: user.id,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invite_id)
        .is('accepted_by', null)
        .select('id, session_id')
        .maybeSingle()

      if (updateError) {
        console.error('Invite update error:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to accept invite', details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Race protection: if no row updated, re-check who accepted it
      if (!updatedInvite) {
        const { data: latestInvite } = await supabase
          .from('session_invites')
          .select('accepted_by')
          .eq('id', invite_id)
          .maybeSingle()

        if (latestInvite?.accepted_by && latestInvite.accepted_by !== user.id) {
          return new Response(
            JSON.stringify({ error: 'Invite already accepted', already_accepted: true }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // 3. Update profile with first name + mark onboarding complete + signed_up_via_invite
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email,
          first_name: first_name?.trim() || null,
          is_onboarding_complete: true,
          signed_up_via_invite: true,
        },
        { onConflict: 'id' }
      )

    if (profileError) {
      console.error('Profile upsert error:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to update profile', details: profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Get session date
    const { data: sessionData } = await supabase
      .from('revision_sessions')
      .select('date')
      .eq('id', existingInvite.session_id)
      .maybeSingle()

    console.log('Invite accepted successfully:', { invite_id, session_id: existingInvite.session_id })

    return new Response(
      JSON.stringify({
        success: true,
        session_id: existingInvite.session_id,
        session_date: sessionData?.date || null,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    const error = err as Error
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})