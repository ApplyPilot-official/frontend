import Link from "next/link";
import Image from "next/image";

const quickLinks = [
    { href: "/#features", label: "Features" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#reviews", label: "Reviews" },
    { href: "/#business", label: "For Business" },
];

const legalLinks = [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-of-use", label: "Terms of Use" },
    { href: "/refund-policy", label: "Refund Policy" },
    { href: "/disclaimer", label: "Disclaimer" },
];

export default function Footer() {
    return (
        <footer className="relative bg-dark-900 text-white overflow-hidden">
            {/* Top gradient line */}
            <div className="section-divider" />

            {/* Decorative orbs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-neon-blue rounded-full filter blur-[150px] opacity-[0.07]" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-neon-violet rounded-full filter blur-[150px] opacity-[0.07]" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="relative w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg shadow-white/10">
                                <Image
                                    src="/logo.png"
                                    alt="ApplyPilot"
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-xl font-bold">
                                Apply<span className="gradient-text">Pilot</span>
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed mb-2">
                            Never Miss Your Dream Job Again.
                        </p>
                        <p className="text-slate-500 text-xs leading-relaxed mb-4">
                            AI-powered job application automation. Find, tailor, and submit
                            applications while you sleep.
                        </p>
                        <a
                            href="mailto:contact@applypilot.us"
                            className="text-sm text-neon-blue hover:text-neon-blue/80 transition-colors"
                        >
                            contact@applypilot.us
                        </a>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-slate-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
                            Legal
                        </h3>
                        <ul className="space-y-3">
                            {legalLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-slate-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
                            Connect
                        </h3>
                        <div className="flex gap-3 mb-6">
                            {[
                                { name: "Twitter", icon: "𝕏" },
                                { name: "LinkedIn", icon: "in" },
                                { name: "Instagram", icon: "📷" },
                            ].map((social) => (
                                <a
                                    key={social.name}
                                    href="#"
                                    aria-label={social.name}
                                    className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-neon-blue/10 hover:border-neon-blue/30 transition-all text-sm"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500">
                            Follow us for job search tips and product updates.
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} ApplyPilot. All rights reserved.
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-1.5">
                        Powered by
                        <span className="gradient-text font-semibold">AI</span>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </p>
                </div>
            </div>
        </footer>
    );
}
