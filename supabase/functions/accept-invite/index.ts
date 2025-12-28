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

    // 1. Get the original invite (template)
    const { data: templateInvite, error: inviteError } = await supabase
      .from('session_invites')
      .select('id, session_id, expires_at, invited_by, meeting_format, meeting_address, meeting_link')
      .eq('id', invite_id)
      .maybeSingle()

    if (inviteError) {
      console.error('Invite fetch error:', inviteError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch invite', details: inviteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!templateInvite) {
      return new Response(
        JSON.stringify({ error: 'Invite not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check expiry
    const now = new Date()
    const expiresAt = new Date(templateInvite.expires_at)
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: 'Invite has expired', expired: true }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prevent user from accepting their own invite
    if (templateInvite.invited_by === user.id) {
      return new Response(
        JSON.stringify({ error: 'You cannot accept your own invite' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Check if this user already has an invite for this session
    const { data: existingUserInvite } = await supabase
      .from('session_invites')
      .select('id')
      .eq('session_id', templateInvite.session_id)
      .eq('accepted_by', user.id)
      .maybeSingle()

    let userInviteId: string

    if (existingUserInvite) {
      // User already joined this session - just update their info
      userInviteId = existingUserInvite.id
      console.log('User already has invite for this session:', userInviteId)
    } else {
      // 3. Create a NEW invite record for this user (copying meeting details from template)
      const { data: newInvite, error: insertError } = await supabase
        .from('session_invites')
        .insert({
          session_id: templateInvite.session_id,
          invited_by: templateInvite.invited_by,
          accepted_by: user.id,
          accepted_at: new Date().toISOString(),
          expires_at: templateInvite.expires_at,
          meeting_format: templateInvite.meeting_format,
          meeting_address: templateInvite.meeting_address,
          meeting_link: templateInvite.meeting_link,
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Insert invite error:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to accept invite', details: insertError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      userInviteId = newInvite.id
      console.log('Created new invite for user:', userInviteId)
    }

    // 4. Update profile with first name + mark onboarding complete + signed_up_via_invite
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

    // 5. Get session date and subject info
    const { data: sessionData } = await supabase
      .from('revision_sessions')
      .select('date, start_time, subjects (name)')
      .eq('id', templateInvite.session_id)
      .maybeSingle()

    // 6. Get accepter's name for notification
    const { data: accepterProfile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .maybeSingle()

    const accepterName = accepterProfile?.first_name || first_name?.trim() || 'Un camarade'
    const subjectName = (sessionData?.subjects as any)?.name || 'Révision'

    // 7. Send notification to the inviter (only for new acceptances)
    if (!existingUserInvite) {
      await supabase
        .from('notifications')
        .insert({
          user_id: templateInvite.invited_by,
          type: 'invitation',
          title: '🎉 Invitation acceptée !',
          message: `${accepterName} a rejoint ta session de ${subjectName}`,
          link: '/app',
          metadata: {
            session_id: templateInvite.session_id,
            accepted_by: user.id,
            accepter_name: accepterName
          }
        })

      console.log('Notification sent to inviter:', templateInvite.invited_by)
    }

    console.log('Invite accepted successfully:', { 
      template_invite_id: invite_id, 
      user_invite_id: userInviteId,
      session_id: templateInvite.session_id 
    })

    return new Response(
      JSON.stringify({
        success: true,
        session_id: templateInvite.session_id,
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