'use client';

import React, { useState } from 'react';
import { Search, Building2, MapPin, Briefcase, ExternalLink, AlertCircle, RefreshCw, Linkedin, Globe, Radio } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollReveal } from "@/components/scroll-wrapper";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001/api';

interface Job {
  title: string;
  company_name: string;
  location: string;
  description: string;
  extensions?: string[];
  apply_options?: Array<{ title: string; link: string }>;
  job_id?: string;
  source?: string;
}

interface SourceMeta {
  'Google Jobs (SerpAPI)'?: number;
  'LinkedIn (JSearch)'?: number;
  Adzuna?: number;
  'Remotive (Remote)'?: number;
  SkillAssessmentAPI?: number;
  total?: number;
}

const sourceColors: Record<string, string> = {
  'LinkedIn (JSearch)': 'bg-blue-600/20 text-blue-400 border-blue-500/30',
  'Google Jobs': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Google Jobs (SerpAPI)': 'bg-red-500/20 text-red-400 border-red-500/30',
  Adzuna: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Remotive (Remote)': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  SkillAssessmentAPI: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const SourceBadge = ({ source }: { source?: string }) => {
  if (!source) return null;
  const colorClass = sourceColors[source] || 'bg-gray-600/20 text-gray-400 border-gray-500/30';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {source}
    </span>
  );
};

const DashboardJobsPage = () => {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sourceMeta, setSourceMeta] = useState<SourceMeta | null>(null);

  const handleSearch = async () => {
    if (!industry.trim() || !location.trim()) {
      setError('Please enter both industry and location');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setError(null);
    setSourceMeta(null);

    try {
      console.log('🔍 Searching jobs from multiple sources:', { industry, location });

      const response = await fetch(`${backendUrl}/jobs/job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: industry.trim(),
          location: location.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Jobs fetched:', data.meta);
        setJobs(data.jobs || []);
        setSourceMeta(data.meta?.sources || null);

        if (!data.jobs || data.jobs.length === 0) {
          setError('No jobs found for this search. Try different keywords or location.');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API error:', response.status, errorText);
        setError('Failed to fetch jobs. Please try again later.');
      }
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  // ── Initial search form ──────────────────────────────────────────────────

  if (!hasSearched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 shadow-2xl border-gray-800 bg-gray-900/50 backdrop-blur-md animate-in zoom-in-95 fade-in duration-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mb-4 animate-bounce">
              <Briefcase className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Find Your Dream Job</h1>
            <p className="text-gray-400">Search across LinkedIn, Google Jobs, Adzuna, Remotive & more</p>

            {/* Source pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['LinkedIn', 'Google Jobs', 'Adzuna', 'Remotive'].map((s) => (
                <span key={s} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${sourceColors[s] || sourceColors[s + ' (JSearch)'] || 'bg-gray-600/20 text-gray-400 border-gray-500/30'}`}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Industry / Job Title
              </label>
              <Input
                type="text"
                placeholder="e.g., Software Engineer, Data Scientist"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all hover:border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <Input
                type="text"
                placeholder="e.g., Mumbai, Bangalore, Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-gray-950 border-gray-800 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all hover:border-gray-700"
              />
            </div>

            <Button
              onClick={handleSearch}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-blue-500/25 py-6 text-base font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Searching all sources...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search Jobs
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Results page ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">

        {/* Sticky search header */}
        <Card className="mb-6 p-4 sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-gray-800 shadow-xl">
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <Input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Industry / Job Title"
                className="w-full bg-gray-950 border-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Location"
                className="w-full bg-gray-950 border-gray-800 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 transition-all"
            >
              {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
              Search
            </Button>
          </div>

          {/* Source breakdown */}
          {sourceMeta && !loading && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">Sources:</span>
              {Object.entries(sourceMeta)
                .filter(([k, v]) => k !== 'total' && (v as number) > 0)
                .map(([source, count]) => (
                  <span key={source} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${sourceColors[source] || 'bg-gray-600/20 text-gray-400 border-gray-500/30'}`}>
                    {source} <span className="font-bold">({count})</span>
                  </span>
                ))}
              <span className="ml-auto text-sm text-gray-400">
                Found <span className="font-semibold text-blue-400">{jobs.length}</span> jobs for &quot;{industry}&quot; in {location}
              </span>
            </div>
          )}
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-950/50 border-red-900 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full blur-xl bg-blue-500/30" />
              <RefreshCw className="w-12 h-12 text-blue-500 animate-spin relative" />
            </div>
            <p className="text-blue-400 mb-2">Searching across all job sources...</p>
            <div className="flex gap-2 mt-2">
              {['LinkedIn', 'Google Jobs', 'Adzuna', 'Remotive'].map((s) => (
                <span key={s} className="text-xs text-gray-500 animate-pulse">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && (
          <div className="space-y-4">
            {jobs.length > 0 ? (
              jobs.map((job, index) => (
                <ScrollReveal key={job.job_id || index} delay={Math.min(index * 80, 600)}>
                  <Card className="bg-gray-900 border-gray-800 text-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500 group">
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Title + source */}
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <h2 className="text-xl font-semibold text-gray-100 group-hover:text-blue-400 transition-colors">
                              {job.title}
                            </h2>
                            <SourceBadge source={job.source} />
                          </div>

                          {/* Company & location */}
                          <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-3">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4 flex-shrink-0" />
                              <span className="font-medium">{job.company_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span>{job.location}</span>
                            </div>
                          </div>

                          {/* Extensions / tags */}
                          {job.extensions && job.extensions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {job.extensions.slice(0, 4).map((ext, i) => (
                                <Badge key={i} variant="secondary" className="bg-gray-800 text-gray-300 text-xs">
                                  {ext}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Description */}
                          <p className="text-gray-400 line-clamp-3 mb-4 group-hover:text-gray-300 transition-colors text-sm leading-relaxed">
                            {job.description}
                          </p>

                          {/* Apply options */}
                          {job.apply_options && job.apply_options.length > 0 && (
                            <div className="border-t border-gray-800 pt-4 mt-4">
                              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Apply via:</h3>
                              <div className="flex flex-wrap gap-2">
                                {job.apply_options.slice(0, 5).map((option, i) => (
                                  <a
                                    key={i}
                                    href={option.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all hover:scale-105 active:scale-95 border border-blue-500/20 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20"
                                  >
                                    {option.title}
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </ScrollReveal>
              ))
            ) : (
              <Card className="p-12 bg-gray-900 border-gray-800">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No jobs found</h3>
                  <p className="text-gray-500 mb-4">We couldn&apos;t find any jobs matching your search criteria.</p>
                  <p className="text-sm text-gray-600 mb-6">Try adjusting your search terms or location, or broaden your search.</p>
                  <Button
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    onClick={() => {
                      setHasSearched(false);
                      setJobs([]);
                      setError(null);
                    }}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Start New Search
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardJobsPage;
