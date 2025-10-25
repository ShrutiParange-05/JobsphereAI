"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ArrowRight } from "lucide-react";

interface MetricsDashboardProps {
  id?: string; // Add id prop
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ id }) => {
  // Generate realistic data
  const generateChartData = (baseValue = 50) => {
    return Array.from({ length: 30 }, (_, i) => {
      const fluctuation = Math.random() * 10 - 5; // Random fluctuations
      const trend = i * 0.5; // Gradual trend
      const seasonality = i % 7 === 0 ? 15 : 0; // Weekly spikes

      return {
        date: i,
        value: baseValue + fluctuation + trend + seasonality,
      };
    });
  };

  const metrics = [
    {
      title: "Engagement Rate",
      data: generateChartData(40),
      increase: "+24%",
      period: "Last 30 days",
      stat: "4.8% avg",
      color: "#8B5CF6",
    },
    {
      title: "Career Growth",
      data: generateChartData(45),
      increase: "+12%",
      period: "Last 30 days",
      stat: "+2.4k new",
      color: "#8B5CF6",
    },
    {
      title: "Reach",
      data: generateChartData(55),
      increase: "+18%",
      period: "Last 30 days",
      stat: "85.2k reach",
      color: "#8B5CF6",
    },
    {
      title: " Performance",
      data: generateChartData(50),
      increase: "+15%",
      period: "Last 30 days",
      stat: "92% improved",
      color: "#8B5CF6",
    },
  ];

  return (
    <div id="metrics" className="w-full bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Metrics That Matter</h2>
          <p className="text-gray-600">
            Track the most important metrics to grow your audience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card
              key={index}
              className="p-6 bg-white hover:shadow-lg transition-all duration-300 ease-in-out cursor-pointer hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg">{metric.title}</h3>
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-sm">
                  {metric.increase}
                </span>
              </div>

              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={metric.data}
                    margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                  >
                    {/* Add grid lines */}
                    <CartesianGrid stroke="#eee" strokeDasharray="3 3" />

                    {/* Add X and Y axes */}
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />

                    {/* Add tooltip */}
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                      }}
                    />

                    {/* Add gradient fill */}
                    <defs>
                      <linearGradient
                        id={`gradient-${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={metric.color}
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="100%"
                          stopColor={metric.color}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    {/* Add area chart */}
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={metric.color}
                      strokeWidth={2}
                      fill={`url(#gradient-${index})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className="text-gray-500 text-sm">{metric.period}</span>
                <span className="text-violet-600 font-medium">
                  {metric.stat}
                </span>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <button className="inline-flex items-center text-violet-600 hover:text-violet-700 font-medium transition-colors duration-300 ease-in-out">
            View Detailed Analytics
            <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
