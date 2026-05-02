import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from "node-fetch";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Helper: clean markdown/code fences from Gemini response ──────────────
function cleanJsonResponse(text) {
  let cleaned = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "");
  cleaned = cleaned.replace(/^\s*json\s*/i, "").replace(/`/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  const lastBrace = cleaned.lastIndexOf("}");
  const lastBracket = cleaned.lastIndexOf("]");

  // Determine if top-level is array or object
  if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
    if (lastBracket !== -1 && lastBracket > firstBracket) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    }
  } else if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

// ─── Fetch GitHub profile data ────────────────────────────────────────────
async function fetchGitHubProfile(username) {
  try {
    const headers = { "Accept": "application/vnd.github.v3+json" };
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch user profile
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (!userRes.ok) throw new Error(`GitHub user not found: ${username}`);
    const user = await userRes.json();

    // Fetch repos (top 30 by stars)
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?sort=stars&per_page=30&type=owner`,
      { headers }
    );
    const repos = reposRes.ok ? await reposRes.json() : [];

    // Fetch recent events (contributions)
    const eventsRes = await fetch(
      `https://api.github.com/users/${username}/events/public?per_page=30`,
      { headers }
    );
    const events = eventsRes.ok ? await eventsRes.json() : [];

    // Compute language stats
    const languageStats = {};
    for (const repo of repos) {
      if (repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
      }
    }

    // Compute contribution patterns
    const pushEvents = events.filter(e => e.type === "PushEvent").length;
    const prEvents = events.filter(e => e.type === "PullRequestEvent").length;
    const issueEvents = events.filter(e => e.type === "IssuesEvent").length;

    return {
      username: user.login,
      name: user.name || user.login,
      avatar: user.avatar_url,
      bio: user.bio || "",
      company: user.company || "",
      location: user.location || "",
      blog: user.blog || "",
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
      createdAt: user.created_at,
      topRepos: repos.slice(0, 10).map(r => ({
        name: r.name,
        description: r.description || "",
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        url: r.html_url,
        topics: r.topics || [],
      })),
      languages: Object.entries(languageStats)
        .sort((a, b) => b[1] - a[1])
        .map(([lang, count]) => ({ language: lang, repoCount: count })),
      recentActivity: {
        pushEvents,
        pullRequests: prEvents,
        issues: issueEvents,
        totalEvents: events.length,
      },
      totalStars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
      totalForks: repos.reduce((sum, r) => sum + r.forks_count, 0),
    };
  } catch (err) {
    console.error(`❌ GitHub fetch failed for ${username}:`, err.message);
    return null;
  }
}

