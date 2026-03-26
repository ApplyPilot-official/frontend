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

const socialLinks = [
    { name: "LinkedIn", icon: "in", href: "https://www.linkedin.com/company/applypilot-official/about/?viewAsMember=true" },
    { name: "Instagram", icon: "\uD83D\uDCF7", href: "https://www.instagram.com/applypilot.us/" },
    { name: "WhatsApp", icon: "💬", href: "https://wa.me/91857205555865" },
];

export default function Footer() {
    return (
        <footer className="relative bg-surface-100 text-surface-800 overflow-hidden">
            <div className="section-divider" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="relative w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md">
                                <Image
                                    src="/logo.png"
                                    alt="ApplyPilot"
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-xl font-bold text-surface-950">
                                Apply<span className="gradient-text">Pilot</span>
                            </span>
                        </Link>
                        <p className="text-surface-600 text-sm leading-relaxed mb-2">
                            Never Miss Your Dream Job Again.
                        </p>
                        <p className="text-surface-500 text-xs leading-relaxed mb-4">
                            AI-powered job application automation. Find, tailor, and submit
                            applications while you sleep.
                        </p>
                        <a
                            href="mailto:contact@applypilot.us"
                            className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                        >
                            contact@applypilot.us
                        </a>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-800 mb-4">
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-surface-600 hover:text-primary-600 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-800 mb-4">
                            Legal
                        </h3>
                        <ul className="space-y-3">
                            {legalLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-surface-600 hover:text-primary-600 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-800 mb-4">
                            Connect
                        </h3>
                        <div className="flex gap-3 mb-6">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.name}
                                    className="w-10 h-10 rounded-lg bg-white border border-surface-300 flex items-center justify-center hover:bg-primary-50 hover:border-primary-300 transition-all text-sm text-surface-700"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                        <p className="text-xs text-surface-500">
                            Follow us for job search tips and product updates.
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-surface-300 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-surface-500">
                        &copy; {new Date().getFullYear()} ApplyPilot. All rights reserved.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                        <a href="mailto:contact@applypilot.us" className="text-xs text-surface-500 hover:text-primary-500 transition-colors">✉️ contact@applypilot.us</a>
                        <a href="https://www.linkedin.com/company/applypilot-official/about/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="text-xs text-surface-500 hover:text-primary-500 transition-colors">🔗 LinkedIn</a>
                    </div>
                    <p className="text-sm text-surface-600 flex items-center gap-1.5">
                        Powered by
                        <span className="gradient-text font-semibold">AI</span>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                    </p>
                </div>
            </div>
        </footer>
    );
}
