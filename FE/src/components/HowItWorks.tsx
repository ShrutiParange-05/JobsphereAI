"use client";
import { BarChart2, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // Import useRouter

interface HowItWorksProps {
  id?: string; // Add id prop
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HowItWorks: React.FC<HowItWorksProps> = ({ id }) => {
  const router = useRouter(); // Initialize the router

  const steps = [
    {
      number: "1",
      title: "Connect Your Account",
      description: "Securely link your account with just one click",
      icon: <Lock className="w-6 h-6 text-violet-400" />,
      feature: "Secure OAuth 2.0",
    },
    {
      number: "2",
      title: "Data Analysis",
      description: "Our AI analyzes your account data in real-time",
      icon: <BarChart2 className="w-6 h-6 text-violet-400" />,
      feature: "Real-time Processing",
    },
    {
      number: "3",
      title: "Get Insights",
      description: "Access detailed reports and actionable insights",
      icon: <Shield className="w-6 h-6 text-violet-400" />,
      feature: "Actionable Reports",
    },
  ];

  // Function to handle navigation to the dashboard
  const handleGetStarted = () => {
    router.push("/dashboard"); // Navigate to the dashboard page
  };

  return (
    <div id="how-it-works" className="w-full bg-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-400">
            Get started with JobSphereAI in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {step.number}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-6 pt-10 h-full hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300 ease-in-out cursor-pointer hover:-translate-y-1">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 mb-6">{step.description}</p>
                </div>

                <div className="bg-zinc-800 rounded-lg p-4 flex items-center justify-center gap-3">
                  {step.icon}
                  <span className="text-gray-300">{step.feature}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-2 rounded-full transition-colors duration-300 ease-in-out"
            onClick={handleGetStarted} // Add onClick handler
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
