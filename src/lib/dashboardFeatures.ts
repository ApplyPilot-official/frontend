/**
 * Single source of truth for all dashboard sidebar features.
 * Used by: dashboard sidebar, admin feature access management.
 * When you add a new feature to the sidebar, just add it here —
 * it will automatically appear in the admin feature access grid.
 */

export interface DashboardFeature {
    id: string;
    label: string;
    icon: string;
    /** Default minimum plan required. Admin overrides take precedence. */
    defaultMinPlan: "none" | "basic" | "pro" | "elite";
    /** If true, feature is always visible regardless of plan (e.g. Help Desk) */
    alwaysVisible?: boolean;
}

export const DASHBOARD_FEATURES: DashboardFeature[] = [
    { id: "overview", label: "Overview", icon: "📊", defaultMinPlan: "none", alwaysVisible: true },
    { id: "ats-screener", label: "ATS Screener", icon: "🎯", defaultMinPlan: "none" },
    { id: "jobs", label: "Job Listings", icon: "💼", defaultMinPlan: "none" },
    { id: "applications", label: "Applications", icon: "📨", defaultMinPlan: "none" },
    { id: "counseling", label: "Career Counseling", icon: "🎓", defaultMinPlan: "none" },
    { id: "mock-interview", label: "Mock Interview", icon: "🎤", defaultMinPlan: "pro" },
    { id: "ai-cover-letters", label: "AI Cover Letters", icon: "✉️", defaultMinPlan: "pro" },
    { id: "resume-builder", label: "Resume Builder", icon: "📝", defaultMinPlan: "pro" },
    { id: "portfolio", label: "Portfolio Maker", icon: "🌐", defaultMinPlan: "basic" },
    { id: "helpdesk", label: "Help Desk", icon: "🎫", defaultMinPlan: "none", alwaysVisible: true },
    { id: "companies", label: "Target Companies", icon: "🏢", defaultMinPlan: "pro" },
    { id: "linkedin", label: "LinkedIn Makeover", icon: "💎", defaultMinPlan: "pro" },
    { id: "analytics", label: "Analytics", icon: "📈", defaultMinPlan: "none" },
];

export const PLAN_TIERS = ["none", "basic", "pro", "elite"] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

/**
 * Feature access map: { featureId: { none: bool, basic: bool, pro: bool, elite: bool } }
 */
export type FeatureAccessMap = Record<string, Record<PlanTier, boolean>>;

/**
 * Generate default feature access map from DASHBOARD_FEATURES.
 * A feature is enabled for a plan if the plan tier >= defaultMinPlan.
 */
export function getDefaultFeatureAccess(): FeatureAccessMap {
    const map: FeatureAccessMap = {};
    for (const feature of DASHBOARD_FEATURES) {
        if (feature.alwaysVisible) {
            map[feature.id] = { none: true, basic: true, pro: true, elite: true };
        } else {
            const minIdx = PLAN_TIERS.indexOf(feature.defaultMinPlan);
            map[feature.id] = {
                none: minIdx <= 0,
                basic: minIdx <= 1,
                pro: minIdx <= 2,
                elite: minIdx <= 3,
            };
        }
    }
    return map;
}
