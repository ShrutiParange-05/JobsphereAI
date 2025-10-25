import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SkillAssessmentSlot {
  skillLevel: string;
  recommendedTime: string;
  improvementArea: string;
  colorClass: string;
}

interface SkillAssessmentProps {
  assessmentData: SkillAssessmentSlot[];
}

export function SkillAssessmentInsights({ assessmentData }: SkillAssessmentProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-white">
          Skill Assessment Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {assessmentData.map((assessment) => (
            <div
              key={assessment.skillLevel}
              className="bg-gray-800/50 rounded-lg p-6 text-center"
            >
              <h3 className="text-lg font-medium text-white mb-2">
                {assessment.skillLevel}
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                Recommended Practice: {assessment.recommendedTime}
              </p>
              <p className={`text-sm ${assessment.colorClass}`}>
                Focus Area: {assessment.improvementArea}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
