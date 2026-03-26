import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Refund Policy",
    description: "ApplyPilot Refund Policy — our commitment to service quality.",
};

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen hero-bg pt-32 pb-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white border border-surface-300 rounded-2xl p-8 sm:p-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Refund Policy</h1>
                    <p className="text-sm text-surface-500 mb-8">Last updated: March 27, 2026</p>

                    <div className="prose prose-slate prose-sm max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1. Overview</h2>
                            <p className="text-surface-600 leading-relaxed">
                                ApplyPilot is a subscription-based AI-powered job application automation service. All subscription payments are <strong>non-refundable</strong> by default. We do not offer free trials. By subscribing, you acknowledge and agree to these terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2. No Free Trial</h2>
                            <p className="text-surface-600 leading-relaxed">
                                ApplyPilot does not offer a free trial period. All plans require payment upfront. We recommend reviewing our features, pricing, and documentation carefully before subscribing.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">3. Refund Eligibility — Extreme Cases Only</h2>
                            <p className="text-surface-600 leading-relaxed">
                                Refunds are considered <strong>only in extreme circumstances</strong> where our AI automation system completely fails to deliver the core service. Specifically, a refund may be granted if:
                            </p>
                            <ul className="list-disc pl-6 mt-3 space-y-2 text-surface-600 leading-relaxed">
                                <li>Our AI agents are <strong>unable to auto-apply to at least 30 jobs</strong> within your billing month.</li>
                                <li>The failure is entirely on ApplyPilot&apos;s end (e.g., system-wide outage, technical malfunction) and not due to incomplete profile setup, invalid credentials, or user error.</li>
                            </ul>
                            <p className="text-surface-600 leading-relaxed mt-3">
                                Refunds are <strong>not</strong> provided for reasons such as: not liking the results, not landing interviews, change of mind, duplicate subscriptions, or failure to use the service during the billing period.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4. How to Request a Refund</h2>
                            <p className="text-surface-600 leading-relaxed">
                                If you believe you qualify for a refund under the extreme case policy above, email us at{" "}
                                <a href="mailto:contact@applypilot.us" className="text-primary-600 hover:underline font-medium">contact@applypilot.us</a>{" "}
                                with the subject line &quot;Refund Request&quot; and include:
                            </p>
                            <ul className="list-disc pl-6 mt-3 space-y-2 text-surface-600 leading-relaxed">
                                <li>Your registered email address</li>
                                <li>Your subscription plan and billing date</li>
                                <li>A clear description of the issue, including evidence that fewer than 30 jobs were applied</li>
                            </ul>
                            <p className="text-surface-600 leading-relaxed mt-3">
                                Our team will review your request and respond within 5–10 business days. Refund decisions are made at ApplyPilot&apos;s sole discretion.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">5. Subscription Cancellation</h2>
                            <p className="text-surface-600 leading-relaxed">
                                You may cancel your subscription at any time from your dashboard. Upon cancellation, your plan remains active until the end of the current billing period. No partial refunds are provided for unused time.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">6. Exceptions &amp; Abuse</h2>
                            <p className="text-surface-600 leading-relaxed">
                                Refunds will not be provided in cases of: violation of our Terms of Use, fraudulent activity, abuse of the refund policy, or repeated subscribe-and-refund cycles.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">7. Contact</h2>
                            <p className="text-surface-600 leading-relaxed">
                                For any billing or refund inquiries, contact us at{" "}
                                <a href="mailto:contact@applypilot.us" className="text-primary-600 hover:underline font-medium">contact@applypilot.us</a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
