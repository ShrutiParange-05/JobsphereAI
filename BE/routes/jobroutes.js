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

// ─── Source 5: Arbeitnow (free, no key needed) ─────────────────────────────

async function fetchFromArbeitnow(jobTitle) {
  try {
    const search = encodeURIComponent(jobTitle);
    const url = `https://www.arbeitnow.com/api/job-board-api?search=${search}&per_page=10`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`Arbeitnow error: ${response.status}`);
    const data = await response.json();
    const jobs = (data.data || []).map((job) =>
      normalizeJob({
        job_id: String(job.slug || job.id || Math.random().toString(36).slice(2)),
        title: job.title,
        company_name: job.company_name || "Unknown",
        location: job.location || "Remote",
        description: (job.description || "").replace(/<[^>]+>/g, "").slice(0, 300) + "...",
        extensions: job.tags || [],
        apply_options: [{ title: "Apply on Arbeitnow", link: job.url }],
        source: "Arbeitnow",
      })
    );
    console.log(`✅ Arbeitnow: ${jobs.length} jobs`);
    return jobs;
  } catch (err) {
    console.error("❌ Arbeitnow failed:", err.message);
    return [];
  }
}

// ─── Source 6: The Muse (free, no key needed) ──────────────────────────────

async function fetchFromTheMuse(jobTitle) {
  try {
    const search = encodeURIComponent(jobTitle);
    const url = `https://www.themuse.com/api/public/jobs?page=0&descending=true&category=${search}`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) throw new Error(`TheMuse error: ${response.status}`);
    const data = await response.json();
    const jobs = (data.results || []).slice(0, 10).map((job) =>
      normalizeJob({
        job_id: String(job.id),
        title: job.name,
        company_name: job.company?.name || "Unknown",
        location: (job.locations || []).map((l) => l.name).join(", ") || "Remote",
        description: (job.contents || "").replace(/<[^>]+>/g, "").slice(0, 300) + "...",
        extensions: job.categories?.map((c) => c.name) || [],
        apply_options: [{ title: "Apply on The Muse", link: job.refs?.landing_page }],
        source: "The Muse",
      })
    );
    console.log(`✅ The Muse: ${jobs.length} jobs`);
    return jobs;
  } catch (err) {
    console.error("❌ The Muse failed:", err.message);
    return [];
  }
}

// ─── Source 7: Greenhouse public boards (free, no key) ─────────────────────

async function fetchFromGreenhouse(jobTitle) {
  // Top tech companies with public Greenhouse boards
  const boards = ["airbnb", "figma", "stripe", "notion", "datadog", "cloudflare", "vercel", "hashicorp"];

  try {
    const searchLower = jobTitle.toLowerCase();
    const boardFetches = boards.map(async (board) => {
      try {
        const url = `https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`;
        const response = await fetchWithTimeout(url, {}, 5000);
        if (!response.ok) return [];
        const data = await response.json();
        return (data.jobs || [])
          .filter((job) => job.title.toLowerCase().includes(searchLower))
          .slice(0, 3)
          .map((job) =>
            normalizeJob({
              job_id: String(job.id),
              title: job.title,
              company_name: board.charAt(0).toUpperCase() + board.slice(1),
              location: job.location?.name || "Remote",
              description: (job.content || "").replace(/<[^>]+>/g, "").slice(0, 300) + "...",
              extensions: job.departments?.map((d) => d.name) || [],
              apply_options: [{ title: `Apply at ${board.charAt(0).toUpperCase() + board.slice(1)}`, link: job.absolute_url }],
              source: "Greenhouse",
            })
          );
      } catch {
        return [];
      }
    });
    const results = await Promise.allSettled(boardFetches);
    const jobs = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    console.log(`✅ Greenhouse: ${jobs.length} jobs (from ${boards.length} boards)`);
    return jobs;
  } catch (err) {
    console.error("❌ Greenhouse failed:", err.message);
    return [];
  }
}

// ─── Source 8: Original skillassessmentapi (fallback) ──────────────────────

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
  const [serpJobs, adzunaJobs, linkedInJobs, remotiveJobs, arbeitnowJobs, museJobs, greenhouseJobs, skillApiJobs] = await Promise.allSettled([
    fetchFromSerpApi(job_title, loc),
    fetchFromAdzuna(job_title, loc),
    fetchFromLinkedIn(job_title, loc),
    fetchFromRemotive(job_title),
    fetchFromArbeitnow(job_title),
    fetchFromTheMuse(job_title),
    fetchFromGreenhouse(job_title),
    fetchFromSkillApi(job_title, loc),
  ]).then((results) => results.map((r) => (r.status === "fulfilled" ? r.value : [])));

  // Merge & deduplicate by job title + company
  const allJobs = [...serpJobs, ...linkedInJobs, ...adzunaJobs, ...remotiveJobs, ...arbeitnowJobs, ...museJobs, ...greenhouseJobs, ...skillApiJobs];
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
    Arbeitnow: arbeitnowJobs.length,
    "The Muse": museJobs.length,
    Greenhouse: greenhouseJobs.length,
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
