'use client';

import React, { useEffect, useState } from "react";
import { BookOpen, ExternalLink, Play } from "lucide-react";

interface Course {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoId: string;
  url: string;
}

interface CareerData {
  user: {
    name: string;
    email: string;
    skills: string[];
    summary: string;
  };
  recommendedCourses: Course[];
}

export default function Page() {
  const [careerData, setCareerData] = useState<CareerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCareerData = async () => {
      try {
        // Only run in client-side
        if (typeof window !== 'undefined') {
          const userId = localStorage.getItem("userId");
          if (!userId) {
            throw new Error("User ID not found");
          }

          const response = await fetch(`http://localhost:3001/api/career/get-videos?userId=${userId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch career data");
          }

          const data = await response.json();
          setCareerData(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCareerData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 bg-red-100 px-4 py-2 rounded-lg">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      {careerData && (
        <div className="max-w-7xl mx-auto">
          {/* User Profile Section */}
          <div className="bg-gray-800 rounded-xl p-8 mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Welcome, {careerData.user.name}!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-300 mb-2">Profile Summary</h2>
                <p className="text-gray-400">{careerData.user.summary}</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-300 mb-2">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {careerData.user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-500 bg-opacity-20 text-blue-400 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Courses Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Recommended Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {careerData.recommendedCourses.map((course, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-xl overflow-hidden transition-transform hover:scale-105"
                >
                  <div className="relative">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Watch Now
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}