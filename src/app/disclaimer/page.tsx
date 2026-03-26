import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Disclaimer",
    description: "ApplyPilot Disclaimer — important notices regarding our service.",
};

export default function DisclaimerPage() {
    return (
        <div className="min-h-screen hero-bg pt-32 pb-24">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white border border-surface-300 rounded-2xl p-8 sm:p-10">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Disclaimer</h1>
                    <p className="text-sm text-surface-500 mb-8">Last updated: February 27, 2026</p>

                    <div className="prose prose-slate prose-sm max-w-none space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1. General Disclaimer</h2>
                            <p className="text-surface-600 leading-relaxed">
                                The information and services provided by ApplyPilot are for general job application assistance purposes only. While we strive to provide accurate and effective AI-powered services, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2. No Employment Guarantee</h2>
                            <p className="text-surface-600 leading-relaxed">
                                ApplyPilot does not guarantee job placement, interviews, or any specific outcomes from using our service. Job search success depends on many factors beyond our control, including market conditions, qualifications, and employer decisions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">3. AI-Generated Content</h2>
                            <p className="text-surface-600 leading-relaxed">
                                Our service uses artificial intelligence to generate resumes, cover letters, and other application materials. While our AI is trained to produce high-quality content, users are responsible for reviewing all AI-generated content before it is submitted. ApplyPilot is not liable for any errors, omissions, or inaccuracies in AI-generated content.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4. Third-Party Platforms</h2>
                            <p className="text-surface-600 leading-relaxed">
                                ApplyPilot interacts with third-party job platforms to submit applications on your behalf. Users are responsible for complying with the terms of service of each job platform. We are not affiliated with, endorsed by, or sponsored by any of these platforms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">5. Limitation of Liability</h2>
                            <p className="text-surface-600 leading-relaxed">
                                In no event shall ApplyPilot be liable for any loss or damage including, without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">6. Contact</h2>
                            <p className="text-surface-600 leading-relaxed">
                                For questions about this disclaimer, contact us at{" "}
                                <a href="mailto:contact@applypilot.us" className="text-primary-600 hover:underline">contact@applypilot.us</a>
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
