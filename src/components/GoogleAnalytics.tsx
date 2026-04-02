"use client";

import Script from "next/script";
import { useEffect } from "react";

declare global {
    interface Window {
        gtag: (...args: unknown[]) => void;
    }
}

const GA_ID = "G-GN3ETH24T9";

export default function GoogleAnalytics() {
    useEffect(() => {
        const updateConsent = () => {
            const consent = localStorage.getItem("cookie-consent");
            if (consent === "accepted" && typeof window.gtag === "function") {
                window.gtag("consent", "update", {
                    analytics_storage: "granted",
                });
            }
        };

        // Check on mount
        updateConsent();

        // Listen for consent changes
        window.addEventListener("storage", updateConsent);
        window.addEventListener("cookie-consent-updated", updateConsent);
        return () => {
            window.removeEventListener("storage", updateConsent);
            window.removeEventListener("cookie-consent-updated", updateConsent);
        };
    }, []);

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

                    gtag('consent', 'default', {
                        analytics_storage: 'denied',
                    });

                    gtag('js', new Date());
                    gtag('config', '${GA_ID}');
                `}
            </Script>
        </>
    );
}
