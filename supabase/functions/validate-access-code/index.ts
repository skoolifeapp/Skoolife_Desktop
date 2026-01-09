import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ValidateRequest = {
  code?: string;
  email?: string;
};

type ValidateResponse = {
  ok: boolean;
  title?: string;
  error?: string;
};

const isValidEmail = (value: string) => {
  // Pragmatic validation (we also rely on auth signup validation).
  if (value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, title: 'Méthode invalide', error: 'Méthode non supportée' } satisfies ValidateResponse), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as ValidateRequest;

    const codeRaw = (body.code ?? '').toString();
    const emailRaw = (body.email ?? '').toString();

    const code = codeRaw.trim().toUpperCase();
    const email = emailRaw.trim().toLowerCase();

    if (!code || code.length > 64) {
      return new Response(JSON.stringify({ ok: false, title: 'Code invalide', error: 'Code école invalide' } satisfies ValidateResponse), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ ok: false, title: 'Email invalide', error: 'Email invalide' } satisfies ValidateResponse), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    // 1) Validate access code
    const nowIso = new Date().toISOString();
    const { data: accessCode, error: accessCodeError } = await supabase
      .from('access_codes')
      .select('id, school_id, current_uses, max_uses, is_active, expires_at')
      .eq('code', code)
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      .maybeSingle();

    if (accessCodeError) {
      console.error('[validate-access-code] access code query error', accessCodeError);
      return new Response(JSON.stringify({ ok: false, title: 'Erreur', error: 'Impossible de valider le code pour le moment' } satisfies ValidateResponse), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!accessCode) {
      return new Response(JSON.stringify({ ok: false, title: 'Code invalide', error: 'Code école invalide ou expiré' } satisfies ValidateResponse), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (accessCode.max_uses !== null && accessCode.current_uses !== null && accessCode.current_uses >= accessCode.max_uses) {
      return new Response(JSON.stringify({ ok: false, title: 'Code expiré', error: 'Ce code a atteint son nombre maximum d’utilisations' } satisfies ValidateResponse), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2) Validate email against expected students
    const { data: expectedStudent, error: expectedStudentError } = await supabase
      .from('school_expected_students')
      .select('id, is_registered')
      .eq('school_id', accessCode.school_id)
      .ilike('email', email)
      .maybeSingle();

    if (expectedStudentError) {
      console.error('[validate-access-code] expected student query error', expectedStudentError);
      return new Response(JSON.stringify({ ok: false, title: 'Erreur', error: 'Impossible de valider l’email pour le moment' } satisfies ValidateResponse), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!expectedStudent) {
      return new Response(
        JSON.stringify({
          ok: false,
          title: 'Email non autorisé',
          error: "Ton adresse email n'est pas autorisée à utiliser ce code. Inscris-toi avec l'email sur lequel tu as reçu le code d'accès.",
        } satisfies ValidateResponse),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (expectedStudent.is_registered) {
      return new Response(
        JSON.stringify({
          ok: false,
          title: 'Email déjà utilisé',
          error: "Cet email a déjà été utilisé pour s'inscrire avec ce code.",
        } satisfies ValidateResponse),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ ok: true } satisfies ValidateResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[validate-access-code] unexpected error', error);
    return new Response(JSON.stringify({ ok: false, title: 'Erreur', error: 'Erreur interne' } satisfies ValidateResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
