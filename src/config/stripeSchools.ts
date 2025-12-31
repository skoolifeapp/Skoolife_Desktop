// Stripe B2B Schools pricing configuration
export const SCHOOL_STRIPE_PRODUCTS = {
  starter: {
    product_id: "prod_ThpYoA0dp4dNsj",
    price_id: "price_1SkPtqC3rnIsVpujKRmVmmlH",
    name: "Starter",
    description: "Jusqu'à 50 élèves",
    price_cents: 99900, // 999€/an
    max_students: 50,
  },
  growth: {
    product_id: "prod_ThpYfKXhVtdkug",
    price_id: "price_1SkPtrC3rnIsVpujuQy0iuOI",
    name: "Growth",
    description: "Jusqu'à 200 élèves",
    price_cents: 249900, // 2499€/an
    max_students: 200,
  },
  enterprise: {
    product_id: "prod_ThpZsE9tLuV5oA",
    price_id: "price_1SkPttC3rnIsVpujVRv1xmce",
    name: "Enterprise",
    description: "Élèves illimités",
    price_cents: 499900, // 4999€/an
    max_students: null, // unlimited
  },
} as const;

export type SchoolTier = keyof typeof SCHOOL_STRIPE_PRODUCTS;
