import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CreateSchoolBody = {
  schoolName?: string;
};

const isNonEmptyString = (v: unknown, max = 200) =>
  typeof v === "string" && v.trim().length > 0 && v.trim().length <= max;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const token = authHeader.replace("Bearer ", "");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id || !user.email) throw new Error("User not authenticated or missing email");

    const body = (await req.json().catch(() => ({}))) as CreateSchoolBody;

    if (!isNonEmptyString(body.schoolName)) {
      return new Response(JSON.stringify({ error: "schoolName is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If the user already has a school admin membership, return it.
    const { data: existingMembership } = await supabaseAdmin
      .from("school_members")
      .select("school_id")
      .eq("user_id", user.id)
      .eq("role", "admin_school")
      .maybeSingle();

    if (existingMembership?.school_id) {
      return new Response(JSON.stringify({ schoolId: existingMembership.school_id, reused: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date().toISOString();

    const schoolName = body.schoolName!.trim();

    const { data: school, error: schoolError } = await supabaseAdmin
      .from("schools")
      .insert({
        name: schoolName,
        contact_email: user.email,
        subscription_tier: "trial",
        is_active: true,
      })
      .select("id")
      .single();

    if (schoolError) throw new Error(`School insert failed: ${schoolError.message}`);

    const { error: membershipError } = await supabaseAdmin.from("school_members").insert({
      school_id: school.id,
      user_id: user.id,
      role: "admin_school",
      joined_at: now,
      invited_by: user.id,
      is_active: true,
    });

    if (membershipError) throw new Error(`Membership insert failed: ${membershipError.message}`);

    return new Response(JSON.stringify({ schoolId: school.id, reused: false }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
