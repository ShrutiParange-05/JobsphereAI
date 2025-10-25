import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Monitor, Layout } from "lucide-react"

// Helper function for progress bar colors
const getProgressColorClass = (color: string) => {
  switch(color) {
    case 'green': return '[&>div]:bg-green-500';
    case 'blue': return '[&>div]:bg-blue-500';
    case 'purple': return '[&>div]:bg-purple-500';
    default: return '[&>div]:bg-gray-500';
  }
};

// Helper function for icon colors
const getColorClasses = (color: string) => {
  switch(color) {
    case 'blue': return { bg: 'bg-blue-500/10', text: 'text-blue-500' };
    case 'purple': return { bg: 'bg-purple-500/10', text: 'text-purple-500' };
    default: return { bg: 'bg-gray-500/10', text: 'text-gray-500' };
  }
};

export default function CareerGuidance() {
  const [techSkills, setTechSkills] = useState(87);
  const [softSkills, setSoftSkills] = useState(79);
  const skillsMatch = (techSkills + softSkills) / 2;

  const [recommendedPaths] = useState([
    { title: 'Full Stack Developer', match: 95, icon: Monitor, color: 'blue' },
    { title: 'UX Designer', match: 85, icon: Layout, color: 'purple' },
  ]);

  const [industryStats] = useState({
    jobOpeningsGrowth: 25,
    avgSalary: 85000,
    growthRate: 15
  });

  const [industryInsights] = useState({
    trends: "AI and Machine Learning continue to be the fastest-growing sectors with a 35% increase in job demand.",
    skills: ['React.js', 'Node.js', 'Python', 'AWS', 'TensorFlow', 'Cloud Computing']
  });

  const [jobMarketLevels] = useState([
    { level: 'Entry Level', percentage: 45, color: 'green' },
    { level: 'Mid Level', percentage: 35, color: 'blue' },
    { level: 'Senior Level', percentage: 20, color: 'purple' },
  ]);

  // Simulate dynamic updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTechSkills(Math.min(100, Math.floor(Math.random() * 15 + 80)));
      setSoftSkills(Math.min(100, Math.floor(Math.random() * 15 + 75)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Career Guidance</h1>
          <p className="text-gray-400">Your personalized career development insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Skills Match Card */}
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Skills Match</CardTitle>
                <span className="text-3xl text-blue-500">
                  {Math.round(skillsMatch)}%
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Technical Skills</span>
                  <span>{techSkills}%</span>
                </div>
                <Progress 
                  value={techSkills} 
                  className="h-2 bg-gray-800 [&>div]:bg-blue-500" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Soft Skills</span>
                  <span>{softSkills}%</span>
                </div>
                <Progress 
                  value={softSkills} 
                  className="h-2 bg-gray-800 [&>div]:bg-pink-500" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Recommended Paths Card */}
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
              <CardTitle>Recommended Paths</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendedPaths.map((path, index) => {
                const colors = getColorClasses(path.color);
                return (
                  <button 
                    key={index}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${colors.bg} rounded-lg`}>
                        <path.icon className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <div className="text-left">
                        <div>{path.title}</div>
                        <div className="text-sm text-gray-400">{path.match}% match</div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </button>
                )})}
            </CardContent>
          </Card>

          {/* Industry Demand Card */}
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
              <CardTitle>Industry Demand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Job Openings</span>
                <span className="text-green-500">↑ {industryStats.jobOpeningsGrowth}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average Salary</span>
                <span className="text-green-500">${industryStats.avgSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Growth Rate</span>
                <span className="text-green-500">↑ {industryStats.growthRate}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Industry Insights Card */}
          <Card className="bg-gray-900 border-gray-800 text-white md:col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Industry Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Tech Industry Trends</h3>
                <p className="text-gray-400">
                  {industryInsights.trends}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
                <div className="flex gap-2 flex-wrap">
                  {industryInsights.skills.map((skill, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Market Analysis Card */}
          <Card className="bg-gray-900 border-gray-800 text-white">
            <CardHeader>
              <CardTitle>Job Market Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobMarketLevels.map((level, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{level.level}</span>
                    <span>{level.percentage}%</span>
                  </div>
                  <Progress 
                    value={level.percentage} 
                    className={`h-2 bg-gray-800 ${getProgressColorClass(level.color)}`} 
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}