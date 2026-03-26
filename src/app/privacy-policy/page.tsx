import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "ApplyPilot Privacy Policy — how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen hero-bg pt-32 pb-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white border border-surface-300 rounded-2xl p-8 sm:p-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-surface-500 mb-8">
                        Last updated: February 27, 2026
                    </p>

                    <div className="prose prose-slate prose-sm max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1. Introduction</h2>
                            <p className="text-surface-600 leading-relaxed">
                                ApplyPilot (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the website applypilot.us and provides an AI-powered job application automation service. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service. By using ApplyPilot, you agree to the collection and use of information in accordance with this policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2. Information We Collect</h2>
                            <p className="text-surface-600 leading-relaxed mb-3">We collect the following types of information:</p>
                            <ul className="list-disc pl-5 space-y-2 text-surface-600">
                                <li><strong>Account Information:</strong> Name, email address, and profile picture from your Google account when you sign in.</li>
                                <li><strong>Profile Data:</strong> Resume, work experience, skills, job preferences, and career information you provide.</li>
                                <li><strong>Usage Data:</strong> Information about how you interact with our service, including pages visited, features used, and application history.</li>
                                <li><strong>Device Data:</strong> Browser type, IP address, device type, and operating system for security and analytics purposes.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">3. How We Use Your Information</h2>
                            <ul className="list-disc pl-5 space-y-2 text-surface-600">
                                <li>To provide and maintain our AI-powered job application service</li>
                                <li>To personalize your experience and match you with relevant job opportunities</li>
                                <li>To generate tailored resumes and cover letters on your behalf</li>
                                <li>To communicate with you about your account and service updates</li>
                                <li>To improve our AI algorithms and service quality</li>
                                <li>To detect, prevent, and address technical or security issues</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4. Data Sharing</h2>
                            <p className="text-surface-600 leading-relaxed">
                                <strong>We do not sell your personal data.</strong> We may share your information only in the following circumstances:
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-surface-600 mt-3">
                                <li>With job platforms to submit applications on your behalf (with your explicit consent)</li>
                                <li>With service providers who help us operate our platform (e.g., hosting, analytics)</li>
                                <li>When required by law, regulation, or legal process</li>
                                <li>To protect the rights, property, or safety of ApplyPilot, our users, or others</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">5. Data Security</h2>
                            <p className="text-surface-600 leading-relaxed">
                                We implement industry-standard security measures including encryption in transit (TLS/SSL), encryption at rest, and secure access controls to protect your data. However, no method of electronic transmission or storage is 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">6. Data Retention</h2>
                            <p className="text-surface-600 leading-relaxed">
                                We retain your personal data for as long as your account is active or as needed to provide you our services. You can request deletion of your account and associated data at any time by contacting us at contact@applypilot.us.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">7. Your Rights</h2>
                            <p className="text-surface-600 leading-relaxed">You have the right to:</p>
                            <ul className="list-disc pl-5 space-y-2 text-surface-600 mt-3">
                                <li>Access your personal data</li>
                                <li>Correct inaccurate data</li>
                                <li>Request deletion of your data</li>
                                <li>Export your data in a portable format</li>
                                <li>Withdraw consent at any time</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">8. Contact Us</h2>
                            <p className="text-surface-600 leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us at:{" "}
                                <a href="mailto:contact@applypilot.us" className="text-primary-600 hover:underline">
                                    contact@applypilot.us
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
