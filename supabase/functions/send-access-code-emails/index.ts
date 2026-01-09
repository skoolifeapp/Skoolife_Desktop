import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendAccessCodeRequest {
  schoolId: string;
  schoolName: string;
  code: string;
  cohortId?: string;
  classId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { schoolId, schoolName, code, cohortId, classId }: SendAccessCodeRequest = await req.json();

    console.log(`Sending access code emails for school ${schoolId}, code: ${code}`);

    // Build query to get relevant students
    let query = supabase
      .from("school_expected_students")
      .select("email, first_name, last_name")
      .eq("school_id", schoolId);

    if (classId) {
      query = query.eq("class_id", classId);
    } else if (cohortId) {
      query = query.eq("cohort_id", cohortId);
    }

    const { data: students, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching students:", fetchError);
      throw new Error("Erreur lors de la récupération des élèves");
    }

    if (!students || students.length === 0) {
      console.log("No students found for the criteria");
      return new Response(
        JSON.stringify({ success: false, error: "Aucun élève trouvé", sentCount: 0 }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${students.length} students to email`);

    // Send emails to all students
    const emailPromises = students.map(async (student) => {
      const firstName = student.first_name || "Étudiant";
      
      try {
        const result = await resend.emails.send({
          from: "Skoolife <onboarding@resend.dev>",
          to: [student.email],
          subject: `Votre code d'accès Skoolife - ${schoolName}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
              <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 32px;">
                  <h1 style="color: #18181b; font-size: 24px; margin: 0;">Bienvenue sur Skoolife ! 🎓</h1>
                </div>
                
                <p style="color: #3f3f46; font-size: 16px; line-height: 1.6;">
                  Bonjour ${firstName},
                </p>
                
                <p style="color: #3f3f46; font-size: 16px; line-height: 1.6;">
                  Votre établissement <strong>${schoolName}</strong> vous offre un accès gratuit à Skoolife pour optimiser vos révisions !
                </p>
                
                <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
                  <p style="color: white; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                    Votre code d'accès
                  </p>
                  <p style="color: white; font-size: 32px; font-weight: bold; margin: 0; font-family: monospace; letter-spacing: 2px;">
                    ${code}
                  </p>
                </div>
                
                <p style="color: #3f3f46; font-size: 16px; line-height: 1.6;">
                  <strong>Comment l'utiliser ?</strong>
                </p>
                <ol style="color: #3f3f46; font-size: 15px; line-height: 1.8; padding-left: 20px;">
                  <li>Rendez-vous sur <a href="https://skoolife.app/auth" style="color: #f59e0b;">skoolife.app/auth</a></li>
                  <li>Créez votre compte</li>
                  <li>Entrez le code ci-dessus lors de l'inscription</li>
                </ol>
                
                <div style="text-align: center; margin-top: 32px;">
                  <a href="https://skoolife.app/auth" style="display: inline-block; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Créer mon compte
                  </a>
                </div>
                
                <p style="color: #71717a; font-size: 13px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e4e4e7;">
                  © ${new Date().getFullYear()} Skoolife - L'app qui booste tes révisions
                </p>
              </div>
            </body>
            </html>
          `,
        });
        console.log(`Email sent to ${student.email}:`, result);
        return { email: student.email, success: true };
      } catch (emailError) {
        console.error(`Failed to send email to ${student.email}:`, emailError);
        return { email: student.email, success: false, error: emailError };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    console.log(`Emails sent: ${successCount} success, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sentCount: successCount,
        failedCount,
        total: students.length 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-access-code-emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
