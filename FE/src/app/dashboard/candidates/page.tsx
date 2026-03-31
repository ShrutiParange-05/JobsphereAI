"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  User,
  Search,
  Github,
  Linkedin,
  Trophy,
  Star,
  GitFork,
  Code2,
  TrendingUp,
  Target,
  Briefcase,
  ArrowRight,
  Loader2,
  AlertCircle,
  ExternalLink,
  Crown,
  Sparkles,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Zap,
  Globe,
  BookOpen,
} from "lucide-react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001/api";

// Types
interface GitHubProfile {
  username: string;
  name: string;
  avatar: string;
  publicRepos: number;
  totalStars: number;
  followers: number;
  languages: { language: string; repoCount: number }[];
}

interface SingleAnalysis {
  githubProfile: {
    username: string;
    name: string;
    avatar: string;
    bio: string;
    company: string;
    location: string;
    blog: string;
    publicRepos: number;
    followers: number;
    following: number;
    totalStars: number;
    totalForks: number;
    topRepos: {
      name: string;
      description: string;
      stars: number;
      forks: number;
      language: string;
      url: string;
      topics: string[];
    }[];
    languages: { language: string; repoCount: number }[];
    recentActivity: {
      pushEvents: number;
      pullRequests: number;
      issues: number;
    };
  };
  analysis: {
    overallScore: number;
    profileSummary: string;
    technicalSkills: {
      primary: string[];
      secondary: string[];
      score: number;
    };
    experienceLevel: string;
    strengths: string[];
    weaknesses: string[];
    projectQuality: { score: number; highlights: string[] };
    communityEngagement: { score: number; summary: string };
    domainClassification: string;
    jobFitAnalysis: {
      fitScore: number;
      matchingSkills: string[];
      missingSkills: string[];
      recommendation: string;
    };
    careerTrajectory: string;
    linkedinInsights: string;
    suggestedRoles: { title: string; fitPercentage: number }[];
  };
}

interface MultiAnalysis {
  profiles: GitHubProfile[];
  comparison: {
    rankings: {
      rank: number;
      username: string;
      overallScore: number;
      summary: string;
      topSkills: string[];
      experienceLevel: string;
      fitScore: number;
      strengths: string[];
      concerns: string[];
    }[];
    comparisonInsights: string;
    recommendedHire: string;
    teamComplementarity: string;
  };
  failedUsernames: string[];
}

interface JobMatch {
  profile: {
    username: string;
    name: string;
    avatar: string;
    languages: { language: string; repoCount: number }[];
  };
  jobMatching: {
    domainClassification: string;
    subDomains: string[];
    jobMatches: {
      title: string;
      company_type: string;
      matchScore: number;
      reason: string;
      salary_range: string;
      skills_matched: string[];
      search_url: string;
    }[];
    ycJobBoardMatches: {
      title: string;
      companyStage: string;
      matchScore: number;
      searchUrl: string;
    }[];
    careerAdvice: string;
  };
}

// Score ring component
function ScoreRing({ score, size = 80, label }: { score: number; size?: number; label?: string }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? "#22c55e" : score >= 60 ? "#3b82f6" : score >= 40 ? "#eab308" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={size / 3.5}
          fontWeight="bold"
          className="rotate-90"
          style={{ transformOrigin: "center" }}
        >
          {score}
        </text>
      </svg>
      {label && <span className="text-xs text-gray-400 font-medium">{label}</span>}
    </div>
  );
}

