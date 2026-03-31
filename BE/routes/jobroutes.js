import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

// ─── Helper ────────────────────────────────────────────────────────────────

function normalizeJob(job) {
  return {
    job_id: job.job_id || Math.random().toString(36).slice(2),
    title: job.title || job.job_title || "Unknown Title",
    company_name: job.company_name || job.employer_name || job.company || "Unknown Company",
    location: job.location || job.job_city || job.job_state || "Unknown Location",
    description: job.description || job.job_description || "",
    extensions: job.extensions || job.job_employment_types || [],
    apply_options: job.apply_options || (job.job_apply_link ? [{ title: "Apply", link: job.job_apply_link }] : []),
    source: job.source || "Unknown",
  };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Source 1: SerpAPI Google Jobs ─────────────────────────────────────────

async function fetchFromSerpApi(jobTitle, location) {
  const SERP_API_KEY = process.env.SERP_API_KEY;
  if (!SERP_API_KEY) {
    console.warn("⚠️  SERP_API_KEY not set — skipping SerpAPI");
    return [];
  }

  try {
    const query = encodeURIComponent(`${jobTitle} jobs near ${location}`);
    const url = `https://serpapi.com/search.json?engine=google_jobs&q=${query}&hl=en&api_key=${SERP_API_KEY}`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`SerpAPI error: ${response.status}`);
    const data = await response.json();
    const jobs = (data.jobs_results || []).map((job) => normalizeJob({ ...job, source: "Google Jobs" }));
    console.log(`✅ SerpAPI: ${jobs.length} jobs`);
    return jobs;
  } catch (err) {
    console.error("❌ SerpAPI failed:", err.message);
    return [];
  }
}

// ─── Source 2: Adzuna Jobs API ──────────────────────────────────────────────

async function fetchFromAdzuna(jobTitle, location) {
  const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
  const ADZUNA_API_KEY = process.env.ADZUNA_API_KEY;
  if (!ADZUNA_APP_ID || !ADZUNA_API_KEY) {
    console.warn("⚠️  ADZUNA credentials not set — skipping Adzuna");
    return [];
  }

  try {
    // Detect country for Adzuna — default to 'in' (India) or 'us'
    const countryMap = { india: "in", usa: "us", uk: "gb", canada: "ca", australia: "au" };
    const locationLower = location.toLowerCase();
    let countryCode = "in";
    for (const [key, code] of Object.entries(countryMap)) {
      if (locationLower.includes(key)) { countryCode = code; break; }
    }

    const query = encodeURIComponent(jobTitle);
    const loc = encodeURIComponent(location);
    const url = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_API_KEY}&results_per_page=10&what=${query}&where=${loc}&content-type=application/json`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Adzuna error: ${response.status}`);
    const data = await response.json();
    const jobs = (data.results || []).map((job) =>
      normalizeJob({
        job_id: job.id,
        title: job.title,
        company_name: job.company?.display_name || "Unknown",
        location: job.location?.display_name || location,
        description: job.description,
        apply_options: [{ title: "Apply on Adzuna", link: job.redirect_url }],
        source: "Adzuna",
      })
    );
    console.log(`✅ Adzuna: ${jobs.length} jobs`);
    return jobs;
  } catch (err) {
    console.error("❌ Adzuna failed:", err.message);
    return [];
  }
}

// ─── Source 3: LinkedIn via JSearch RapidAPI ────────────────────────────────

async function fetchFromLinkedIn(jobTitle, location) {
  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  if (!RAPIDAPI_KEY) {
    console.warn("⚠️  RAPIDAPI_KEY not set — skipping LinkedIn/JSearch");
    return [];
  }

  try {
    const query = encodeURIComponent(`${jobTitle} ${location}`);
    const url = `https://jsearch.p.rapidapi.com/search?query=${query}&num_pages=1&page=1`;
    const response = await fetchWithTimeout(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    }, 12000);
    if (!response.ok) throw new Error(`JSearch error: ${response.status}`);
    const data = await response.json();
    const jobs = (data.data || []).map((job) =>
      normalizeJob({
        job_id: job.job_id,
        title: job.job_title,
        company_name: job.employer_name,
        location: [job.job_city, job.job_state, job.job_country].filter(Boolean).join(", "),
        description: job.job_description,
        apply_options: [
          { title: "Apply on LinkedIn", link: job.job_apply_link },
          ...(job.job_publisher === "LinkedIn" ? [] : []),
        ].filter((o) => o.link),
        source: "LinkedIn / JSearch",
      })
    );
    console.log(`✅ JSearch/LinkedIn: ${jobs.length} jobs`);
    return jobs;
  } catch (err) {
    console.error("❌ JSearch/LinkedIn failed:", err.message);
    return [];
  }
}

