"use client";

import Image from "next/image";

const companies = [
    { name: "Google", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/google.svg", color: "#4285F4" },
    { name: "Amazon", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/amazon.svg", color: "#FF9900" },
    { name: "Microsoft", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/microsoft.svg", color: "#00A4EF" },
    { name: "Meta", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/meta.svg", color: "#0668E1" },
    { name: "Apple", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/apple.svg", color: "#A2AAAD" },
    { name: "Netflix", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/netflix.svg", color: "#E50914" },
    { name: "Tesla", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/tesla.svg", color: "#CC0000" },
    { name: "Uber", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/uber.svg", color: "#FFFFFF" },
    { name: "Spotify", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/spotify.svg", color: "#1DB954" },
    { name: "Adobe", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/adobe.svg", color: "#FF0000" },
    { name: "Infosys", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/infosys.svg", color: "#007CC3" },
    { name: "Deloitte", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/deloitte.svg", color: "#86BC25" },
    { name: "Flipkart", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/flipkart.svg", color: "#F7D03E" },
    { name: "Wipro", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/wipro.svg", color: "#341C53" },
    { name: "Oracle", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/oracle.svg", color: "#F80000" },
    { name: "Salesforce", logo: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@latest/icons/salesforce.svg", color: "#00A1E0" },
];

export default function TrustTicker() {
    return (
        <section className="py-12 relative overflow-hidden border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
                <p className="text-sm text-slate-500 uppercase tracking-widest mb-1">
                    ApplyPilot users got hired at
                </p>
                <p className="text-xs text-slate-600">
                    Trusted by 10,000+ job seekers worldwide
                </p>
            </div>
            <div className="relative">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-dark-700 to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-dark-700 to-transparent z-10" />

                <div className="flex animate-scroll-left">
                    {[...companies, ...companies].map((company, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-center gap-3 px-8 py-3 shrink-0 group cursor-default"
                        >
                            {/* Logo */}
                            <div
                                className="relative w-6 h-6 shrink-0 opacity-50 group-hover:opacity-100 transition-all duration-300"
                                style={{
                                    filter: `brightness(0) invert(1)`,
                                }}
                            >
                                <Image
                                    src={company.logo}
                                    alt={company.name}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                            {/* Company Name */}
                            <span
                                className="text-lg font-bold whitespace-nowrap transition-all duration-300 opacity-60 group-hover:opacity-100"
                                style={{
                                    color: company.color,
                                    textShadow: `0 0 20px ${company.color}33`,
                                }}
                            >
                                {company.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