export default function CandidatesPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<"single" | "multi" | "jobmatch">("single");

  // Single analysis state
  const [singleUsername, setSingleUsername] = useState("");
  const [singleLinkedin, setSingleLinkedin] = useState("");
  const [singleJobRole, setSingleJobRole] = useState("");
  const [singleResult, setSingleResult] = useState<SingleAnalysis | null>(null);
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState("");

  // Multi analysis state
  const [multiUsernames, setMultiUsernames] = useState("");
  const [multiJobRole, setMultiJobRole] = useState("");
  const [multiResult, setMultiResult] = useState<MultiAnalysis | null>(null);
  const [multiLoading, setMultiLoading] = useState(false);
  const [multiError, setMultiError] = useState("");

  // Job match state
  const [jobMatchUsername, setJobMatchUsername] = useState("");
  const [jobMatchResult, setJobMatchResult] = useState<JobMatch | null>(null);
  const [jobMatchLoading, setJobMatchLoading] = useState(false);
  const [jobMatchError, setJobMatchError] = useState("");

  // Expanded cards
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // ─── API Calls ──────────────────────────────────────────────────────────

  const analyzeSingle = async () => {
    if (!singleUsername.trim()) return;
    setSingleLoading(true);
    setSingleError("");
    setSingleResult(null);
    try {
      const res = await fetch(`${backendUrl}/candidates/analyze-single`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubUsername: singleUsername.trim(),
          linkedinUrl: singleLinkedin.trim() || undefined,
          jobRole: singleJobRole.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSingleResult(data.data);
    } catch (err: unknown) {
      setSingleError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setSingleLoading(false);
    }
  };

  const analyzeMulti = async () => {
    const usernames = multiUsernames
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    if (usernames.length === 0) return;
    setMultiLoading(true);
    setMultiError("");
    setMultiResult(null);
    try {
      const res = await fetch(`${backendUrl}/candidates/analyze-multi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernames,
          jobRole: multiJobRole.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setMultiResult(data.data);
    } catch (err: unknown) {
      setMultiError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setMultiLoading(false);
    }
  };

  const findJobMatches = async () => {
    if (!jobMatchUsername.trim()) return;
    setJobMatchLoading(true);
    setJobMatchError("");
    setJobMatchResult(null);
    try {
      const res = await fetch(`${backendUrl}/candidates/job-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUsername: jobMatchUsername.trim() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setJobMatchResult(data.data);
    } catch (err: unknown) {
      setJobMatchError(err instanceof Error ? err.message : "Job matching failed");
    } finally {
      setJobMatchLoading(false);
    }
  };

  // ─── Tab Config ─────────────────────────────────────────────────────────
  const tabs = [
    { id: "single" as const, label: "Single Candidate", icon: User, color: "from-violet-500 to-purple-600" },
    { id: "multi" as const, label: "Multi Candidate", icon: Users, color: "from-cyan-500 to-blue-600" },
    { id: "jobmatch" as const, label: "Job Matching", icon: Briefcase, color: "from-emerald-500 to-teal-600" },
  ];

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8 p-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30">
              <Sparkles className="w-7 h-7 text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400">
                Candidate Analyzer
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                AI-powered GitHub & LinkedIn profile analysis with intelligent job matching
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="flex gap-2 p-1.5 bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-purple-500/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg shadow-${tab.color.split("-")[1]}/20`
                  : "text-gray-400 hover:text-white hover:bg-purple-900/25"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* ═══════════════════════ SINGLE CANDIDATE TAB ═══════════════════════ */}
        <AnimatePresence mode="wait">
          {activeTab === "single" && (
            <motion.div
              key="single"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Input Card */}
              <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-violet-400" />
                    Single Candidate Analysis
                  </h2>
                  <p className="text-gray-400 text-sm">Deep-dive analysis of a single developer profile</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                        <Github className="w-4 h-4" /> GitHub Username *
                      </label>
                      <input
                        type="text"
                        value={singleUsername}
                        onChange={(e) => setSingleUsername(e.target.value)}
                        placeholder="e.g. torvalds"
                        className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                        <Linkedin className="w-4 h-4" /> LinkedIn URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={singleLinkedin}
                        onChange={(e) => setSingleLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                        <Target className="w-4 h-4" /> Job Role
                      </label>
                      <input
                        type="text"
                        value={singleJobRole}
                        onChange={(e) => setSingleJobRole(e.target.value)}
                        placeholder="e.g. ML Engineer"
                        className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    onClick={analyzeSingle}
                    disabled={singleLoading || !singleUsername.trim()}
                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    {singleLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" /> Analyze Candidate
                      </>
                    )}
                  </button>

                  {singleError && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{singleError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Loading animation */}
              {singleLoading && (
                <div className="flex flex-col items-center py-16">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-xl bg-violet-500/30 animate-pulse" />
                    <div className="relative w-16 h-16 border-4 border-purple-900 border-t-violet-500 rounded-full animate-spin" />
                  </div>
                  <p className="mt-6 text-violet-400 animate-pulse font-medium">Analyzing GitHub profile & generating insights...</p>
                  <p className="mt-1 text-gray-500 text-sm">This may take 10-15 seconds</p>
                </div>
              )}

              {/* Results */}
              {singleResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Profile Header */}
                  <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-blue-500/10 pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
                      <img
                        src={singleResult.githubProfile.avatar}
                        alt={singleResult.githubProfile.name}
                        className="w-24 h-24 rounded-2xl border-2 border-violet-500/30 shadow-lg shadow-violet-500/20"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="text-2xl font-bold text-white">{singleResult.githubProfile.name}</h2>
                            <p className="text-gray-400 flex items-center gap-1">
                              <Github className="w-4 h-4" /> @{singleResult.githubProfile.username}
                            </p>
                            {singleResult.githubProfile.bio && (
                              <p className="text-gray-300 mt-2 max-w-xl">{singleResult.githubProfile.bio}</p>
                            )}
                            <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-400">
                              {singleResult.githubProfile.company && (
                                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{singleResult.githubProfile.company}</span>
                              )}
                              {singleResult.githubProfile.location && (
                                <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{singleResult.githubProfile.location}</span>
                              )}
                            </div>
                          </div>
                          <ScoreRing score={singleResult.analysis.overallScore} size={90} label="Overall" />
                        </div>

                        {/* Stats row */}
                        <div className="flex flex-wrap gap-4 mt-4">
                          {[
                            { icon: BookOpen, label: "Repos", value: singleResult.githubProfile.publicRepos },
                            { icon: Star, label: "Stars", value: singleResult.githubProfile.totalStars },
                            { icon: GitFork, label: "Forks", value: singleResult.githubProfile.totalForks },
                            { icon: Users, label: "Followers", value: singleResult.githubProfile.followers },
                          ].map((stat) => (
                            <div key={stat.label} className="flex items-center gap-2 bg-purple-900/25 px-3 py-2 rounded-lg border border-purple-500/20">
                              <stat.icon className="w-4 h-4 text-violet-400" />
                              <span className="text-white font-semibold">{stat.value}</span>
                              <span className="text-gray-400 text-sm">{stat.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analysis cards row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 text-center">
                      <ScoreRing score={singleResult.analysis.technicalSkills.score} size={70} />
                      <p className="text-sm text-gray-400 mt-2 font-medium">Technical Skills</p>
                    </div>
                    <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 text-center">
                      <ScoreRing score={singleResult.analysis.projectQuality.score} size={70} />
                      <p className="text-sm text-gray-400 mt-2 font-medium">Project Quality</p>
                    </div>
                    <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 text-center">
                      <ScoreRing score={singleResult.analysis.communityEngagement.score} size={70} />
                      <p className="text-sm text-gray-400 mt-2 font-medium">Community</p>
                    </div>
                    <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 text-center">
                      <ScoreRing score={singleResult.analysis.jobFitAnalysis.fitScore} size={70} />
                      <p className="text-sm text-gray-400 mt-2 font-medium">Job Fit</p>
                    </div>
                  </div>

                  {/* Summary & Domain */}
                  <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-violet-500/20 text-violet-300 text-sm font-semibold rounded-full border border-violet-500/30">
                        {singleResult.analysis.domainClassification}
                      </span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm font-semibold rounded-full border border-blue-500/30">
                        {singleResult.analysis.experienceLevel}
                      </span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{singleResult.analysis.profileSummary}</p>
                    <p className="text-gray-400 text-sm mt-3 italic">{singleResult.analysis.careerTrajectory}</p>
                  </div>

                  {/* Skills */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-violet-400" /> Technical Skills
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Primary</p>
                          <div className="flex flex-wrap gap-2">
                            {singleResult.analysis.technicalSkills.primary.map((s) => (
                              <span key={s} className="px-3 py-1.5 bg-violet-500/15 text-violet-300 text-sm rounded-lg border border-violet-500/20">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Secondary</p>
                          <div className="flex flex-wrap gap-2">
                            {singleResult.analysis.technicalSkills.secondary.map((s) => (
                              <span key={s} className="px-3 py-1.5 bg-purple-800/30 text-gray-300 text-sm rounded-lg border border-gray-600/30">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-emerald-400" /> Strengths & Areas to Improve
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2">Strengths</p>
                          {singleResult.analysis.strengths.map((s) => (
                            <div key={s} className="flex items-start gap-2 mb-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                              <span className="text-gray-300 text-sm">{s}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs text-[#E1C4FF] uppercase tracking-wider mb-2">Areas to Improve</p>
                          {singleResult.analysis.weaknesses.map((w) => (
                            <div key={w} className="flex items-start gap-2 mb-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                              <span className="text-gray-300 text-sm">{w}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Job Fit & Suggested Roles */}
                  <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-cyan-400" /> Job Fit Analysis
                    </h3>
                    <p className="text-gray-300 mb-4">{singleResult.analysis.jobFitAnalysis.recommendation}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2">Matching Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {singleResult.analysis.jobFitAnalysis.matchingSkills.map((s) => (
                            <span key={s} className="px-2 py-1 bg-emerald-500/15 text-emerald-300 text-xs rounded-md">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-red-400 uppercase tracking-wider mb-2">Missing Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {singleResult.analysis.jobFitAnalysis.missingSkills.map((s) => (
                            <span key={s} className="px-2 py-1 bg-red-500/15 text-red-300 text-xs rounded-md">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <h4 className="text-white font-semibold mb-3">Suggested Roles</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {singleResult.analysis.suggestedRoles.map((role) => (
                        <div key={role.title} className="bg-purple-900/25 rounded-xl p-4 border border-purple-500/20 flex items-center justify-between">
                          <span className="text-gray-200 font-medium text-sm">{role.title}</span>
                          <span className={`text-sm font-bold ${role.fitPercentage >= 80 ? "text-emerald-400" : role.fitPercentage >= 60 ? "text-blue-400" : "text-[#E1C4FF]"}`}>
                            {role.fitPercentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Repos */}
                  <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-400" /> Top Repositories
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {singleResult.githubProfile.topRepos.slice(0, 6).map((repo) => (
                        <a
                          key={repo.name}
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-purple-900/20 hover:bg-purple-900/30 border border-purple-500/20 hover:border-violet-500/30 rounded-xl p-4 transition-all duration-300 group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-violet-300 font-semibold text-sm group-hover:text-violet-200">{repo.name}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-violet-400 transition-colors" />
                          </div>
                          <p className="text-gray-400 text-xs line-clamp-2 mb-2">{repo.description || "No description"}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {repo.language && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400" />{repo.language}</span>}
                            <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.stars}</span>
                            <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{repo.forks}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ═══════════════════════ MULTI CANDIDATE TAB ═══════════════════════ */}
          {activeTab === "multi" && (
            <motion.div
              key="multi"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Multi-Candidate Comparator
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Compare up to 10 candidates side-by-side. Paste GitHub usernames (one per line).
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">GitHub Usernames *</label>
                      <textarea
                        value={multiUsernames}
                        onChange={(e) => setMultiUsernames(e.target.value)}
                        placeholder={"torvalds\ngaearon\nevanw\ntj\nsindresorhus"}
                        rows={5}
                        className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        {multiUsernames.split("\n").filter((u) => u.trim()).length} usernames entered (max 10)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                        <Target className="w-4 h-4" /> Target Job Role
                      </label>
                      <input
                        type="text"
                        value={multiJobRole}
                        onChange={(e) => setMultiJobRole(e.target.value)}
                        placeholder="e.g. Backend Engineer"
                        className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    onClick={analyzeMulti}
                    disabled={multiLoading || multiUsernames.split("\n").filter((u) => u.trim()).length === 0}
                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    {multiLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Comparing Candidates...</>
                    ) : (
                      <><Search className="w-5 h-5" /> Analyze Candidates</>
                    )}
                  </button>

                  {multiError && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{multiError}</span>
                    </div>
                  )}
                </div>
              </div>

              {multiLoading && (
                <div className="flex flex-col items-center py-16">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-xl bg-cyan-500/30 animate-pulse" />
                    <div className="relative w-16 h-16 border-4 border-purple-900 border-t-cyan-500 rounded-full animate-spin" />
                  </div>
                  <p className="mt-6 text-cyan-400 animate-pulse font-medium">Comparing candidates across multiple dimensions...</p>
                </div>
              )}

              {multiResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Winner & Insights */}
                  <div className="bg-[#150E28]/60 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-amber-500/5 pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <Crown className="w-6 h-6 text-cyan-400" />
                        <h3 className="text-xl font-bold text-white">
                          Recommended Hire: <span className="text-cyan-400">@{multiResult.comparison.recommendedHire}</span>
                        </h3>
                      </div>
                      <p className="text-gray-300 mb-3">{multiResult.comparison.comparisonInsights}</p>
                      <p className="text-gray-400 text-sm italic">{multiResult.comparison.teamComplementarity}</p>
                    </div>
                  </div>

                  {multiResult.failedUsernames.length > 0 && (
                    <div className="flex items-center gap-2 text-[#E1C4FF] bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Could not find: {multiResult.failedUsernames.join(", ")}</span>
                    </div>
                  )}

                  {/* Rankings */}
                  <div className="space-y-4">
                    {multiResult.comparison.rankings.map((candidate, idx) => {
                      const profile = multiResult.profiles.find(
                        (p) => p.username.toLowerCase() === candidate.username.toLowerCase()
                      );
                      const isExpanded = expandedCard === candidate.username;
                      const medalColors = ["text-cyan-400", "text-gray-300", "text-amber-600"];
                      const borderColors = ["border-yellow-500/30", "border-gray-500/30", "border-amber-700/30"];

                      return (
                        <motion.div
                          key={candidate.username}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`bg-[#150E28]/60 backdrop-blur-xl border ${borderColors[idx] || "border-purple-500/20"} rounded-2xl overflow-hidden`}
                        >
                          <div
                            className="p-5 cursor-pointer hover:bg-purple-900/30/20 transition-colors"
                            onClick={() => setExpandedCard(isExpanded ? null : candidate.username)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span className={`text-2xl font-black ${medalColors[idx] || "text-gray-500"}`}>
                                  #{candidate.rank}
                                </span>
                                {profile && (
                                  <img
                                    src={profile.avatar}
                                    alt={profile.username}
                                    className="w-12 h-12 rounded-xl border border-purple-500/30"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-white font-bold">@{candidate.username}</h4>
                                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full">{candidate.experienceLevel}</span>
                                </div>
                                <p className="text-gray-400 text-sm truncate">{candidate.summary}</p>
                              </div>
                              <div className="flex items-center gap-4 flex-shrink-0">
                                <ScoreRing score={candidate.overallScore} size={55} label="Score" />
                                <ScoreRing score={candidate.fitScore} size={55} label="Fit" />
                                {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                              </div>
                            </div>
                          </div>

                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              className="px-5 pb-5 border-t border-purple-900/50"
                            >
                              <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-xs text-cyan-400 uppercase tracking-wider mb-2">Top Skills</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {candidate.topSkills.map((s) => (
                                      <span key={s} className="px-2 py-1 bg-cyan-500/15 text-cyan-300 text-xs rounded-md">{s}</span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2">Strengths</p>
                                  {candidate.strengths.map((s) => (
                                    <div key={s} className="flex items-start gap-2 mb-1">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                                      <span className="text-gray-300 text-sm">{s}</span>
                                    </div>
                                  ))}
                                </div>
                                <div>
                                  <p className="text-xs text-[#E1C4FF] uppercase tracking-wider mb-2">Concerns</p>
                                  {candidate.concerns.map((c) => (
                                    <div key={c} className="flex items-start gap-2 mb-1">
                                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                                      <span className="text-gray-300 text-sm">{c}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              {profile && (
                                <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-purple-500/10">
                                  <span className="text-xs text-gray-500">📦 {profile.publicRepos} repos</span>
                                  <span className="text-xs text-gray-500">⭐ {profile.totalStars} stars</span>
                                  <span className="text-xs text-gray-500">👥 {profile.followers} followers</span>
                                  <span className="text-xs text-gray-500">🔧 {profile.languages.map(l => l.language).join(", ")}</span>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ═══════════════════════ JOB MATCHING TAB ═══════════════════════ */}
          {activeTab === "jobmatch" && (
            <motion.div
              key="jobmatch"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-emerald-400" />
                    Intelligent Job Matching
                  </h2>
                  <p className="text-gray-400 text-sm">
                    AI analyzes a GitHub profile to find perfect job matches including Y Combinator startups
                  </p>

                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                        <Github className="w-4 h-4" /> GitHub Username
                      </label>
                      <input
                        type="text"
                        value={jobMatchUsername}
                        onChange={(e) => setJobMatchUsername(e.target.value)}
                        placeholder="e.g. gaearon"
                        className="w-full px-4 py-3 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    onClick={findJobMatches}
                    disabled={jobMatchLoading || !jobMatchUsername.trim()}
                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    {jobMatchLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Finding Matches...</>
                    ) : (
                      <><TrendingUp className="w-5 h-5" /> Find Job Matches</>
                    )}
                  </button>

                  {jobMatchError && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{jobMatchError}</span>
                    </div>
                  )}
                </div>
              </div>

              {jobMatchLoading && (
                <div className="flex flex-col items-center py-16">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-xl bg-emerald-500/30 animate-pulse" />
                    <div className="relative w-16 h-16 border-4 border-purple-900 border-t-emerald-500 rounded-full animate-spin" />
                  </div>
                  <p className="mt-6 text-emerald-400 animate-pulse font-medium">Matching profile with job opportunities...</p>
                </div>
              )}

              {jobMatchResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Domain */}
                  <div className="bg-[#150E28]/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={jobMatchResult.profile.avatar}
                        alt={jobMatchResult.profile.name}
                        className="w-14 h-14 rounded-xl border border-emerald-500/30"
                      />
                      <div>
                        <h3 className="text-white font-bold text-lg">{jobMatchResult.profile.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm font-semibold rounded-full border border-emerald-500/30">
                            {jobMatchResult.jobMatching.domainClassification}
                          </span>
                          {jobMatchResult.jobMatching.subDomains.map((d) => (
                            <span key={d} className="px-2 py-0.5 bg-purple-800/30 text-gray-300 text-xs rounded-full">{d}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300">{jobMatchResult.jobMatching.careerAdvice}</p>
                  </div>

                  {/* Job Matches */}
                  <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-400" /> Top Job Matches
                    </h3>
                    <div className="space-y-3">
                      {jobMatchResult.jobMatching.jobMatches.map((job, idx) => (
                        <div
                          key={idx}
                          className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-5 hover:border-emerald-500/30 transition-all group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-white font-semibold">{job.title}</h4>
                              <span className="text-gray-400 text-sm">{job.company_type} · {job.salary_range}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ScoreRing score={job.matchScore} size={50} />
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm mb-3">{job.reason}</p>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {job.skills_matched.map((s) => (
                              <span key={s} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 text-xs rounded-md">{s}</span>
                            ))}
                          </div>
                          <a
                            href={job.search_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Search Jobs <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* YC Jobs */}
                  <div className="bg-[#150E28]/60 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="text-orange-400 font-black text-xl">Y</span> Y Combinator Startups
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {jobMatchResult.jobMatching.ycJobBoardMatches.map((job, idx) => (
                        <a
                          key={idx}
                          href={job.searchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-purple-900/20 border border-purple-500/20 hover:border-orange-500/30 rounded-xl p-4 transition-all group"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-semibold text-sm">{job.title}</h4>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-orange-400" />
                          </div>
                          <span className="text-xs text-orange-300/70">{job.companyStage}</span>
                          <div className="mt-3">
                            <div className="w-full bg-purple-800/20 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-amber-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${job.matchScore}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 mt-1">{job.matchScore}% match</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
