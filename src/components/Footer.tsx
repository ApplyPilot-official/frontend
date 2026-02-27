import Link from "next/link";
import Image from "next/image";

const quickLinks = [
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

const legalLinks = [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-of-use", label: "Terms of Use" },
    { href: "/refund-policy", label: "Refund Policy" },
    { href: "/cookie-policy", label: "Cookie Policy" },
    { href: "/disclaimer", label: "Disclaimer" },
];

export default function Footer() {
    return (
        <footer className="relative bg-slate-950 text-white overflow-hidden">
            {/* Top gradient */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent" />

            {/* Decorative orbs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary-600 rounded-full filter blur-[120px] opacity-10" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-accent-500 rounded-full filter blur-[120px] opacity-10" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="relative w-10 h-10">
                                <Image
                                    src="/logo.png"
                                    alt="ApplyPilot"
                                    fill
                                    className="object-contain brightness-0 invert"
                                />
                            </div>
                            <span className="text-xl font-bold">ApplyPilot</span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed mb-4">
                            AI-powered job application automation. Find, tailor, and submit
                            applications automatically.
                        </p>
                        <a
                            href="mailto:contact@applypilot.us"
                            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
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
                            {["twitter", "linkedin", "github"].map((social) => (
                                <a
                                    key={social}
                                    href="#"
                                    aria-label={social}
                                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-600/20 hover:border-primary-500/30 transition-all"
                                >
                                    <span className="text-xs uppercase text-slate-400">
                                        {social[0].toUpperCase()}
                                    </span>
                                </a>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500">
                            Follow us for updates on new features and job market insights.
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} ApplyPilot. All rights reserved.
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                        Built with
                        <span className="text-primary-400">AI</span>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    </p>
                </div>
            </div>
        </footer>
    );
}