// ─── Source 4: Remotive.io (free, no key needed) ───────────────────────────

async function fetchFromRemotive(jobTitle) {
  try {
    const search = encodeURIComponent(jobTitle);
    const url = `https://remotive.com/api/remote-jobs?search=${search}&limit=6`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Remotive error: ${response.status}`);
    const data = await response.json();
    const jobs = (data.jobs || []).map((job) =>
      normalizeJob({
        job_id: String(job.id),
        title: job.title,
        company_name: job.company_name,
        location: job.candidate_required_location || "Remote",
        description: job.description?.replace(/<[^>]+>/g, "").slice(0, 300) + "...",
        apply_options: [{ title: "Apply on Remotive", link: job.url }],
        source: "Remotive (Remote)",
      })
    );
    console.log(`✅ Remotive: ${jobs.length} jobs`);
    return jobs;
  } catch (err) {
    console.error("❌ Remotive failed:", err.message);
    return [];
  }
}

// ─── Source 5: Original skillassessmentapi (fallback) ──────────────────────

async function fetchFromSkillApi(jobTitle, location) {
  try {
    const url = `https://skillassessmentapi.onrender.com/jobs?job_title=${encodeURIComponent(jobTitle)}&location=${encodeURIComponent(location)}`;
    const response = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_title: jobTitle, location }),
    }, 35000); // Give Render API up to 35s to wake up
    if (!response.ok) throw new Error(`SkillAPI error: ${response.status}`);
    const data = await response.json();
    const jobs = (data.jobs || []).map((job) => normalizeJob({ ...job, source: "Google Jobs" }));
    console.log(`✅ SkillAPI: ${jobs.length} jobs`);
    return jobs;
  } catch (err) {
    console.error("❌ SkillAPI failed:", err.message);
    return [];
  }
}

// ─── Main Route ─────────────────────────────────────────────────────────────

router.post("/job", async (req, res) => {
  const { job_title, location, sources } = req.body;

  if (!job_title) {
    return res.status(400).json({ error: "job_title is required" });
  }

  const loc = location || "Remote";
  console.log(`\n🔍 Multi-source job search: "${job_title}" in "${loc}"`);

  // Run all sources in parallel
  const [serpJobs, adzunaJobs, linkedInJobs, remotiveJobs, skillApiJobs] = await Promise.allSettled([
    fetchFromSerpApi(job_title, loc),
    fetchFromAdzuna(job_title, loc),
    fetchFromLinkedIn(job_title, loc),
    fetchFromRemotive(job_title),
    fetchFromSkillApi(job_title, loc),
  ]).then((results) => results.map((r) => (r.status === "fulfilled" ? r.value : [])));

  // Merge & deduplicate by job title + company
  const allJobs = [...serpJobs, ...linkedInJobs, ...adzunaJobs, ...remotiveJobs, ...skillApiJobs];
  const seen = new Set();
  const uniqueJobs = allJobs.filter((job) => {
    const key = `${job.title.toLowerCase()}__${job.company_name.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Source breakdown for transparency
  const sourceSummary = {
    "Google Jobs (SerpAPI)": serpJobs.length,
    "LinkedIn (JSearch)": linkedInJobs.length,
    Adzuna: adzunaJobs.length,
    "Remotive (Remote)": remotiveJobs.length,
    "SkillAssessmentAPI": skillApiJobs.length,
    total: uniqueJobs.length,
  };

  console.log(`📊 Source summary:`, sourceSummary);

  res.json({
    jobs: uniqueJobs,
    meta: {
      query: { job_title, location: loc },
      sources: sourceSummary,
      total: uniqueJobs.length,
    },
  });
});

export default router;
