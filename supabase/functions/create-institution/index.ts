import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateInstitutionRequest {
  name: string;
  school_type?: string;
  student_count_estimate?: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Non autorisé - Vous devez être connecté' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Create client with user's JWT to verify their identity
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error('User auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Non autorisé - Session invalide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id, user.email);

    // Parse request body
    const body: CreateInstitutionRequest = await req.json();
    console.log('Request body:', body);

    // Validate required fields
    if (!body.name || !body.contact_email) {
      return new Response(
        JSON.stringify({ error: 'Le nom et l\'email de contact sont obligatoires' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already has a school
    const { data: existingMembership } = await supabaseAdmin
      .from('school_members')
      .select('id, role, school_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (existingMembership) {
      console.log('User already has school:', existingMembership);
      return new Response(
        JSON.stringify({ 
          error: 'Vous êtes déjà membre d\'un établissement',
          school_id: existingMembership.school_id 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the school using service role (bypasses RLS)
    const { data: school, error: schoolError } = await supabaseAdmin
      .from('schools')
      .insert({
        name: body.name,
        school_type: body.school_type || null,
        student_count_estimate: body.student_count_estimate || null,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone || null,
        address: body.address || null,
        city: body.city || null,
        postal_code: body.postal_code || null,
        subscription_tier: 'trial',
        is_active: true,
      })
      .select()
      .single();

    if (schoolError) {
      console.error('Error creating school:', schoolError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création de l\'établissement: ' + schoolError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('School created:', school.id, school.name);

    // Add user as school admin using service role
    const { error: memberError } = await supabaseAdmin
      .from('school_members')
      .insert({
        school_id: school.id,
        user_id: user.id,
        role: 'admin_school',
        is_active: true,
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      console.error('Error adding member:', memberError);
      // Rollback: delete the school we just created
      await supabaseAdmin.from('schools').delete().eq('id', school.id);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'attribution du rôle admin: ' + memberError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User added as admin_school for school:', school.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        school_id: school.id,
        school_name: school.name,
        message: 'Établissement créé avec succès'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
