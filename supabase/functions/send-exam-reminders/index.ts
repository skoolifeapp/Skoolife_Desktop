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

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calculate target dates: J-7, J-3, J-1
    const reminderDays = [7, 3, 1]
    const targetDates = reminderDays.map(days => {
      const date = new Date(today)
      date.setDate(date.getDate() + days)
      return {
        days,
        date: date.toISOString().split('T')[0],
        label: days === 1 ? 'demain' : `dans ${days} jours`
      }
    })

    console.log('Checking exams for dates:', targetDates.map(t => t.date))

    let totalNotifications = 0

    for (const target of targetDates) {
      // Find subjects with exams on target date
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('id, user_id, name, exam_date, exam_type')
        .eq('exam_date', target.date)
        .eq('status', 'active')

      if (subjectsError) {
        console.error('Error fetching subjects:', subjectsError)
        continue
      }

      console.log(`Found ${subjects?.length || 0} exams for J-${target.days}`)

      for (const subject of subjects || []) {
        // Check if notification already sent today for this subject/day combo
        const todayStr = today.toISOString().split('T')[0]
        const notifKey = `exam_${subject.id}_${target.days}`

        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', subject.user_id)
          .eq('type', 'exam_reminder')
          .gte('created_at', todayStr)
          .eq('metadata->subject_id', subject.id)
          .eq('metadata->days_before', target.days)
          .maybeSingle()

        if (existing) {
          console.log(`Notification already sent for ${subject.name} J-${target.days}`)
          continue
        }

        const examType = subject.exam_type ? ` (${subject.exam_type === 'Contrôle continu' ? 'CC' : subject.exam_type})` : ''
        
        const { error: insertError } = await supabase
          .from('notifications')
          .insert({
            user_id: subject.user_id,
            type: 'exam_reminder',
            title: target.days === 1 ? '⚠️ Examen demain !' : `📚 Examen ${target.label}`,
            message: `${subject.name}${examType} est ${target.label}. Courage !`,
            link: '/subjects',
            metadata: { 
              subject_id: subject.id, 
              subject_name: subject.name,
              days_before: target.days,
              exam_date: target.date
            }
          })

        if (insertError) {
          console.error('Error inserting exam notification:', insertError)
        } else {
          totalNotifications++
        }
      }
    }

    console.log(`Created ${totalNotifications} exam reminder notifications`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        notifications_sent: totalNotifications
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
