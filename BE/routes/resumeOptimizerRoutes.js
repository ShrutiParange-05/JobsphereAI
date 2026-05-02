import { Router } from "express";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiResponse } from "../utils/ApiResponse.js";

// Import pdf-parse correctly
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
});

// ─── Helper ────────────────────────────────────────────────────────────────
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

// ─── Optimization Type Prompts ─────────────────────────────────────────────

const OPTIMIZATION_PROMPTS = {
  ats_keywords: (resumeText, jobTitle, jobDesc) => `You are an expert ATS (Applicant Tracking System) optimization specialist.

RESUME TEXT:
${resumeText}

TARGET JOB TITLE: ${jobTitle || "General"}
${jobDesc ? `JOB DESCRIPTION:\n${jobDesc}` : ""}

Analyze this resume for ATS optimization. Return ONLY valid JSON:
{
  "atsScore": <integer 0-100>,
  "currentKeywords": ["<existing keywords found>"],
  "missingKeywords": ["<critical keywords missing for this role>"],
  "keywordDensity": "<assessment: too low/optimal/too high>",
  "optimizedSections": {
    "skills": "<rewritten skills section with ATS-friendly keywords>",
    "summary": "<ATS-optimized professional summary>"
  },
  "recommendations": ["<5-7 actionable ATS optimization tips>"],
  "formatIssues": ["<any ATS-unfriendly formatting detected>"],
  "industryKeywords": ["<top 10 industry-specific keywords to add>"]
}`,

  experience_enhancer: (resumeText, jobTitle, jobDesc) => `You are an expert resume experience section writer.

RESUME TEXT:
${resumeText}

TARGET JOB TITLE: ${jobTitle || "General"}
${jobDesc ? `JOB DESCRIPTION:\n${jobDesc}` : ""}

Enhance the experience section using STAR method and quantifiable achievements. Return ONLY valid JSON:
{
  "originalExperiences": ["<detected experience entries>"],
  "enhancedExperiences": [
    {
      "role": "<job title>",
      "company": "<company>",
      "original": "<original description>",
      "enhanced": "<enhanced bullet points with metrics, action verbs, and STAR method>",
      "improvements": ["<what was improved and why>"]
    }
  ],
  "actionVerbsSuggested": ["<10 powerful action verbs to use>"],
  "metricsToAdd": ["<suggested quantifiable metrics they could add>"],
  "overallTips": ["<3-4 tips for experience section>"]
}`,

  skills_hierarchy: (resumeText, jobTitle, jobDesc) => `You are an expert at organizing technical and professional skills.

RESUME TEXT:
${resumeText}

TARGET JOB TITLE: ${jobTitle || "General"}
${jobDesc ? `JOB DESCRIPTION:\n${jobDesc}` : ""}

Create an optimal skills hierarchy. Return ONLY valid JSON:
{
  "currentSkills": ["<all skills found in resume>"],
  "organizedSkills": {
    "technical": {
      "expert": ["<skills they clearly demonstrate expertise in>"],
      "proficient": ["<skills they appear proficient in>"],
      "familiar": ["<skills they appear to have basic knowledge of>"]
    },
    "soft": ["<soft skills detected or inferred>"],
    "tools": ["<specific tools, platforms, frameworks>"],
    "certifications": ["<any certs mentioned>"]
  },
  "missingForRole": ["<critical skills missing for the target role>"],
  "recommendedOrder": "<how to order skills for maximum impact>",
  "formattingSuggestion": "<how to visually present skills section>",
  "skillGapAnalysis": "<2-3 sentences on skill gaps and priorities>"
}`,

  professional_summary: (resumeText, jobTitle, jobDesc) => `You are an expert at crafting compelling professional summaries.

RESUME TEXT:
${resumeText}

TARGET JOB TITLE: ${jobTitle || "General"}
${jobDesc ? `JOB DESCRIPTION:\n${jobDesc}` : ""}

Create multiple professional summary options. Return ONLY valid JSON:
{
  "currentSummary": "<detected existing summary or 'None found'>",
  "summaryOptions": [
    {
      "style": "Results-Driven",
      "summary": "<4-5 sentence summary emphasizing achievements and metrics>",
      "bestFor": "<when to use this style>"
    },
    {
      "style": "Technical Expert",
      "summary": "<4-5 sentence summary emphasizing technical depth>",
      "bestFor": "<when to use this style>"
    },
    {
      "style": "Leadership-Focused",
      "summary": "<4-5 sentence summary emphasizing leadership and impact>",
      "bestFor": "<when to use this style>"
    },
    {
      "style": "Career Transition",
      "summary": "<4-5 sentence summary for pivoting into the target role>",
      "bestFor": "<when to use this style>"
    }
  ],
  "tips": ["<3-4 tips for effective professional summaries>"]
}`,

  education_optimizer: (resumeText, jobTitle) => `You are an expert at optimizing education sections on resumes.

RESUME TEXT:
${resumeText}

TARGET JOB TITLE: ${jobTitle || "General"}

Optimize the education section. Return ONLY valid JSON:
{
  "currentEducation": ["<detected education entries>"],
  "optimizedEducation": [
    {
      "original": "<original entry>",
      "optimized": "<enhanced entry with relevant coursework, projects, GPA if helpful, honors>",
      "addedElements": ["<what was added>"]
    }
  ],
  "certificationSuggestions": [
    {
      "name": "<certification name>",
      "provider": "<e.g., Google, AWS, Coursera>",
      "relevance": "<why this helps for the target role>",
      "estimatedTime": "<hours/weeks to complete>",
      "url": "<link to certification>"
    }
  ],
  "continuingEducation": ["<suggested MOOCs, bootcamps, or courses>"],
  "tips": ["<2-3 tips for education section>"]
}`,

  tech_skills_showcase: (resumeText, jobTitle) => `You are an expert at showcasing technical skills on developer resumes.

RESUME TEXT:
${resumeText}

TARGET JOB TITLE: ${jobTitle || "Software Engineer"}

Create an optimal technical skills showcase. Return ONLY valid JSON:
{
  "detectedTechStack": {
    "languages": ["<programming languages>"],
    "frameworks": ["<frameworks detected>"],
    "databases": ["<databases>"],
    "cloud": ["<cloud services>"],
    "devops": ["<devops tools>"],
    "other": ["<other technical tools>"]
  },
  "showcaseFormat": "<recommended format: grid/categories/proficiency bars>",
  "optimizedTechSection": "<formatted technical skills section text>",
  "projectHighlights": [
    {
      "project": "<project name or type>",
      "techUsed": ["<technologies>"],
      "impact": "<quantified impact if possible>",
      "enhancedDescription": "<polished 2-3 sentence description>"
    }
  ],
  "trendingTechToAdd": ["<trending technologies in 2025 relevant to their field>"],
  "githubSuggestion": "<suggestion for GitHub profile optimization>"
}`,

  career_gap_framing: (resumeText, jobTitle) => `You are an expert career counselor specializing in career gap framing and positive positioning.

RESUME TEXT:
${resumeText}

TARGET JOB TITLE: ${jobTitle || "General"}

Analyze for potential career gaps and create positive framing. Return ONLY valid JSON:
{
  "detectedGaps": [
    {
      "period": "<approximate time period>",
      "currentFraming": "<how it currently appears>",
      "suggestedFraming": "<how to positively frame this gap>",
      "activitiesToHighlight": ["<freelancing, learning, volunteering, caregiving, personal projects>"]
    }
  ],
  "overallNarrative": "<2-3 sentence cohesive career narrative that addresses gaps>",
  "formatSuggestion": "<functional vs chronological vs hybrid recommendation>",
  "transitionStrategies": ["<3-4 strategies for smooth career transition positioning>"],
  "coverLetterSnippet": "<1-2 sentences for cover letter addressing gaps>",
  "tips": ["<3-4 general tips for handling career gaps>"]
}`,
};

