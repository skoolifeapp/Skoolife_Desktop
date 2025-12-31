import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: unknown) => {
  console.log(`[SCHOOL-CHECKOUT] ${step}`, details ? JSON.stringify(details) : "");
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) throw new Error("User not authenticated");

    const user = userData.user;
    logStep("User authenticated", { email: user.email });

    const { school_id, price_id, tier } = await req.json();
    if (!school_id || !price_id || !tier) {
      throw new Error("Missing school_id, price_id, or tier");
    }

    // Verify user is admin of this school
    const { data: membership } = await supabaseClient
      .from("school_members")
      .select("role")
      .eq("school_id", school_id)
      .eq("user_id", user.id)
      .single();

    // Also check if user is platform admin
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    const isSchoolAdmin = membership?.role === "admin_school";
    const isPlatformAdmin = !!roleData;

    if (!isSchoolAdmin && !isPlatformAdmin) {
      throw new Error("User is not authorized to manage this school");
    }

    logStep("Authorization verified", { isSchoolAdmin, isPlatformAdmin });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if school already has a Stripe customer
    const { data: school } = await supabaseClient
      .from("schools")
      .select("contact_email, name")
      .eq("id", school_id)
      .single();

    if (!school) throw new Error("School not found");

    // Find or create Stripe customer for school
    const customers = await stripe.customers.list({ 
      email: school.contact_email, 
      limit: 1 
    });
    
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const newCustomer = await stripe.customers.create({
        email: school.contact_email,
        name: school.name,
        metadata: { school_id, tier }
      });
      customerId = newCustomer.id;
      logStep("New customer created", { customerId });
    }

    const origin = req.headers.get("origin") || "https://skoolife.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: price_id, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/admin/schools/${school_id}?checkout=success&tier=${tier}`,
      cancel_url: `${origin}/admin/schools/${school_id}?checkout=cancelled`,
      metadata: { school_id, tier },
      subscription_data: {
        metadata: { school_id, tier }
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
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
