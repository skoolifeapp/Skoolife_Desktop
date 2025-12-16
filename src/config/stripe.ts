/**
 * Stripe Configuration
 * 
 * SINGLE SOURCE OF TRUTH for all Stripe product and price IDs.
 * If you need to update IDs, update them here ONLY.
 * 
 * Note: Edge functions cannot import this file directly.
 * When updating IDs here, also update supabase/functions/switch-subscription/index.ts
 */

export const STRIPE_PRODUCTS = {
  student: 'prod_TcIUwE2kzf6me6',
  major: 'prod_TcIU9GEsHSmufa',
} as const;

export const STRIPE_PRICES = {
  student: 'price_1Sf3tHC3rnIsVpuj5m5zh0cG',
  major: 'price_1Sf3tdC3rnIsVpuj9TVbB47r',
} as const;

export const SUBSCRIPTION_TIERS = {
  student: {
    name: 'Student',
    price: '2,99',
    priceId: STRIPE_PRICES.student,
    productId: STRIPE_PRODUCTS.student,
    description: 'Tout pour organiser tes révisions',
  },
  major: {
    name: 'Major',
    price: '4,99',
    priceId: STRIPE_PRICES.major,
    productId: STRIPE_PRODUCTS.major,
    description: 'Révise avec tes camarades',
  },
} as const;

export type SubscriptionTierKey = keyof typeof SUBSCRIPTION_TIERS;
