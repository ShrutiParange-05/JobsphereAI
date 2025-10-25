"use client";
import {
  BarChart2,
  Users,
  Clock,
  PieChart,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface AnalyticsFeaturesSectionProps {
  id?: string; // Add id prop
}

const AnalyticsFeaturesSection: React.FC<AnalyticsFeaturesSectionProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  id,
}) => {
  const features = [
    {
      icon: <BarChart2 className="w-6 h-6 text-violet-500" />,
      title: "AI Interviewer",
      description:
        "Leverage AI-driven analytics to understand which content resonates the most with your audience by tracking likes, comments, saves, and shares. Optimize your content strategy with data-backed insights.",
    },
    {
      icon: <Users className="w-6 h-6 text-violet-500" />,
      title: "Career Insights",
      description:
        "Access in-depth demographic data and valuable insights about your audience's behavior. Gain a better understanding of follower growth, engagement patterns, and preferences to refine your strategy.",
    },
    {
      icon: <Clock className="w-6 h-6 text-violet-500" />,
      title: "Job Recommendation",
      description:
        "AI-powered recommendations to help you find the best times to post based on when your audience is most active. Maximize engagement and increase visibility with smart timing suggestions.",
    },
    {
      icon: <PieChart className="w-6 h-6 text-violet-500" />,
      title: "Performance Reports",
      description:
        "Receive detailed automated reports on a weekly and monthly basis, showcasing key performance metrics. Gain actionable insights to help you track your growth and make informed decisions.",
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-violet-500" />,
      title: "Competitor Analysis",
      description:
        "Benchmark your performance against competitors in your field. Identify strengths, weaknesses, and potential areas for growth by comparing key metrics and strategies.",
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-violet-500" />,
      title: "Content Performance",
      description:
        "Dive deep into the performance of your posts. Get AI-powered recommendations to improve engagement and refine your content strategy based on detailed performance data.",
    },
  ];

  return (
    <div
      id="features"
      className="w-full px-4 py-16 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Powerful Analytics Features
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get comprehensive insights into your Skill performance with our
            advanced analytics tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 bg-white hover:shadow-lg transition-shadow duration-300"
            >
              <div className="bg-violet-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFeaturesSection;
