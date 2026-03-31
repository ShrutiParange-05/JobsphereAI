"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Target,
  BarChart3,
  BookOpen,
  Code2,
  Briefcase,
  Award,
  TrendingUp,
  ChevronRight,
  X,
  Search,
  Lightbulb,
  Shield,
  Layers,
  PenTool,
  GraduationCap,
  Wrench,
  Clock,
  ArrowRight,
  Star,
  Zap,
  ExternalLink,
  Trophy,
} from "lucide-react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:3001/api";

interface SectionScore {
  score: number;
  feedback: string;
}

interface Recommendation {
  priority: string;
  category: string;
  suggestion: string;
}

interface FullAnalysis {
  overallScore: number;
  atsCompatibility: number;
  contentQuality: number;
  formatting: number;
  impactScore: number;
  extractedInfo: {
    name: string;
    email: string;
    phone: string;
    currentRole: string;
    yearsExperience: number;
    education: string;
    topSkills: string[];
  };
  sectionScores: {
    summary: SectionScore;
    experience: SectionScore;
    education: SectionScore;
    skills: SectionScore;
    projects: SectionScore;
  };
  topRecommendations: Recommendation[];
  quickWins: string[];
  competitiveAnalysis: string;
}

// Optimization types config
const OPTIMIZATION_TYPES = [
  {
    id: "ats_keywords",
    title: "ATS Keyword Optimizer",
    description: "Optimize your resume for Applicant Tracking Systems with perfect keyword density",
    icon: Search,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
  },
  {
    id: "experience_enhancer",
    title: "Experience Enhancer",
    description: "Transform bullet points with STAR method, action verbs, and quantified achievements",
    icon: TrendingUp,
    color: "from-emerald-500 to-green-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    textColor: "text-emerald-400",
  },
  {
    id: "skills_hierarchy",
    title: "Skills Hierarchy Creator",
    description: "Organize skills by proficiency level and relevance to your target role",
    icon: Layers,
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    textColor: "text-violet-400",
  },
  {
    id: "professional_summary",
    title: "Professional Summary Crafter",
    description: "Generate multiple compelling summary options tailored to different contexts",
    icon: PenTool,
    color: "from-purple-600 to-fuchsia-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    textColor: "text-[#E1C4FF]",
  },
  {
    id: "education_optimizer",
    title: "Education Optimizer",
    description: "Enhance education section with relevant coursework, certifications, and achievements",
    icon: GraduationCap,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    textColor: "text-pink-400",
  },
  {
    id: "tech_skills_showcase",
    title: "Technical Skills Showcase",
    description: "Create an impactful tech stack presentation with project highlights",
    icon: Wrench,
    color: "from-cyan-500 to-teal-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    textColor: "text-cyan-400",
  },
  {
    id: "career_gap_framing",
    title: "Career Gap Framing",
    description: "Positively frame career gaps with professional narratives and strategies",
    icon: Clock,
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    textColor: "text-indigo-400",
  },
];

// Score ring component
function ScoreRing({ score, size = 80, label, colorOverride }: { score: number; size?: number; label?: string; colorOverride?: string }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = colorOverride || (score >= 80 ? "#22c55e" : score >= 60 ? "#3b82f6" : score >= 40 ? "#eab308" : "#ef4444");

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

export default function ResumeOptimizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<FullAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  const [selectedOptType, setSelectedOptType] = useState<string | null>(null);
  const [optResult, setOptResult] = useState<Record<string, unknown> | null>(null);
  const [optLoading, setOptLoading] = useState(false);
  const [optError, setOptError] = useState("");

  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (f) {
      setFile(f);
      setAnalysis(null);
      setOptResult(null);
      setSelectedOptType(null);
      // Create preview URL
      const url = URL.createObjectURL(f);
      setResumePreviewUrl(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  // Full analysis
  const analyzeResume = async () => {
    if (!file) return;
    setAnalysisLoading(true);
    setAnalysisError("");
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      if (jobTitle) formData.append("jobTitle", jobTitle);
      if (jobDescription) formData.append("jobDescription", jobDescription);

      const res = await fetch(`${backendUrl}/resume-optimizer/analyze`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setAnalysis(data.data.analysis);
    } catch (err: unknown) {
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Specific optimization
  const runOptimization = async (optType: string) => {
    if (!file) return;
    setSelectedOptType(optType);
    setOptLoading(true);
    setOptError("");
    setOptResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("optimizationType", optType);
      if (jobTitle) formData.append("jobTitle", jobTitle);
      if (jobDescription) formData.append("jobDescription", jobDescription);

      const res = await fetch(`${backendUrl}/resume-optimizer/optimize`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setOptResult(data.data.optimization);
    } catch (err: unknown) {
      setOptError(err instanceof Error ? err.message : "Optimization failed");
    } finally {
      setOptLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setAnalysis(null);
    setOptResult(null);
    setSelectedOptType(null);
    if (resumePreviewUrl) URL.revokeObjectURL(resumePreviewUrl);
    setResumePreviewUrl(null);
  };

  // Render optimization results dynamically
  const renderOptResult = () => {
    if (!optResult || !selectedOptType) return null;
    const opt = OPTIMIZATION_TYPES.find((o) => o.id === selectedOptType);
    if (!opt) return null;

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className={`bg-[#150E28]/60 backdrop-blur-xl border ${opt.borderColor} rounded-2xl p-6`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-xl ${opt.bgColor}`}>
              <opt.icon className={`w-5 h-5 ${opt.textColor}`} />
            </div>
            <h3 className="text-xl font-bold text-white">{opt.title} Results</h3>
          </div>

          {/* Render JSON result as formatted cards */}
          <div className="space-y-4">
            {Object.entries(optResult).map(([key, value]) => {
              const label = key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();

              // String values
              if (typeof value === "string") {
                return (
                  <div key={key} className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                    <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">{label}</h4>
                    <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{value}</p>
                  </div>
                );
              }

              // Number values (scores)
              if (typeof value === "number") {
                return (
                  <div key={key} className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20 flex items-center gap-4">
                    <ScoreRing score={value} size={60} />
                    <span className="text-gray-300 font-medium capitalize">{label}</span>
                  </div>
                );
              }

              // Array of strings
              if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
                return (
                  <div key={key} className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                    <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">{label}</h4>
                    <div className="flex flex-wrap gap-2">
                      {(value as string[]).map((item, idx) => (
                        <span key={idx} className={`px-3 py-1.5 ${opt.bgColor} ${opt.textColor} text-sm rounded-lg border ${opt.borderColor}`}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }

              // Array of objects
              if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
                return (
                  <div key={key} className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                    <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">{label}</h4>
                    <div className="space-y-3">
                      {(value as Record<string, unknown>[]).map((item, idx) => (
                        <div key={idx} className="bg-[#150E28]/60 rounded-lg p-3 border border-purple-500/15">
                          {Object.entries(item).map(([k, v]) => {
                            const sublabel = k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
                            if (typeof v === "string") {
                              return (
                                <div key={k} className="mb-2">
                                  <span className="text-xs text-gray-500 uppercase">{sublabel}: </span>
                                  <span className="text-gray-300 text-sm">{v}</span>
                                </div>
                              );
                            }
                            if (typeof v === "number") {
                              return (
                                <div key={k} className="mb-2 flex items-center gap-2">
                                  <span className="text-xs text-gray-500 uppercase">{sublabel}: </span>
                                  <div className="flex-1 bg-purple-800/20 rounded-full h-2">
                                    <div
                                      className={`bg-gradient-to-r ${opt.color} h-2 rounded-full transition-all duration-500`}
                                      style={{ width: `${Math.min(100, v)}%` }}
                                    />
                                  </div>
                                  <span className={`text-sm font-bold ${opt.textColor}`}>{v}%</span>
                                </div>
                              );
                            }
                            if (Array.isArray(v)) {
                              return (
                                <div key={k} className="mb-2">
                                  <span className="text-xs text-gray-500 uppercase block mb-1">{sublabel}:</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {(v as string[]).map((s, si) => (
                                      <span key={si} className="px-2 py-0.5 bg-purple-800/30 text-gray-300 text-xs rounded-md">{String(s)}</span>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // Nested objects
              if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                return (
                  <div key={key} className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                    <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">{label}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(value as Record<string, unknown>).map(([k, v]) => {
                        const sublabel = k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
                        if (typeof v === "string") {
                          return (
                            <div key={k} className="bg-[#150E28]/60 rounded-lg p-3 border border-purple-500/15">
                              <span className="text-xs text-gray-500 uppercase block mb-1">{sublabel}</span>
                              <span className="text-gray-200 text-sm">{v}</span>
                            </div>
                          );
                        }
                        if (Array.isArray(v)) {
                          return (
                            <div key={k} className="bg-[#150E28]/60 rounded-lg p-3 border border-purple-500/15 col-span-full">
                              <span className="text-xs text-gray-500 uppercase block mb-2">{sublabel}</span>
                              <div className="flex flex-wrap gap-1.5">
                                {(v as string[]).map((s, si) => (
                                  <span key={si} className={`px-2 py-1 ${opt.bgColor} ${opt.textColor} text-xs rounded-md border ${opt.borderColor}`}>{String(s)}</span>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8 p-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 border border-purple-500/30">
              <FileText className="w-7 h-7 text-[#E1C4FF]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400">
                Resume Optimizer
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                AI-powered resume analysis with 7 specialized optimization tools
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#E1C4FF]" /> Upload Resume
                </h2>

                {!file ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed ${isDragActive ? "border-purple-500 bg-purple-500/10" : "border-gray-700"} rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300`}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-purple-900/30 rounded-xl">
                        <Upload className="w-8 h-8 text-[#E1C4FF]" />
                      </div>
                      <p className="text-gray-300 font-medium">Drop your PDF resume here</p>
                      <p className="text-gray-500 text-sm">or click to browse (max 10MB)</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-purple-900/20 rounded-xl p-4 border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <FileText className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm truncate max-w-[180px]">{file.name}</p>
                          <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button onClick={removeFile} className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors">
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Job Settings */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" /> Job Title
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Frontend Engineer"
                      className="w-full px-3 py-2.5 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" /> Job Description (Optional)
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here for tailored optimization..."
                      rows={3}
                      className="w-full px-3 py-2.5 bg-purple-900/30 border border-purple-500/30 rounded-xl text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={analyzeResume}
                  disabled={!file || analysisLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-600 hover:to-fuchsia-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                  {analysisLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Analyze Resume</>
                  )}
                </button>

                {analysisError && (
                  <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{analysisError}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* PDF Preview */}
            {resumePreviewUrl && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 overflow-hidden">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#E1C4FF]" /> Resume Preview
                </h3>
                <div className="bg-purple-900/20 rounded-xl overflow-hidden" style={{ height: "400px" }}>
                  <iframe
                    src={resumePreviewUrl}
                    className="w-full h-full border-0"
                    title="Resume Preview"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loading */}
            {analysisLoading && (
              <div className="flex flex-col items-center py-24">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-xl bg-purple-500/30 animate-pulse" />
                  <div className="relative w-16 h-16 border-4 border-purple-900 border-t-amber-500 rounded-full animate-spin" />
                </div>
                <p className="mt-6 text-[#E1C4FF] animate-pulse font-medium">Performing deep resume analysis...</p>
                <p className="mt-1 text-gray-500 text-sm">Evaluating ATS compatibility, content quality & more</p>
              </div>
            )}

            {/* Analysis Results */}
            {analysis && !analysisLoading && (
              <AnimatePresence>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Score Overview */}
                  <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-white">Resume Analysis</h3>
                          {analysis.extractedInfo.name && (
                            <p className="text-gray-400 mt-1">
                              {analysis.extractedInfo.name} · {analysis.extractedInfo.currentRole}
                              {analysis.extractedInfo.yearsExperience > 0 && ` · ${analysis.extractedInfo.yearsExperience} years exp`}
                            </p>
                          )}
                        </div>
                        <ScoreRing score={analysis.overallScore} size={90} label="Overall" />
                      </div>

                      {/* Score cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "ATS Score", score: analysis.atsCompatibility, color: "#3b82f6" },
                          { label: "Content", score: analysis.contentQuality, color: "#22c55e" },
                          { label: "Formatting", score: analysis.formatting, color: "#a855f7" },
                          { label: "Impact", score: analysis.impactScore, color: "#f59e0b" },
                        ].map((item) => (
                          <div key={item.label} className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20 text-center">
                            <ScoreRing score={item.score} size={55} colorOverride={item.color} />
                            <p className="text-xs text-gray-400 mt-2 font-medium">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {analysis.extractedInfo.topSkills.length > 0 && (
                    <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-violet-400" /> Detected Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {analysis.extractedInfo.topSkills.map((skill) => (
                          <span key={skill} className="px-3 py-1.5 bg-violet-500/15 text-violet-300 text-sm rounded-lg border border-violet-500/20">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section Scores */}
                  <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-cyan-400" /> Section Breakdown
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(analysis.sectionScores).map(([section, data]) => (
                        <div key={section} className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium capitalize">{section}</span>
                            <span className={`text-sm font-bold ${data.score >= 70 ? "text-emerald-400" : data.score >= 50 ? "text-[#E1C4FF]" : "text-red-400"}`}>
                              {data.score}/100
                            </span>
                          </div>
                          <div className="w-full bg-purple-800/20 rounded-full h-2 mb-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-700 ${data.score >= 70 ? "bg-emerald-500" : data.score >= 50 ? "bg-purple-500" : "bg-red-500"}`}
                              style={{ width: `${data.score}%` }}
                            />
                          </div>
                          <p className="text-gray-400 text-sm">{data.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Wins & Top Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#150E28]/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-emerald-400" /> Quick Wins
                      </h3>
                      <div className="space-y-3">
                        {analysis.quickWins.map((win, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{win}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-[#E1C4FF]" /> Top Recommendations
                      </h3>
                      <div className="space-y-3">
                        {analysis.topRecommendations.map((rec, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${
                              rec.priority === "high" ? "bg-red-500/20 text-red-400" : rec.priority === "medium" ? "bg-purple-500/20 text-[#E1C4FF]" : "bg-blue-500/20 text-blue-400"
                            }`}>
                              {rec.priority}
                            </span>
                            <span className="text-gray-300 text-sm">{rec.suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Competitive Analysis */}
                  <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-cyan-400" /> Competitive Analysis
                    </h3>
                    <p className="text-gray-300 leading-relaxed">{analysis.competitiveAnalysis}</p>
                  </div>

                  {/* Optimization Tools */}
                  <div className="bg-[#150E28]/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#E1C4FF]" /> Optimization Tools
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">Click any tool to get AI-powered specific optimization for your resume</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {OPTIMIZATION_TYPES.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => runOptimization(opt.id)}
                          disabled={optLoading}
                          className={`group text-left bg-purple-900/20 hover:bg-purple-900/40 border ${
                            selectedOptType === opt.id ? opt.borderColor : "border-purple-500/20 hover:border-purple-400/30"
                          } rounded-xl p-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${opt.bgColor}`}>
                              <opt.icon className={`w-5 h-5 ${opt.textColor}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-semibold text-sm mb-0.5 group-hover:text-white">{opt.title}</h4>
                              <p className="text-gray-500 text-xs line-clamp-2">{opt.description}</p>
                            </div>
                            {optLoading && selectedOptType === opt.id ? (
                              <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0 mt-1" />
                            ) : (
                              <ChevronRight className={`w-4 h-4 text-gray-600 group-hover:${opt.textColor} flex-shrink-0 mt-1 transition-colors`} />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optimization Result */}
                  {optLoading && (
                    <div className="flex flex-col items-center py-12">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full blur-xl bg-violet-500/30 animate-pulse" />
                        <div className="relative w-12 h-12 border-4 border-purple-900 border-t-violet-500 rounded-full animate-spin" />
                      </div>
                      <p className="mt-4 text-violet-400 animate-pulse text-sm font-medium">
                        Running {OPTIMIZATION_TYPES.find((o) => o.id === selectedOptType)?.title}...
                      </p>
                    </div>
                  )}

                  {optError && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{optError}</span>
                    </div>
                  )}

                  {optResult && !optLoading && renderOptResult()}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Empty state */}
            {!analysis && !analysisLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="p-6 bg-[#150E28]/60 rounded-3xl border border-purple-500/15 mb-6">
                  <FileText className="w-16 h-16 text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">Upload Your Resume</h3>
                <p className="text-gray-500 text-sm max-w-md">
                  Upload a PDF resume and optionally provide a target job to get comprehensive AI analysis and 7 specialized optimization tools.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 max-w-lg">
                  {[
                    { icon: Shield, label: "ATS Score" },
                    { icon: TrendingUp, label: "Impact Analysis" },
                    { icon: Layers, label: "Skill Hierarchy" },
                    { icon: PenTool, label: "Summary Craft" },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#150E28]/40 rounded-xl p-3 border border-purple-500/10 text-center">
                      <item.icon className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                      <span className="text-gray-500 text-xs">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
