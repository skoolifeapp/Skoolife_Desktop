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

    // Send emails to all students (sequentially to avoid rate limits)
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const rawFrom = Deno.env.get("RESEND_FROM") ?? "no-reply@skoolife.fr";
    const cleanedFrom = rawFrom
      .trim()
      // remove accidental surrounding quotes
      .replace(/^"(.*)"$/, "$1")
      .replace(/^'(.*)'$/, "$1");

    const isValidFrom = (value: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
      /^.+\s<[^\s@]+@[^\s@]+\.[^\s@]+>$/.test(value);

    const from = isValidFrom(cleanedFrom) ? cleanedFrom : "no-reply@skoolife.fr";
    console.log("RESEND_FROM (raw):", rawFrom);
    console.log("RESEND_FROM (used):", from);


    const results: Array<{ email: string; success: boolean; error?: any }> = [];

    for (const student of students) {
      const firstName = student.first_name || "Étudiant";

      try {
        const result = await resend.emails.send({
          from,
          to: [student.email],
          subject: `Votre code d'accès Skoolife - ${schoolName}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #FFFDF7; margin: 0; padding: 40px 20px;">
              <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; padding: 48px 40px; box-shadow: 0 8px 24px rgba(0,0,0,0.06); border: 1px solid #FEF3C7;">
                
                <!-- Logo -->
                <div style="text-align: center; margin-bottom: 32px;">
                  <div style="display: inline-block; width: 56px; height: 56px; background: #FFC107; border-radius: 14px; line-height: 56px; font-size: 28px; font-weight: bold; color: white;">S</div>
                </div>

                <h1 style="color: #18181b; font-size: 26px; margin: 0 0 32px 0; text-align: center; font-weight: 700;">
                  Bienvenue sur Skoolife ! 🎓
                </h1>
                
                <p style="color: #3f3f46; font-size: 16px; line-height: 1.7; margin: 0 0 16px 0;">
                  Bonjour <strong>${firstName}</strong>,
                </p>
                
                <p style="color: #3f3f46; font-size: 16px; line-height: 1.7; margin: 0 0 32px 0;">
                  Votre établissement <strong style="color: #18181b;">${schoolName}</strong> vous offre un accès gratuit à Skoolife pour optimiser vos révisions !
                </p>
                
                <!-- Code Box -->
                <div style="background: #FFC107; border-radius: 14px; padding: 28px 24px; text-align: center; margin: 0 0 32px 0;">
                  <p style="color: #18181b; font-size: 12px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; opacity: 0.8;">
                    Votre code d'accès
                  </p>
                  <p style="color: #18181b; font-size: 36px; font-weight: 800; margin: 0; font-family: 'SF Mono', 'Menlo', 'Monaco', monospace; letter-spacing: 3px;">
                    ${code}
                  </p>
                </div>
                
                <p style="color: #18181b; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; font-weight: 600;">
                  Comment l'utiliser ?
                </p>
                <ol style="color: #3f3f46; font-size: 15px; line-height: 2; padding-left: 20px; margin: 0 0 32px 0;">
                  <li>Rendez-vous sur <a href="https://skoolife.fr/auth" style="color: #D97706; font-weight: 500; text-decoration: none;">skoolife.fr/auth</a></li>
                  <li>Créez votre compte</li>
                  <li>Entrez le code ci-dessus lors de l'inscription</li>
                </ol>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 0 0 40px 0;">
                  <a href="https://skoolife.fr/auth" style="display: inline-block; background: #FFC107; color: #18181b; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(255,193,7,0.3);">
                    Créer mon compte
                  </a>
                </div>
                
                <!-- Footer -->
                <div style="border-top: 1px solid #F3F4F6; padding-top: 24px; text-align: center;">
                  <p style="color: #9CA3AF; font-size: 13px; margin: 0;">
                    © ${new Date().getFullYear()} Skoolife — L'app qui booste tes révisions
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        if (result?.error) {
          console.error(`Resend error for ${student.email}:`, result.error);
          results.push({ email: student.email, success: false, error: result.error });
        } else {
          console.log(`Email queued for ${student.email}:`, result?.data);
          results.push({ email: student.email, success: true });
        }
      } catch (emailError) {
        console.error(`Failed to send email to ${student.email}:`, emailError);
        results.push({ email: student.email, success: false, error: emailError });
      }

      // Resend free-tier rate limit is low (avoid bursts)
      await sleep(550);
    }

    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    console.log(`Emails processed: ${successCount} success, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: failedCount === 0,
        sentCount: successCount,
        failedCount,
        total: students.length,
        errors: results
          .filter((r) => !r.success)
          .slice(0, 5)
          .map((r) => ({
            email: r.email,
            error: r?.error?.message ?? String(r.error ?? 'Unknown error'),
          })),
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
