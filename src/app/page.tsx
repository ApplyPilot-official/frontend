import HeroSection from "@/components/landing/HeroSection";
import TrustTicker from "@/components/landing/TrustTicker";
import PunchlinesSection from "@/components/landing/PunchlinesSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import StatsSection from "@/components/landing/StatsSection";
import PricingSection from "@/components/landing/PricingSection";
import ReviewsSection from "@/components/landing/ReviewsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import FloatingPunchlines from "@/components/landing/FloatingPunchlines";

export default function HomePage() {
  return (
    <div className="relative">
      {/* Floating punchline bubbles across entire page */}
      <FloatingPunchlines />

      <HeroSection />
      <TrustTicker />
      <PunchlinesSection />
      <ComparisonSection />
      <HowItWorksSection />
      <FeaturesSection />
      <StatsSection />
      <PricingSection />
      <ReviewsSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
