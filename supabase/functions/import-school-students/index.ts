import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[IMPORT-STUDENTS] ${step}`, details ? JSON.stringify(details) : "");
};

interface StudentRow {
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("User not authenticated");

    const user = userData.user;
    logStep("User authenticated", { userId: user.id });

    const { school_id, students } = await req.json() as { school_id: string; students: StudentRow[] };
    
    if (!school_id || !students || !Array.isArray(students)) {
      throw new Error("Missing school_id or students array");
    }

    logStep("Processing students", { count: students.length });

    // Verify user is admin of this school or platform admin
    const { data: membership } = await supabaseClient
      .from("school_members")
      .select("role")
      .eq("school_id", school_id)
      .eq("user_id", user.id)
      .single();

    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    const isSchoolAdmin = membership?.role === "admin_school";
    const isPlatformAdmin = !!roleData;

    if (!isSchoolAdmin && !isPlatformAdmin) {
      throw new Error("User is not authorized to import students to this school");
    }

    logStep("Authorization verified");

    const results = {
      added: 0,
      already_exists: 0,
      not_found: 0,
      errors: [] as string[]
    };

    for (const student of students) {
      try {
        if (!student.email) {
          results.errors.push("Email manquant pour une ligne");
          continue;
        }

        const email = student.email.trim().toLowerCase();
        const role = student.role?.toLowerCase() === "teacher" || student.role?.toLowerCase() === "enseignant" 
          ? "teacher" 
          : student.role?.toLowerCase() === "admin" || student.role?.toLowerCase() === "admin_school"
          ? "admin_school"
          : "student";

        // Find user by email
        const { data: profile, error: profileError } = await supabaseClient
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single();

        if (profileError || !profile) {
          results.not_found++;
          results.errors.push(`Utilisateur non trouvé: ${email}`);
          continue;
        }

        // Check if already member
        const { data: existingMember } = await supabaseClient
          .from("school_members")
          .select("id")
          .eq("school_id", school_id)
          .eq("user_id", profile.id)
          .single();

        if (existingMember) {
          results.already_exists++;
          continue;
        }

        // Add member
        const { error: insertError } = await supabaseClient
          .from("school_members")
          .insert({
            school_id,
            user_id: profile.id,
            role,
            joined_at: new Date().toISOString(),
            invited_by: user.id
          });

        if (insertError) {
          results.errors.push(`Erreur pour ${email}: ${insertError.message}`);
        } else {
          results.added++;
        }
      } catch (err) {
        results.errors.push(`Erreur inattendue: ${err}`);
      }
    }

    logStep("Import complete", results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
