import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get current time and 15 minutes from now
    const now = new Date()
    const in15Min = new Date(now.getTime() + 15 * 60 * 1000)
    const in16Min = new Date(now.getTime() + 16 * 60 * 1000)

    // Format for time comparison (HH:MM:SS)
    const timeFrom = in15Min.toTimeString().slice(0, 8)
    const timeTo = in16Min.toTimeString().slice(0, 8)
    const today = now.toISOString().split('T')[0]

    console.log(`Checking sessions for ${today} between ${timeFrom} and ${timeTo}`)

    // Find sessions starting in ~15 minutes
    const { data: sessions, error: sessionsError } = await supabase
      .from('revision_sessions')
      .select(`
        id,
        user_id,
        date,
        start_time,
        subjects (name)
      `)
      .eq('date', today)
      .gte('start_time', timeFrom)
      .lt('start_time', timeTo)
      .eq('status', 'planned')

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      throw sessionsError
    }

    console.log(`Found ${sessions?.length || 0} sessions to remind`)

    const notifications = []

    for (const session of sessions || []) {
      const subjectName = (session.subjects as any)?.name || 'Révision'
      
      // Check if notification already exists for this session
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', session.user_id)
        .eq('type', 'session_reminder')
        .eq('metadata->session_id', session.id)
        .maybeSingle()

      if (existing) {
        console.log(`Notification already exists for session ${session.id}`)
        continue
      }

      notifications.push({
        user_id: session.user_id,
        type: 'session_reminder',
        title: 'Session dans 15 minutes',
        message: `Ta session de ${subjectName} commence bientôt !`,
        link: '/app',
        metadata: { session_id: session.id, subject_name: subjectName }
      })
    }

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications)

      if (insertError) {
        console.error('Error inserting notifications:', insertError)
        throw insertError
      }

      console.log(`Created ${notifications.length} session reminder notifications`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reminders_sent: notifications.length,
        sessions_checked: sessions?.length || 0
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
