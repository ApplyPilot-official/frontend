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
        amountCents: 3500,
        features: [
            '150–400 auto job applications/month',
            '1 resume profile',
            'Basic AI job matching',
            'AI Resume Builder',
            'AI Cover Letter Generator',
            'Basic Application Tracker',
            'ATS Score Checker',
            'ATS Score Generator',
            'Saved jobs / review before apply',
            'Chat support',
        ],
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: 79,
        amountCents: 7900,
        highlighted: true,
        badge: 'Most Popular',
        features: [
            '300–700 auto job applications/month',
            'Everything in Starter',
            '3 resume profiles',
            'Smart AI matching with filters',
            'ATS Resume Optimizer',
            'Unlimited AI Mock Interviews',
            'AI bullet-point & summary rewrite',
            'Advanced AI Cover Letters',
            'Career Counseling',
            'One-time career guidance session',
            'Full application tracker + pipeline',
            'LinkedIn Profile Optimizer',
            'Premium ATS Score Generator (6 ATS)',
            'Follow-Up Automator',
            'Apply via Email',
            'Priority chat + WhatsApp support',
        ],
    },
    elite: {
        id: 'elite',
        name: 'Elite',
        price: 149,
        amountCents: 14900,
        badge: 'Best Value',
        features: [
            '500+ auto job applications/month (aggressive + human apply)',
            'Everything in Pro',
            'Unlimited resume profiles',
            'Advanced aggressive AI job targeting',
            'Unlimited AI Mock Interviews',
            '1-on-1 Career Coaching',
            'Advanced Analytics Dashboard',
            'Priority support + fastest turnaround',
            'Optional human resume review',
            'Dedicated human support',
            'Salary Insights & Negotiator',
            'Follow-Up Automator',
            'LinkedIn Auto-Apply',
        ],
    },
};

// Max coupon discount in cents ($5.00)
export const MAX_COUPON_DISCOUNT_CENTS = 500;

export const PLAN_ORDER: PlanType[] = ['basic', 'pro', 'elite'];
