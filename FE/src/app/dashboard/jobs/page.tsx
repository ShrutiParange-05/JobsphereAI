'use client';

import React, { useState } from 'react';
import { Search, Building2, MapPin, Briefcase, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollReveal } from "@/components/scroll-wrapper";

interface Job {
  title: string;
  company_name: string;
  location: string;
  description: string;
  extensions?: string[];
  apply_options?: Array<{
    title: string;
    link: string;
  }>;
  job_id?: string;
}

const DashboardJobsPage = () => {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!industry.trim() || !location.trim()) {
      setError('Please enter both industry and location');
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setError(null);

    try {
      console.log('🔍 Searching jobs:', { industry, location });
      
      const response = await fetch(`https://skillassessmentapi.onrender.com/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          job_title: industry.trim(), 
          location: location.trim() 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Jobs fetched:', data.jobs?.length || 0);
        setJobs(data.jobs || []);
        
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
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Initial search form (before first search)
  if (!hasSearched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 shadow-2xl border-gray-800 bg-gray-900/50 backdrop-blur-md animate-in zoom-in-95 fade-in duration-700 hover:shadow-blue-500/10 transition-all">
          <div className="text-center mb-8 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-150">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mb-4 animate-bounce">
              <Briefcase className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Find Your Dream Job</h1>
            <p className="text-gray-400">Enter your preferred industry and location to discover opportunities</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4 animate-in shake fade-in duration-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 animate-in slide-in-from-bottom-8 fade-in duration-500 delay-300">
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-blue-500/25" 
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
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

  // Job results page
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-500">
        {/* Search header with filters */}
        <Card className="mb-6 p-4 sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-gray-800 shadow-xl animate-in slide-in-from-top-4 duration-500">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Industry / Job Title"
                className="w-full bg-gray-950 border-gray-800 text-white transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Location"
                className="w-full bg-gray-950 border-gray-800 text-white transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={loading}
              className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search
            </Button>
          </div>
          
          {jobs.length > 0 && !loading && (
            <p className="text-sm text-gray-400 mt-3 animate-in fade-in duration-500">
              Found <span className="font-semibold text-blue-400">{jobs.length}</span> jobs for "{industry}" in {location}
            </p>
          )}
        </Card>

        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-4 fade-in duration-300 bg-red-950/50 border-red-900 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="relative mb-4">
               <div className="absolute inset-0 rounded-full blur-xl bg-blue-500/30"></div>
               <RefreshCw className="w-12 h-12 text-blue-500 animate-spin relative" />
            </div>
            <p className="text-blue-400">Searching the deep web for opportunities...</p>
          </div>
        )}

        {/* Job results */}
        {!loading && (
          <div className="space-y-4">
            {jobs.length > 0 ? (
              jobs.map((job, index) => (
                <ScrollReveal key={job.job_id || index} delay={index * 100}>
                  <Card 
                    className="bg-gray-900 border-gray-800 text-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500 group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Job title */}
                          <h2 className="text-xl font-semibold text-gray-100 group-hover:text-blue-400 transition-colors mb-2">
                            {job.title}
                          </h2>

                          {/* Company and location */}
                          <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-3">
                            <div className="flex items-center gap-1 group/company">
                              <Building2 className="h-4 w-4 flex-shrink-0 group-hover/company:text-gray-300 transition-colors" />
                              <span className="font-medium group-hover/company:text-gray-300 transition-colors">{job.company_name}</span>
                            </div>
                            <div className="flex items-center gap-1 group/location">
                              <MapPin className="h-4 w-4 flex-shrink-0 group-hover/location:text-gray-300 transition-colors" />
                              <span className="group-hover/location:text-gray-300 transition-colors">{job.location}</span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-gray-400 line-clamp-3 mb-4 group-hover:text-gray-300 transition-colors">
                            {job.description}
                          </p>

                          {/* Apply options */}
                          {job.apply_options && job.apply_options.length > 0 && (
                            <div className="border-t border-gray-800 pt-4 mt-4">
                              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                                Apply via:
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {job.apply_options.slice(0, 4).map((option, i) => (
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
              // No jobs found
              <Card className="p-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Briefcase className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-500 mb-4">
                    We couldn't find any jobs matching your search criteria.
                  </p>
                  <p className="text-sm text-gray-400 mb-6">
                    Try adjusting your search terms or location, or broaden your search.
                  </p>
                  <Button 
                    variant="outline" 
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
