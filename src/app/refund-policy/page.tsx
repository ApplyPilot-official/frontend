import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Refund Policy",
    description: "ApplyPilot Refund Policy — our commitment to customer satisfaction.",
};

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen hero-bg pt-32 pb-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white border border-surface-300 rounded-2xl p-8 sm:p-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Refund Policy</h1>
                    <p className="text-sm text-surface-500 mb-8">Last updated: February 27, 2026</p>

                    <div className="prose prose-slate prose-sm max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1. Overview</h2>
                            <p className="text-surface-600 leading-relaxed">
                                At ApplyPilot, we want you to be completely satisfied with our service. This refund policy outlines the terms under which we offer refunds for our subscription service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2. Free Trial</h2>
                            <p className="text-surface-600 leading-relaxed">
                                We offer a 7-day free trial for new users. During the trial period, you have full access to all features. No charge will be made during the trial period. If you cancel before the trial ends, you will not be charged.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">3. 30-Day Money-Back Guarantee</h2>
                            <p className="text-surface-600 leading-relaxed">
                                If you are not satisfied with ApplyPilot within the first 30 days of your paid subscription, you may request a full refund. Simply contact us at contact@applypilot.us with your account details and reason for the refund.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4. After 30 Days</h2>
                            <p className="text-surface-600 leading-relaxed">
                                After the initial 30-day period, refunds are provided on a prorated basis at our discretion. You may cancel your subscription at any time, and it will remain active until the end of your current billing period. No partial refunds are provided for unused portions of the current billing cycle after 30 days.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">5. How to Request a Refund</h2>
                            <p className="text-surface-600 leading-relaxed">
                                To request a refund, email us at{" "}
                                <a href="mailto:contact@applypilot.us" className="text-primary-600 hover:underline">contact@applypilot.us</a>{" "}
                                with the subject line &quot;Refund Request&quot; and include your account email and reason for the request. We process refunds within 5-10 business days.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">6. Exceptions</h2>
                            <p className="text-surface-600 leading-relaxed">
                                Refunds will not be provided in cases of: violation of our Terms of Use, fraudulent activity, or abuse of the refund policy (e.g., repeated subscription and refund cycles).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">7. Contact</h2>
                            <p className="text-surface-600 leading-relaxed">
                                For refund inquiries, contact us at{" "}
                                <a href="mailto:contact@applypilot.us" className="text-primary-600 hover:underline">contact@applypilot.us</a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
