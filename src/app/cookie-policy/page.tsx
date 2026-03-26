import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cookie Policy",
    description: "ApplyPilot Cookie Policy — how we use cookies and similar technologies.",
};

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen hero-bg pt-32 pb-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white border border-surface-300 rounded-2xl p-8 sm:p-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Cookie Policy</h1>
                    <p className="text-sm text-surface-500 mb-8">Last updated: February 27, 2026</p>

                    <div className="prose prose-slate prose-sm max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1. What Are Cookies</h2>
                            <p className="text-surface-600 leading-relaxed">
                                Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience, remember your preferences, and analyze site traffic.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2. Types of Cookies We Use</h2>
                            <ul className="list-disc pl-5 space-y-3 text-surface-600">
                                <li><strong>Essential Cookies:</strong> Required for the website to function. These include authentication cookies (e.g., session tokens from Google Login) and security cookies.</li>
                                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website. We use this data to improve our service. These cookies do not personally identify you.</li>
                                <li><strong>Preference Cookies:</strong> Remember your settings and preferences (e.g., language, theme) to personalize your experience.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">3. Third-Party Cookies</h2>
                            <p className="text-surface-600 leading-relaxed">
                                We use Google Authentication for login, which may set its own cookies. We do not control third-party cookies. Please refer to Google&apos;s privacy policy for information on their cookie practices.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4. Managing Cookies</h2>
                            <p className="text-surface-600 leading-relaxed">
                                You can control and manage cookies through your browser settings. Most browsers allow you to reject or delete cookies. Note that disabling essential cookies may affect the functionality of our service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">5. Contact</h2>
                            <p className="text-surface-600 leading-relaxed">
                                For questions about our cookie practices, contact us at{" "}
                                <a href="mailto:contact@applypilot.us" className="text-primary-600 hover:underline">contact@applypilot.us</a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
