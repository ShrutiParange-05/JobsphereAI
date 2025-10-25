// import { Router } from "express";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { PrismaClient } from "@prisma/client";
// import { ApiResponse } from "../utils/ApiResponse.js";

// const router = Router();
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const prisma = new PrismaClient();

// // Add this helper function at the top of careerRoutes.js
// function cleanJsonResponse(text) {
//   try {
//     // Remove markdown code fences like ```json or ```
//     let cleaned = text.replace(/```(?:json)?\s*/gi, '');
//     // Remove any leading "json" label and stray backticks
//     cleaned = cleaned.replace(/^\s*json\s*/i, '');
//     cleaned = cleaned.replace(/`/g, '');
//     return cleaned.trim();
//   } catch (error) {
//     return text;
//   }
// }


// // Get personalized career guidance
// router.get("/guidance", async (req, res) => {
//   try {
//     const { userId } = req.query;

//     if (!userId) {
//       return res
//         .status(400)
//         .json(new ApiResponse(false, 400, null, "User ID is required"));
//     }

//     console.log("🎯 Fetching career guidance for user:", userId);

//     // Get user data with skills and test results
//     // ✅ CORRECT - Only use fields that exist in your schema
//     const user = await prisma.user.findUnique({
//       where: { id: parseInt(userId) },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         skills: true, // ✅ This exists
//         resumeSummary: true, // ✅ This exists
//         testScore: true,
//         testFeedback: true,
//         recommendedCareer: true,
//         recommendedCourses: true,
//         createdAt: true,
//       },
//     });

//     if (!user) {
//       return res
//         .status(404)
//         .json(new ApiResponse(false, 404, null, "User not found"));
//     }

//     // Extract skills - handle both possible field names
//     const userSkills = user.userSkills?.skills || user.skills?.skills || [];
//     const testScore = user.testResults?.score || 0;
//     const profileSummary =
//       user.userSkills?.summary ||
//       user.skills?.summary ||
//       "No profile summary available";

//     console.log("📊 User skills:", userSkills);
//     console.log("📈 Test score:", testScore);

//     // ✅ If no skills found, return a default response
//     if (userSkills.length === 0) {
//       console.log(
//         "⚠️ No skills found for user, returning default career guidance"
//       );
//       return res.status(200).json(
//         new ApiResponse(
//           true,
//           200,
//           {
//             skillsMatch: {
//               technicalSkills: testScore,
//               softSkills: Math.max(60, testScore - 10),
//               overallMatch: testScore,
//             },
//             recommendedPaths: [
//               {
//                 title: "Full Stack Developer",
//                 match: 85,
//                 description: "Build complete web applications",
//               },
//               {
//                 title: "Backend Engineer",
//                 match: 78,
//                 description: "Focus on server-side development",
//               },
//               {
//                 title: "DevOps Engineer",
//                 match: 72,
//                 description: "Manage infrastructure and deployment",
//               },
//             ],
//             industryDemand: {
//               jobOpeningsGrowth: 25,
//               avgSalary: 90000,
//               growthRate: 18,
//             },
//             industryInsights: {
//               trends:
//                 "Software development continues to grow with increasing demand for cloud and AI skills",
//               requiredSkills: [
//                 "JavaScript",
//                 "Python",
//                 "Docker",
//                 "Kubernetes",
//                 "AWS",
//                 "React",
//               ],
//             },
//             jobMarketLevels: [
//               { level: "Entry Level", percentage: 45 },
//               { level: "Mid Level", percentage: 35 },
//               { level: "Senior Level", percentage: 20 },
//             ],
//             learningPath: {
//               nextSkills: [
//                 "Advanced JavaScript",
//                 "System Design",
//                 "Cloud Architecture",
//               ],
//               certifications: [
//                 "AWS Solutions Architect",
//                 "Kubernetes Administrator",
//               ],
//               timelineMonths: 6,
//             },
//           },
//           "Career guidance generated (default)"
//         )
//       );
//     }

