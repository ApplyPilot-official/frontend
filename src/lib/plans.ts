// Plan configuration — single source of truth for all pricing
export type PlanType = 'basic' | 'pro' | 'elite';

export interface PlanConfig {
    id: PlanType;
    name: string;
    price: number; // in USD
    priceINR: number; // in INR (approximate for Razorpay)
    amountPaise: number; // Razorpay requires amount in smallest currency unit
    features: string[];
    highlighted?: boolean;
    badge?: string;
}

export const PLANS: Record<PlanType, PlanConfig> = {
    basic: {
        id: 'basic',
        name: 'Starter',
        price: 35,
        priceINR: 2900,
        amountPaise: 290000, // ₹2,900 in paise
        features: [
            'Unlimited job applications',
            'AI-tailored cover letters',
            'Smart job matching',
            'Application tracking dashboard',
            'Resume optimization',
            'Email support',
        ],
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: 79,
        priceINR: 6500,
        amountPaise: 650000, // ₹6,500 in paise
        highlighted: true,
        badge: 'Most Popular',
        features: [
            'Everything in Starter',
            'LinkedIn Profile Makeover',
            'Custom company targeting',
            'Interview prep assistance',
            'Priority email support',
            'Weekly job market reports',
        ],
    },
    elite: {
        id: 'elite',
        name: 'Elite',
        price: 149,
        priceINR: 12300,
        amountPaise: 1230000, // ₹12,300 in paise
        badge: 'Best Value',
        features: [
            'Everything in Pro',
            'Dedicated account manager',
            'Resume rewrite service',
            'Mock interview sessions',
            '1-on-1 career coaching',
            'Priority application processing',
        ],
    },
};

// Max coupon discount in paise (₹400 ≈ $5)
export const MAX_COUPON_DISCOUNT_PAISE = 40000;
// Max coupon discount in cents (for display)
export const MAX_COUPON_DISCOUNT_CENTS = 500;

export const PLAN_ORDER: PlanType[] = ['basic', 'pro', 'elite'];
