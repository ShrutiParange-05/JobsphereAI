"use client";
import React from "react";
import HeroSection from "@/components/HeroSection";
import AnalyticsFeaturesSection from "@/components/AnalyticsFeaturesSection";
import HowItWorks from "@/components/HowItWorks";
import MetricsDashboard from "@/components/MetricsDashboard";
import FAQAndFooter from "@/components/FAQAndFooter";
import { Header } from "@/components/Header";
import TeamSection from "@/components/TeamSection";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main>
        <HeroSection />
        <AnalyticsFeaturesSection id="features" />
        <HowItWorks id="how-it-works" />
        <MetricsDashboard id="metrics" />
        <TeamSection id="team" />
        <FAQAndFooter id="faq" />
      </main>
    </div>
  );
};

export default LandingPage;