// ─── Full Resume Analysis ──────────────────────────────────────────────────
router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    console.log("📄 Resume optimization analysis received");

    if (!req.file) {
      return res.status(400).json(
        new ApiResponse(false, 400, null, "No file uploaded.")
      );
    }

    const { jobTitle, jobDescription } = req.body;

    // Parse PDF
    const pdfBuffer = req.file.buffer;
    const pdfData = await pdfParse(pdfBuffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error("No text content found in PDF");
    }

    console.log("✅ PDF parsed, text length:", resumeText.length);

    // Full analysis prompt
    const prompt = `You are a world-class resume analyst and career coach. Perform a comprehensive analysis of this resume.

RESUME TEXT:
${resumeText.slice(0, 5000)}

TARGET JOB TITLE: ${jobTitle || "Not specified"}
${jobDescription ? `JOB DESCRIPTION:\n${jobDescription.slice(0, 2000)}` : ""}

Return ONLY valid JSON:
{
  "overallScore": <integer 0-100>,
  "atsCompatibility": <integer 0-100>,
  "contentQuality": <integer 0-100>,
  "formatting": <integer 0-100>,
  "impactScore": <integer 0-100>,
  "extractedInfo": {
    "name": "<candidate name>",
    "email": "<email if found>",
    "phone": "<phone if found>",
    "currentRole": "<current or most recent role>",
    "yearsExperience": <estimated integer>,
    "education": "<highest education>",
    "topSkills": ["<top 8-10 skills>"]
  },
  "sectionScores": {
    "summary": {"score": <int>, "feedback": "<brief feedback>"},
    "experience": {"score": <int>, "feedback": "<brief feedback>"},
    "education": {"score": <int>, "feedback": "<brief feedback>"},
    "skills": {"score": <int>, "feedback": "<brief feedback>"},
    "projects": {"score": <int>, "feedback": "<brief feedback>"}
  },
  "topRecommendations": [
    {"priority": "high", "category": "<category>", "suggestion": "<actionable suggestion>"},
    {"priority": "high", "category": "<category>", "suggestion": "<actionable suggestion>"},
    {"priority": "medium", "category": "<category>", "suggestion": "<actionable suggestion>"},
    {"priority": "medium", "category": "<category>", "suggestion": "<actionable suggestion>"},
    {"priority": "low", "category": "<category>", "suggestion": "<actionable suggestion>"}
  ],
  "quickWins": ["<3-4 easy improvements that take < 5 minutes>"],
  "competitiveAnalysis": "<How this resume compares to typical candidates for the role>"
}`;

    console.log("🤖 Sending to Gemini for full analysis...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    const cleanedText = cleanJsonResponse(rawText);
    const analysis = JSON.parse(cleanedText);

    console.log(`✅ Full resume analysis complete. Score: ${analysis.overallScore}`);

    return res.status(200).json(
      new ApiResponse(true, 200, {
        analysis,
        resumeTextPreview: resumeText.slice(0, 500) + "...",
        fileName: req.file.originalname,
        fileSize: req.file.size,
      }, "Resume analyzed successfully")
    );

  } catch (error) {
    console.error("❌ Resume analysis error:", error.message);
    return res.status(500).json(
      new ApiResponse(false, 500, null, error.message || "Analysis failed")
    );
  }
});