//     // Use Gemini AI to generate career guidance
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

//     const prompt = `You are a career counselor. Based on the following candidate profile, provide comprehensive career guidance.

// Candidate Profile:
// - Skills: ${userSkills.join(", ")}
// - Profile Summary: ${profileSummary}
// - Assessment Score: ${testScore}%

// Provide a JSON response with the following structure (ONLY JSON, no markdown, no explanation):
// {
//   "skillsMatch": {
//     "technicalSkills": 85,
//     "softSkills": 78,
//     "overallMatch": 82
//   },
//   "recommendedPaths": [
//     {"title": "Career Title 1", "match": 95, "description": "Brief description"},
//     {"title": "Career Title 2", "match": 87, "description": "Brief description"},
//     {"title": "Career Title 3", "match": 82, "description": "Brief description"}
//   ],
//   "industryDemand": {
//     "jobOpeningsGrowth": 28,
//     "avgSalary": 95000,
//     "growthRate": 18
//   },
//   "industryInsights": {
//     "trends": "Current industry trends and outlook for this skill set",
//     "requiredSkills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5", "Skill6"]
//   },
//   "jobMarketLevels": [
//     {"level": "Entry Level", "percentage": 45},
//     {"level": "Mid Level", "percentage": 35},
//     {"level": "Senior Level", "percentage": 20}
//   ],
//   "learningPath": {
//     "nextSkills": ["Skill to learn 1", "Skill to learn 2", "Skill to learn 3"],
//     "certifications": ["Certification 1", "Certification 2"],
//     "timelineMonths": 6
//   }
// }

// Base recommendations on REAL tech industry data and current job market trends.`;

//     console.log("🤖 Calling Gemini AI...");
//     const result = await model.generateContent(prompt);
//     let responseText = result.response.text();

//     console.log(
//       "📝 Raw AI response (first 200 chars):",
//       responseText.substring(0, 200)
//     );

//     // Clean response
//     // remove code fences like ``` or ```json (case-insensitive), then remove any stray backticks and leading "json"
//     responseText = responseText.replace(/```(?:json)?\s*/gi, "");
//     responseText = responseText.replace(/^\s*json\s*/i, "");
//     responseText = responseText.replace(/`/g, "");
//     responseText = responseText.trim();

//     // Extract JSON
//     const firstBrace = responseText.indexOf("{");
//     const lastBrace = responseText.lastIndexOf("}");
//     if (firstBrace !== -1 && lastBrace !== -1) {
//       responseText = responseText.substring(firstBrace, lastBrace + 1);
//     }

//     console.log(
//       "🧹 Cleaned response (first 200 chars):",
//       responseText.substring(0, 200)
//     );

//     const careerGuidance = JSON.parse(responseText);

//     console.log("✅ Career guidance generated successfully");

//     return res
//       .status(200)
//       .json(
//         new ApiResponse(true, 200, careerGuidance, "Career guidance generated")
//       );
//   } catch (error) {
//     console.error("❌ Error generating career guidance:", error);
//     console.error("Error stack:", error.stack);
    
//     // ✅ Return a safe default instead of error
//     return res.status(200).json(
//       new ApiResponse(true, 200, {
//         skillsMatch: {
//           technicalSkills: 75,
//           softSkills: 70,
//           overallMatch: 73
//         },
//         recommendedPaths: [
//           { title: "Full Stack Developer", match: 85, description: "Build complete web applications" },
//           { title: "Backend Engineer", match: 78, description: "Focus on server-side development" },
//           { title: "DevOps Engineer", match: 72, description: "Manage infrastructure and deployment" }
//         ],
//         industryDemand: {
//           jobOpeningsGrowth: 25,
//           avgSalary: 90000,
//           growthRate: 18
//         },
//         industryInsights: {
//           trends: "Software development continues to grow with increasing demand for cloud and AI skills",
//           requiredSkills: ["JavaScript", "Python", "Docker", "Kubernetes", "AWS", "React"]
//         },
//         jobMarketLevels: [
//           { level: "Entry Level", percentage: 45 },
//           { level: "Mid Level", percentage: 35 },
//           { level: "Senior Level", percentage: 20 }
//         ],
//         learningPath: {
//           nextSkills: ["Advanced JavaScript", "System Design", "Cloud Architecture"],
//           certifications: ["AWS Solutions Architect", "Kubernetes Administrator"],
//           timelineMonths: 6
//         }
//       }, "Career guidance generated (fallback)")
//     );
//   }
// });

