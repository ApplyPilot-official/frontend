import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Use",
    description: "ApplyPilot Terms of Use — the rules and conditions governing use of our service.",
};

export default function TermsOfUsePage() {
    return (
        <div className="min-h-screen hero-bg pt-32 pb-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white border border-surface-300 rounded-2xl p-8 sm:p-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Use</h1>
                    <p className="text-sm text-surface-500 mb-8">Last updated: February 27, 2026</p>

                    <div className="prose prose-slate prose-sm max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1. Acceptance of Terms</h2>
                            <p className="text-surface-600 leading-relaxed">
                                By accessing or using ApplyPilot (applypilot.us), you agree to be bound by these Terms of Use. If you do not agree, please do not use our service. ApplyPilot is operated as a USA-based SaaS company.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2. Service Description</h2>
                            <p className="text-surface-600 leading-relaxed">
                                ApplyPilot is an AI-assisted automation service that helps users find and apply to job opportunities. Our service includes AI-powered job matching, automated resume tailoring, cover letter generation, and application submission. The service is provided on a subscription basis at $35/month.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">3. User Responsibilities</h2>
                            <ul className="list-disc pl-5 space-y-2 text-surface-600">
                                <li>You are responsible for the accuracy of information in your profile and resume.</li>
                                <li>You are responsible for compliance with the terms of service of any job platforms where applications are submitted.</li>
                                <li>You must not use the service for any unlawful or fraudulent activities.</li>
                                <li>You are responsible for maintaining the security of your account credentials.</li>
                                <li>You acknowledge that AI-generated content should be reviewed before final submission.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4. Subscription & Billing</h2>
                            <p className="text-surface-600 leading-relaxed">
                                ApplyPilot operates on a subscription-based model. By subscribing, you authorize us to charge the applicable fee ($35/month) to your payment method. Subscriptions auto-renew unless cancelled before the renewal date. You may cancel at any time from your dashboard.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">5. Intellectual Property</h2>
                            <p className="text-surface-600 leading-relaxed">
                                All content, features, and functionality of ApplyPilot are owned by ApplyPilot and are protected by copyright, trademark, and other intellectual property laws. You retain ownership of your personal data, resumes, and cover letters. You grant us a limited license to use your data solely to provide the service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">6. Limitation of Liability</h2>
                            <p className="text-surface-600 leading-relaxed">
                                ApplyPilot is provided &quot;as is&quot; without warranties of any kind. We do not guarantee job placement or interview outcomes. We are not liable for any indirect, incidental, special, or consequential damages arising from use of the service. Our total liability shall not exceed the amount paid by you in the past 12 months.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">7. Termination</h2>
                            <p className="text-surface-600 leading-relaxed">
                                We reserve the right to suspend or terminate your account at our sole discretion if you violate these terms or engage in activities that harm the service or other users. You may terminate your account at any time by contacting us.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">8. Changes to Terms</h2>
                            <p className="text-surface-600 leading-relaxed">
                                We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated date. Continued use of the service after changes constitutes acceptance of the new terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">9. Contact</h2>
                            <p className="text-surface-600 leading-relaxed">
                                Questions about these Terms? Contact us at{" "}
                                <a href="mailto:contact@applypilot.us" className="text-primary-600 hover:underline">contact@applypilot.us</a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
