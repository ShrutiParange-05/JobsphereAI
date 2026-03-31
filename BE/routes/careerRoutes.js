import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const prisma = new PrismaClient();

// ─── Helper: clean markdown/code fences from Gemini response ──────────────

function cleanJsonResponse(text) {
  let cleaned = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "");
  cleaned = cleaned.replace(/^\s*json\s*/i, "").replace(/`/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

// ─── Career Guidance Endpoint ──────────────────────────────────────────────

router.get("/guidance", async (req, res) => {
  try {
    const userId = parseInt(req.query.userId);

    console.log("🎯 Fetching career guidance for user:", userId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    // Fetch real user data from DB
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
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Parse skills array
    let skillsArray = [];
    if (typeof user.skills === "string") {
      try {
        skillsArray = JSON.parse(user.skills);
      } catch {
        skillsArray = user.skills.split(",").map((s) => s.trim()).filter(Boolean);
      }
    } else if (Array.isArray(user.skills)) {
      skillsArray = user.skills;
    }

    const testScore = user.testScore || 0;
    const recommendedCareer = user.recommendedCareer || "";
    const resumeSummary = user.resumeSummary || "";

    // ─── Build Gemini prompt ────────────────────────────────────────────

    const skillsList = skillsArray.length > 0 ? skillsArray.join(", ") : "general programming, problem solving";
    const careerHint = recommendedCareer ? `Recommended career from their profile: ${recommendedCareer}.` : "";
    const summaryHint = resumeSummary ? `Their resume summary: "${resumeSummary.slice(0, 400)}".` : "";

    const prompt = `You are an expert career counselor with access to real-time job market data. Analyze this candidate and provide GENUINE, DATA-DRIVEN career guidance based on ACTUAL current market conditions in 2025.

CANDIDATE PROFILE:
- Skills: ${skillsList}
- Assessment Score: ${testScore}% (out of 100)
- ${careerHint}
- ${summaryHint}

Using real industry market data and your knowledge of the 2025 tech job market, return a JSON object with these exact fields:

{
  "skillsMatch": {
    "technicalSkills": <integer 0-100 based on their demonstrated skills>,
    "softSkills": <integer 0-100 estimated from profile>,
    "overallMatch": <integer 0-100 average>
  },
  "recommendedPaths": [
    {
      "title": "<specific job role title>",
      "match": <integer compatibility % based on their skills>,
      "description": "<1 sentence why this fits them>"
    },
    // 3 different roles total
  ],
  "industryDemand": {
    "jobOpeningsGrowth": <real % growth figure from 2025 job market data>,
    "avgSalary": <realistic USD salary for their skill level>,
    "growthRate": <real % annual growth from industry reports>
  },
  "industryInsights": {
    "trends": "<2-3 sentences of REAL current trends in their industry as of 2025>",
    "requiredSkills": [<6 most in-demand skills for their field in 2025, mix of what they have and what they need>]
  },
  "jobMarketLevels": [
    { "level": "Entry Level", "percentage": <integer based on real market data> },
    { "level": "Mid Level", "percentage": <integer> },
    { "level": "Senior Level", "percentage": <integer> }
  ],
  "learningPath": {
    "nextSkills": [<4 specific skills they should learn next based on their gaps>],
    "certifications": [<3-4 specific, real certifications from Coursera/Google/AWS/Microsoft relevant to their path>],
    "timelineMonths": <realistic integer 3-18>
  }
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no explanation. Use REAL market data, not generic placeholders. If they have low score, tailor for growth. If high, tailor for advancement.`;

    // ─── Call Gemini ────────────────────────────────────────────────────

    console.log("🤖 Calling Gemini AI for career guidance...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    console.log("📝 Raw Gemini response (first 300 chars):", rawText.substring(0, 300));

    const cleanedText = cleanJsonResponse(rawText);
    const careerGuidance = JSON.parse(cleanedText);

    console.log("✅ Career guidance generated via AI successfully");

    return res.status(200).json({
      success: true,
      data: careerGuidance,
      generatedBy: "gemini-ai",
    });

  } catch (error) {
    console.error("❌ Error generating career guidance:", error.message);

    // Safe fallback using user's actual test score if available
    const userId = parseInt(req.query.userId);
    let fallbackScore = 70;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { testScore: true, recommendedCareer: true },
      });
      if (user?.testScore) fallbackScore = user.testScore;
    } catch {
      // ignore
    }

    const fallback = {
      skillsMatch: {
        technicalSkills: Math.min(100, fallbackScore + 5),
        softSkills: Math.max(50, fallbackScore - 10),
        overallMatch: fallbackScore,
      },
      recommendedPaths: [
        { title: "Full Stack Developer", match: Math.min(95, fallbackScore + 10), description: "Build complete web applications end-to-end" },
        { title: "Backend Engineer", match: Math.min(90, fallbackScore + 5), description: "Design robust APIs and server-side systems" },
        { title: "DevOps Engineer", match: Math.max(60, fallbackScore - 5), description: "Automate deployment pipelines and cloud infrastructure" },
      ],
      industryDemand: {
        jobOpeningsGrowth: 22,
        avgSalary: fallbackScore >= 70 ? 105000 : 75000,
        growthRate: 16,
      },
      industryInsights: {
        trends: "The 2025 tech job market sees strong demand for AI-augmented developers, cloud-native engineers, and professionals skilled in LLM integration. Remote and hybrid roles continue to dominate.",
        requiredSkills: ["JavaScript", "TypeScript", "Python", "Docker", "AWS", "System Design"],
      },
      jobMarketLevels: [
        { level: "Entry Level", percentage: 38 },
        { level: "Mid Level", percentage: 42 },
        { level: "Senior Level", percentage: 20 },
      ],
      learningPath: {
        nextSkills: ["System Design & Architecture", "Cloud Computing (AWS/GCP)", "AI/ML Integration", "TypeScript Advanced Patterns"],
        certifications: [
          "AWS Certified Developer – Associate",
          "Google Professional Cloud Developer",
          "Meta Front-End Developer Certificate",
          "Microsoft Azure Fundamentals (AZ-900)",
        ],
        timelineMonths: fallbackScore >= 80 ? 4 : fallbackScore >= 60 ? 6 : 9,
      },
    };

    return res.status(200).json({
      success: true,
      data: fallback,
      generatedBy: "fallback",
    });
  }
});

export default router;