// ─── Specific Optimization Type ────────────────────────────────────────────
router.post("/optimize", upload.single("resume"), async (req, res) => {
  try {
    const { optimizationType, jobTitle, jobDescription } = req.body;

    if (!req.file) {
      return res.status(400).json(
        new ApiResponse(false, 400, null, "No file uploaded.")
      );
    }

    const validTypes = Object.keys(OPTIMIZATION_PROMPTS);
    if (!optimizationType || !validTypes.includes(optimizationType)) {
      return res.status(400).json(
        new ApiResponse(false, 400, null, `Invalid optimization type. Valid types: ${validTypes.join(", ")}`)
      );
    }

    console.log(`📄 Resume optimization: ${optimizationType} for ${jobTitle || "General"}`);

    // Parse PDF
    const pdfBuffer = req.file.buffer;
    const pdfData = await pdfParse(pdfBuffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error("No text content found in PDF");
    }

    // Get the appropriate prompt
    const promptFn = OPTIMIZATION_PROMPTS[optimizationType];
    const prompt = promptFn(resumeText.slice(0, 5000), jobTitle, jobDescription);

    console.log("🤖 Sending to Gemini for optimization...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    const cleanedText = cleanJsonResponse(rawText);
    const optimization = JSON.parse(cleanedText);

    console.log(`✅ ${optimizationType} optimization complete`);

    return res.status(200).json(
      new ApiResponse(true, 200, {
        optimizationType,
        optimization,
        jobTitle: jobTitle || "General",
      }, `${optimizationType} optimization complete`)
    );

  } catch (error) {
    console.error("❌ Resume optimization error:", error.message);
    return res.status(500).json(
      new ApiResponse(false, 500, null, error.message || "Optimization failed")
    );
  }
});

export default router;
