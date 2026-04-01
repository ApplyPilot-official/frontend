"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = "G-GN3ETH24T9";

export default function GoogleAnalytics() {
    const [consentGiven, setConsentGiven] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent");
        if (consent === "accepted") {
            setConsentGiven(true);
        }

        // Listen for consent changes from the CookieConsent component
        const handleStorage = () => {
            const updated = localStorage.getItem("cookie-consent");
            if (updated === "accepted") setConsentGiven(true);
        };
        window.addEventListener("storage", handleStorage);
        // Also listen for a custom event for same-tab updates
        window.addEventListener("cookie-consent-updated", handleStorage);
        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("cookie-consent-updated", handleStorage);
        };
    }, []);

    if (!consentGiven) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_ID}');
                `}
            </Script>
        </>
    );
}
