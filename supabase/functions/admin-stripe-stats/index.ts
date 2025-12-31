import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-STRIPE-STATS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) throw new Error("Unauthorized: Admin access required");
    logStep("Admin access verified", { userId: user.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get all profiles from Supabase
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, email, first_name, last_name, school, created_at, is_onboarding_complete');

    if (profilesError) throw new Error(`Profiles error: ${profilesError.message}`);
    logStep("Fetched profiles", { count: profiles?.length });

    // Get admin IDs to exclude
    const { data: adminRoles } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    const adminIds = new Set(adminRoles?.map(r => r.user_id) || []);
    const nonAdminProfiles = profiles?.filter(p => !adminIds.has(p.id)) || [];

    // Fetch all Stripe customers at once
    logStep("Fetching all Stripe customers");
    const allCustomers: Stripe.Customer[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const customersResponse = await stripe.customers.list({
        limit: 100,
        starting_after: startingAfter,
      });
      allCustomers.push(...customersResponse.data);
      hasMore = customersResponse.has_more;
      if (customersResponse.data.length > 0) {
        startingAfter = customersResponse.data[customersResponse.data.length - 1].id;
      }
    }
    logStep("Fetched all customers", { count: allCustomers.length });

    // Create email to customer map
    const emailToCustomer = new Map<string, Stripe.Customer>();
    allCustomers.forEach(customer => {
      if (customer.email) {
        emailToCustomer.set(customer.email.toLowerCase(), customer);
      }
    });

    // Fetch all subscriptions at once
    logStep("Fetching all subscriptions");
    const allSubscriptions: Stripe.Subscription[] = [];
    let hasMoreSubs = true;
    let subStartingAfter: string | undefined;

    while (hasMoreSubs) {
      const subscriptionsResponse: Stripe.ApiList<Stripe.Subscription> = await stripe.subscriptions.list({
        limit: 100,
        status: 'all',
        starting_after: subStartingAfter,
      });
      allSubscriptions.push(...subscriptionsResponse.data);
      hasMoreSubs = subscriptionsResponse.has_more;
      if (subscriptionsResponse.data.length > 0) {
        subStartingAfter = subscriptionsResponse.data[subscriptionsResponse.data.length - 1].id;
      }
    }
    logStep("Fetched all subscriptions", { count: allSubscriptions.length });

    // Create customer ID to subscription map
    const customerToSubscription = new Map<string, Stripe.Subscription>();
    allSubscriptions.forEach(sub => {
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
      // Keep the most relevant subscription (active > trialing > canceled)
      const existing = customerToSubscription.get(customerId);
      if (!existing || 
          (sub.status === 'active') || 
          (sub.status === 'trialing' && existing.status !== 'active')) {
        customerToSubscription.set(customerId, sub);
      }
    });

    // Build user subscription data
    interface UserSubscriptionData {
      user_id: string;
      email: string | null;
      first_name: string | null;
      last_name: string | null;
      school: string | null;
      created_at: string | null;
      is_onboarding_complete: boolean | null;
      stripe_status: 'trialing' | 'active' | 'canceled' | 'no_subscription';
      subscription_end: string | null;
      trial_end: string | null;
      cancel_at_period_end: boolean;
      product_id: string | null;
    }

    const now = Math.floor(Date.now() / 1000);
    const usersWithSubscription: UserSubscriptionData[] = nonAdminProfiles.map(profile => {
      const customer = profile.email ? emailToCustomer.get(profile.email.toLowerCase()) : undefined;
      const subscription = customer ? customerToSubscription.get(customer.id) : undefined;

      let stripeStatus: 'trialing' | 'active' | 'canceled' | 'no_subscription' = 'no_subscription';
      let subscriptionEnd: string | null = null;
      let trialEnd: string | null = null;
      let cancelAtPeriodEnd = false;
      let productId: string | null = null;

      if (subscription) {
        // Determine status
        if (subscription.status === 'active') {
          stripeStatus = 'active';
        } else if (subscription.status === 'trialing') {
          stripeStatus = 'trialing';
        } else if (subscription.status === 'canceled' || 
                   (subscription.cancel_at_period_end && subscription.current_period_end > now)) {
          stripeStatus = subscription.current_period_end > now ? 'active' : 'canceled';
        } else {
          stripeStatus = 'canceled';
        }

        cancelAtPeriodEnd = subscription.cancel_at_period_end;

        if (subscription.current_period_end) {
          subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        }

        if (subscription.trial_end) {
          trialEnd = new Date(subscription.trial_end * 1000).toISOString();
        }

        productId = subscription.items.data[0]?.price?.product as string || null;
      }

      return {
        user_id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        school: profile.school,
        created_at: profile.created_at,
        is_onboarding_complete: profile.is_onboarding_complete,
        stripe_status: stripeStatus,
        subscription_end: subscriptionEnd,
        trial_end: trialEnd,
        cancel_at_period_end: cancelAtPeriodEnd,
        product_id: productId,
      };
    });

    // Calculate aggregate stats
    const totalSignups = usersWithSubscription.length;
    const trialsStarted = usersWithSubscription.filter(u => 
      u.stripe_status === 'trialing' || u.stripe_status === 'active' || u.stripe_status === 'canceled'
    ).length;
    const trialsStartedRate = totalSignups > 0 ? (trialsStarted / totalSignups) * 100 : 0;

    const onboardingCompleted = usersWithSubscription.filter(u => u.is_onboarding_complete).length;
    const onboardingCompletedRate = trialsStarted > 0 ? (onboardingCompleted / trialsStarted) * 100 : 0;

    const usersInTrial = usersWithSubscription.filter(u => u.stripe_status === 'trialing').length;
    const convertedUsers = usersWithSubscription.filter(u => u.stripe_status === 'active').length;
    const churnedUsers = usersWithSubscription.filter(u => u.stripe_status === 'canceled').length;

    const totalPostTrial = convertedUsers + churnedUsers;
    const conversionRate = totalPostTrial > 0 ? (convertedUsers / totalPostTrial) * 100 : 0;

    logStep("Stats calculated", {
      totalSignups,
      trialsStarted,
      usersInTrial,
      convertedUsers,
      churnedUsers,
      conversionRate: conversionRate.toFixed(1),
    });

    return new Response(
      JSON.stringify({
        stats: {
          totalSignups,
          trialsStarted,
          trialsStartedRate,
          onboardingCompleted,
          onboardingCompletedRate,
          usersInTrial,
          convertedUsers,
          churnedUsers,
          conversionRate,
        },
        users: usersWithSubscription,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
