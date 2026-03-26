// Plan configuration — single source of truth for all pricing
export type PlanType = 'basic' | 'pro' | 'elite';

export interface PlanConfig {
    id: PlanType;
    name: string;
    price: number; // in USD
    amountCents: number; // Razorpay requires amount in smallest currency unit (cents for USD)
    features: string[];
    highlighted?: boolean;
    badge?: string;
}

export const PLANS: Record<PlanType, PlanConfig> = {
    basic: {
        id: 'basic',
        name: 'Starter',
        price: 35,
        amountCents: 3500, // $35.00 in cents
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
        amountCents: 7900, // $79.00 in cents
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
        amountCents: 14900, // $149.00 in cents
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

// Max coupon discount in cents ($5.00)
export const MAX_COUPON_DISCOUNT_CENTS = 500;

export const PLAN_ORDER: PlanType[] = ['basic', 'pro', 'elite'];