// export default router;

import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Career guidance endpoint
router.get("/guidance", async (req, res) => {
  try {
    const userId = parseInt(req.query.userId);

    console.log("🎯 Fetching career guidance for user:", userId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        skills: true,
        resumeSummary: true,
        testScore: true,
        testFeedback: true,
        recommendedCareer: true,
        recommendedCourses: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has completed assessment
    if (!user.testScore || user.testScore === null) {
      return res.status(400).json({
        success: false,
        message: "Please complete your assessment first",
      });
    }

    // Parse skills
    let skillsArray = [];
    if (typeof user.skills === "string") {
      try {
        skillsArray = JSON.parse(user.skills);
      } catch {
        skillsArray = user.skills.split(",").map((s) => s.trim());
      }
    } else if (Array.isArray(user.skills)) {
      skillsArray = user.skills;
    }

    // Generate career guidance data based on test score
    const testScore = user.testScore || 0;

    // Calculate skills match based on test score
    const technicalSkills = Math.min(100, testScore + 5);
    const softSkills = Math.max(50, testScore - 10);
    const overallMatch = Math.round((technicalSkills + softSkills) / 2);

    // Generate recommended paths
    const recommendedPaths = [
      {
        title: user.recommendedCareer || "Full Stack Developer",
        match: overallMatch,
        description: "Best match based on your skills and test performance",
      },
      {
        title: "Frontend Developer",
        match: Math.max(60, overallMatch - 10),
        description: "Strong foundation in UI/UX development",
      },
      {
        title: "Backend Developer",
        match: Math.max(55, overallMatch - 15),
        description: "Server-side programming and database management",
      },
    ];

    // Industry demand data
    const industryDemand = {
      jobOpeningsGrowth: 12.5,
      avgSalary: 95000,
      growthRate: 15.3,
    };

    // Industry insights
    const industryInsights = {
      trends:
        "The tech industry continues to grow with increasing demand for full-stack developers, cloud engineers, and AI/ML specialists. Remote work opportunities are expanding globally.",
      requiredSkills:
        skillsArray.length > 0
          ? skillsArray
          : ["JavaScript", "React", "Node.js", "Python", "SQL", "Git"],
    };

    // Job market levels
    const jobMarketLevels = [
      { level: "Entry Level", percentage: 35 },
      { level: "Mid Level", percentage: 45 },
      { level: "Senior Level", percentage: 20 },
    ];

    // Learning path
    const learningPath = {
      nextSkills: user.recommendedCourses
        ? user.recommendedCourses
            .split(",")
            .map((c) => c.trim())
            .slice(0, 4)
        : [
            "Advanced JavaScript",
            "Cloud Computing (AWS/Azure)",
            "System Design",
            "DevOps & CI/CD",
          ],
      certifications: [
        "AWS Certified Developer",
        "Microsoft Azure Fundamentals",
        "Google Cloud Professional",
        "Kubernetes Certification",
      ],
      timelineMonths: 6,
    };

    // Construct response
    const careerGuidanceData = {
      skillsMatch: {
        technicalSkills,
        softSkills,
        overallMatch,
      },
      recommendedPaths,
      industryDemand,
      industryInsights,
      jobMarketLevels,
      learningPath,
    };

    console.log("✅ Career guidance generated successfully");

    res.json({
      success: true,
      data: careerGuidanceData,
    });
  } catch (error) {
    console.error("❌ Error generating career guidance:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default router;
