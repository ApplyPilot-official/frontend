import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "ApplyPilot - AI Job Application Automation",
        short_name: "ApplyPilot",
        description: "AI-powered job application assistant that automatically finds and applies to relevant jobs for you.",
        start_url: "/",
        display: "standalone",
        background_color: "#f8faff",
        theme_color: "#2563eb",
        icons: [
            {
                src: "/logo.png",
                sizes: "500x500",
                type: "image/png",
            },
        ],
    };
}
