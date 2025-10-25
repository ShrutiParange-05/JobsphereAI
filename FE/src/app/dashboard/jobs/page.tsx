'use client';

import React, { useEffect, useState } from 'react';
import { Search, Building2, MapPin, Briefcase, Clock, Users, ExternalLink, BookmarkPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const DashboardJobsPage = () => {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);

  const handleSearch = async () => {
    if (!industry || !location) {
      alert('Please enter both industry and location');
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(`https://skillassessmentapi.onrender.com/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_title: industry, location: location }),
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      } else {
        alert('Failed to fetch jobs. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      alert('Error fetching jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasSearched) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-2xl mx-4 p-8">
          {/* Initial search form remains the same */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Dream Job</h1>
            <p className="text-gray-600">Enter your preferred industry and location to get started</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <Input type="text" placeholder="e.g., Software Engineering" value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <Input type="text" placeholder="e.g., Mumbai" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full" />
            </div>

            <Button onClick={handleSearch} className="w-full" size="lg">
              <Search className="w-4 h-4 mr-2" />
              Search Jobs
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Card className="mb-6 p-4">
        <div className="flex gap-4">
          <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Industry" className="flex-1" />
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="flex-1" />
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.length > 0 ? (
            jobs.map((job, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                          {job.title}
                        </h2>
                      </div>

                      <div className="mt-2 flex items-center text-gray-500 text-sm gap-4">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1" /> {job.company_name}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" /> {job.location}
                        </div>
                        {job.extensions && job.extensions.map((ext, i) => (
                          <Badge key={i} variant="secondary" className="ml-2">
                            {ext}
                          </Badge>
                        ))}
                      </div>

                      <p className="mt-3 text-gray-600 line-clamp-2">{job.description}</p>

                      {/* Added Apply Via Section */}
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Apply via:</h3>
                        <div className="flex flex-wrap gap-2">
                          {job.apply_options && job.apply_options.slice(0, 3).map((option, i) => (
                            <a
                              key={i}
                              href={option.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition duration-200"
                            >
                              {option.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No jobs found</h3>
                <p className="mt-2 text-gray-500">Try adjusting your search criteria or location</p>
                <Button className="mt-4" variant="outline" onClick={() => setHasSearched(false)}>
                  Start New Search
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardJobsPage;