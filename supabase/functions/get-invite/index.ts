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
    const url = new URL(req.url)
    const token = url.searchParams.get('token')

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch invite with session and inviter details
    const { data: invite, error: inviteError } = await supabase
      .from('session_invites')
      .select(`
        id,
        unique_token,
        expires_at,
        accepted_by,
        accepted_at,
        meeting_format,
        meeting_address,
        session:revision_sessions (
          id,
          date,
          start_time,
          end_time,
          subject:subjects (
            id,
            name,
            color
          )
        ),
        inviter:profiles!session_invites_invited_by_fkey (
          first_name,
          last_name
        )
      `)
      .eq('unique_token', token)
      .maybeSingle()

    if (inviteError) {
      console.error('Error fetching invite:', inviteError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch invite' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!invite) {
      return new Response(
        JSON.stringify({ error: 'Invite not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if invite has expired
    const now = new Date()
    const expiresAt = new Date(invite.expires_at)
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: 'Invite has expired', expired: true }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if already accepted
    const alreadyAccepted = !!invite.accepted_by

    return new Response(
      JSON.stringify({
        id: invite.id,
        session: invite.session,
        inviter: invite.inviter,
        expires_at: invite.expires_at,
        already_accepted: alreadyAccepted,
        meeting_format: invite.meeting_format,
        meeting_address: invite.meeting_address
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})