// ─── Single Candidate Analysis ────────────────────────────────────────────
router.post("/analyze-single", async (req, res) => {
  try {
    const { githubUsername, linkedinUrl, jobRole } = req.body;

    if (!githubUsername) {
      return res.status(400).json(
        new ApiResponse(false, 400, null, "GitHub username is required")
      );
    }

    console.log(`\n🔍 Analyzing candidate: ${githubUsername} for role: ${jobRole || "General"}`);

    // Fetch GitHub data
    const githubData = await fetchGitHubProfile(githubUsername);
    if (!githubData) {
      return res.status(404).json(
        new ApiResponse(false, 404, null, `GitHub user "${githubUsername}" not found`)
      );
    }

    // Build comprehensive analysis prompt
    const prompt = `You are an expert technical recruiter and talent analyst. Analyze this GitHub developer profile and provide a comprehensive assessment.

CANDIDATE GITHUB PROFILE:
- Name: ${githubData.name}
- Username: ${githubData.username}
- Bio: ${githubData.bio}
- Company: ${githubData.company}
- Location: ${githubData.location}
- Public Repos: ${githubData.publicRepos}
- Followers: ${githubData.followers}
- Total Stars: ${githubData.totalStars}
- Total Forks: ${githubData.totalForks}
- Account Created: ${githubData.createdAt}

TOP REPOSITORIES:
${githubData.topRepos.map(r => `  - ${r.name}: ${r.description} (⭐${r.stars}, Language: ${r.language}, Topics: ${r.topics.join(", ")})`).join("\n")}

LANGUAGE DISTRIBUTION:
${githubData.languages.map(l => `  - ${l.language}: ${l.repoCount} repos`).join("\n")}

RECENT ACTIVITY:
  - Push Events: ${githubData.recentActivity.pushEvents}
  - Pull Requests: ${githubData.recentActivity.pullRequests}
  - Issues: ${githubData.recentActivity.issues}

${jobRole ? `TARGET JOB ROLE: ${jobRole}` : ""}
${linkedinUrl ? `LINKEDIN PROFILE URL: ${linkedinUrl}` : ""}

IMPORTANT: Return ONLY valid JSON with this exact structure:
{
  "overallScore": <integer 0-100>,
  "profileSummary": "<2-3 sentence professional summary>",
  "technicalSkills": {
    "primary": ["<top 5 skills based on repos/languages>"],
    "secondary": ["<3-4 additional inferred skills>"],
    "score": <integer 0-100>
  },
  "experienceLevel": "<Junior/Mid-Level/Senior/Staff/Principal>",
  "strengths": ["<top 3-4 strengths>"],
  "weaknesses": ["<2-3 areas for improvement>"],
  "projectQuality": {
    "score": <integer 0-100>,
    "highlights": ["<top 3 notable projects or achievements>"]
  },
  "communityEngagement": {
    "score": <integer 0-100>,
    "summary": "<1 sentence about open source involvement>"
  },
  "domainClassification": "<e.g., Full Stack, Backend, Frontend, ML/AI, DevOps, Mobile>",
  "jobFitAnalysis": {
    "fitScore": <integer 0-100>,
    "matchingSkills": ["<skills that match the target role>"],
    "missingSkills": ["<skills needed for the role they lack>"],
    "recommendation": "<1-2 sentence hiring recommendation>"
  },
  "careerTrajectory": "<1 sentence about growth direction>",
  "linkedinInsights": ${linkedinUrl ? '"<any inferences from having a LinkedIn presence>"' : '"LinkedIn not provided"'},
  "suggestedRoles": [
    {"title": "<role 1>", "fitPercentage": <int>},
    {"title": "<role 2>", "fitPercentage": <int>},
    {"title": "<role 3>", "fitPercentage": <int>}
  ]
}`;

    console.log("🤖 Sending to Gemini for analysis...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    const cleanedText = cleanJsonResponse(rawText);
    const analysis = JSON.parse(cleanedText);

    console.log(`✅ Analysis complete for ${githubUsername}. Score: ${analysis.overallScore}`);

    return res.status(200).json(
      new ApiResponse(true, 200, {
        githubProfile: githubData,
        analysis,
      }, "Candidate analyzed successfully")
    );

  } catch (error) {
    console.error("❌ Single candidate analysis error:", error.message);
    return res.status(500).json(
      new ApiResponse(false, 500, null, error.message || "Analysis failed")
    );
  }
});

// ─── Multi-Candidate Analysis ─────────────────────────────────────────────
router.post("/analyze-multi", async (req, res) => {
  try {
    const { usernames, jobRole } = req.body;

    if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
      return res.status(400).json(
        new ApiResponse(false, 400, null, "Provide an array of GitHub usernames")
      );
    }

    if (usernames.length > 10) {
      return res.status(400).json(
        new ApiResponse(false, 400, null, "Maximum 10 candidates at a time")
      );
    }

    console.log(`\n🔁 Multi-candidate analysis: ${usernames.length} candidates for "${jobRole || "General"}"`);

    // Fetch all GitHub profiles in parallel
    const profilePromises = usernames.map(u => fetchGitHubProfile(u.trim()));
    const profiles = await Promise.all(profilePromises);

    const validProfiles = profiles.filter(p => p !== null);
    const failedUsernames = usernames.filter((u, i) => profiles[i] === null);

    if (validProfiles.length === 0) {
      return res.status(404).json(
        new ApiResponse(false, 404, null, "No valid GitHub profiles found")
      );
    }

    // Build comparison prompt
    const candidateSummaries = validProfiles.map((p, i) => `
CANDIDATE ${i + 1}: ${p.username}
- Name: ${p.name}
- Public Repos: ${p.publicRepos}, Stars: ${p.totalStars}, Forks: ${p.totalForks}
- Top Languages: ${p.languages.slice(0, 5).map(l => l.language).join(", ")}
- Top Repos: ${p.topRepos.slice(0, 3).map(r => `${r.name}(⭐${r.stars})`).join(", ")}
- Recent Activity: ${p.recentActivity.pushEvents} pushes, ${p.recentActivity.pullRequests} PRs
- Followers: ${p.followers}
- Bio: ${p.bio}
`).join("\n");

    const prompt = `You are an expert technical recruiter. Compare and rank these ${validProfiles.length} GitHub developer candidates${jobRole ? ` for the role of "${jobRole}"` : ""}.

${candidateSummaries}

IMPORTANT: Return ONLY valid JSON with this exact structure:
{
  "rankings": [
    {
      "rank": 1,
      "username": "<github username>",
      "overallScore": <integer 0-100>,
      "summary": "<1 sentence assessment>",
      "topSkills": ["<top 3 skills>"],
      "experienceLevel": "<Junior/Mid/Senior/Staff>",
      "fitScore": <integer 0-100 for the target role>,
      "strengths": ["<top 2 strengths>"],
      "concerns": ["<top 1-2 concerns>"]
    }
  ],
  "comparisonInsights": "<2-3 sentences comparing top candidates>",
  "recommendedHire": "<username of best candidate>",
  "teamComplementarity": "<1 sentence about how these candidates could complement each other>"
}

Rank from best to worst. Be objective and data-driven.`;

    console.log("🤖 Sending multi-candidate comparison to Gemini...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    const cleanedText = cleanJsonResponse(rawText);
    const comparison = JSON.parse(cleanedText);

    console.log(`✅ Multi-candidate analysis complete. Winner: ${comparison.recommendedHire}`);

    return res.status(200).json(
      new ApiResponse(true, 200, {
        profiles: validProfiles.map(p => ({
          username: p.username,
          name: p.name,
          avatar: p.avatar,
          publicRepos: p.publicRepos,
          totalStars: p.totalStars,
          followers: p.followers,
          languages: p.languages.slice(0, 5),
        })),
        comparison,
        failedUsernames,
      }, "Multi-candidate analysis complete")
    );

  } catch (error) {
    console.error("❌ Multi-candidate analysis error:", error.message);
    return res.status(500).json(
      new ApiResponse(false, 500, null, error.message || "Multi-analysis failed")
    );
  }
});

// ─── Job Matching for Candidate ───────────────────────────────────────────
router.post("/job-match", async (req, res) => {
  try {
    const { githubUsername } = req.body;

    if (!githubUsername) {
      return res.status(400).json(
        new ApiResponse(false, 400, null, "GitHub username is required")
      );
    }

    console.log(`\n🎯 Finding job matches for: ${githubUsername}`);

    const githubData = await fetchGitHubProfile(githubUsername);
    if (!githubData) {
      return res.status(404).json(
        new ApiResponse(false, 404, null, `GitHub user "${githubUsername}" not found`)
      );
    }

    const prompt = `You are a career matching expert. Based on this GitHub developer's profile, suggest the best job matches.

DEVELOPER PROFILE:
- Name: ${githubData.name}
- Top Languages: ${githubData.languages.slice(0, 6).map(l => l.language).join(", ")}
- Public Repos: ${githubData.publicRepos}, Stars: ${githubData.totalStars}
- Top Repos: ${githubData.topRepos.slice(0, 5).map(r => `${r.name} (${r.language}, ⭐${r.stars})`).join(", ")}
- Bio: ${githubData.bio}

Return ONLY valid JSON:
{
  "domainClassification": "<primary domain e.g. Full Stack, Backend, ML/AI, Mobile>",
  "subDomains": ["<2-3 specific sub-areas>"],
  "jobMatches": [
    {
      "title": "<specific job title>",
      "company_type": "<startup/mid-size/enterprise>",
      "matchScore": <integer 0-100>,
      "reason": "<why this matches>",
      "salary_range": "<estimated USD range>",
      "skills_matched": ["<matching skills>"],
      "search_url": "<a working job search URL on LinkedIn or Indeed>"
    }
  ],
  "ycJobBoardMatches": [
    {
      "title": "<YC-style job title>",
      "companyStage": "<Seed/Series A/Series B/Growth>",
      "matchScore": <integer 0-100>,
      "searchUrl": "https://www.workatastartup.com/jobs?query=<relevant_search>"
    }
  ],
  "careerAdvice": "<2 sentences of personalized career advice>"
}

Provide 5 job matches and 3 YC board matches. Use REAL, working search URLs.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    const cleanedText = cleanJsonResponse(rawText);
    const jobMatching = JSON.parse(cleanedText);

    console.log(`✅ Found ${jobMatching.jobMatches?.length || 0} job matches`);

    return res.status(200).json(
      new ApiResponse(true, 200, {
        profile: {
          username: githubData.username,
          name: githubData.name,
          avatar: githubData.avatar,
          languages: githubData.languages.slice(0, 6),
        },
        jobMatching,
      }, "Job matches found successfully")
    );

  } catch (error) {
    console.error("❌ Job matching error:", error.message);
    return res.status(500).json(
      new ApiResponse(false, 500, null, error.message || "Job matching failed")
    );
  }
});

export default router;
