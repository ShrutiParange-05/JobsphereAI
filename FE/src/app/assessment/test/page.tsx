"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Clock, Shield, CheckCircle, XCircle } from "lucide-react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface Question {
  Question: string;
  Options: string[];
  Answer: string;
  Difficulty?: string;
  Skill?: string;
}

interface TestData {
  MCQ_Test: Question[];
  TestDuration: number;
  TotalQuestions: number;
}

interface TestResult {
  Score: number;
  CorrectAnswers: number;
  TotalQuestions: number;
  Feedback: string;
  Strengths?: string[];
  WeakAreas?: string[];
  "Recommended Career Path"?: string;
  "Recommended Courses"?: string[];
  IntegrityScore?: number;
}

const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{
    question: string;
    selected: string;
    correct: string;
    difficulty?: string;
    skill?: string;
  }>>([]);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [violations, setViolations] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [testStartTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState<{ skills: string[]; resumeSummary: string } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);

//   useEffect(() => {
//   const fetchUserData = async () => {
//     try {
//       const userId = localStorage.getItem("userId");
//       // const storedName = localStorage.getItem("userName");
//       // if (storedName) setUserName(storedName);

//       if (!userId) {
//         router.push("/auth");
//         return;
//       }

//       console.log("📊 Fetching user data for ID:", userId);

//       const response = await fetch(`${backendUrl}/user/getUserData?userId=${userId}`, {
//         headers: { Authorization: userId }
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const result = await response.json();
//       console.log("✅ API Response:", result);

//       // ✅ FIX: Extract data from ApiResponse wrapper
//       const data = result.data || result;
      
//       console.log("📦 User Data:", data);
//       setUserData(data);
//     } catch (error) {
//       console.error("❌ Error fetching user ", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchUserData();
// }, [router]);



  // Timer

  useEffect(() => {
  const fetchUserDataAndGenerateTest = async () => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        console.error("❌ No userId found");
        router.push("/auth");
        return;
      }

      console.log("📊 Starting test setup for user:", userId);
      setLoading(true);

      // Step 1: Get user profile data
      const userResponse = await fetch(
        `${backendUrl}/user/getUserSkillsAndSummary?userId=${userId}`,
        {
          headers: { Authorization: userId }
        }
      );

      if (!userResponse.ok) {
        throw new Error(`HTTP ${userResponse.status}: Failed to fetch user data`);
      }

      const userData = await userResponse.json();
      console.log("✅ User data loaded:", {
        hasSkills: !!userData.skills,
        hasSummary: !!userData.resumeSummary
      });

      // Step 2: Validate resume was uploaded
      if (!userData.skills || userData.skills.length === 0) {
        setError("No skills found. Please upload your resume first.");
        setTimeout(() => router.push("/assessment/resume"), 2000);
        return;
      }

      if (!userData.resumeSummary) {
        setError("No resume summary found. Please upload your resume first.");
        setTimeout(() => router.push("/assessment/resume"), 2000);
        return;
      }

      setUserData(userData);

      // Step 3: Generate personalized test
      console.log("🎯 Generating test for skills:", userData.skills.slice(0, 3).join(", "), "...");
      
      const testResponse = await fetch(`${backendUrl}/test/generate_skill_test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userId
        },
        body: JSON.stringify({
          skills: userData.skills,
          resumeSummary: userData.resumeSummary
        })
      });

      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error("❌ Test generation failed:", errorText);
        throw new Error(`Failed to generate test: ${testResponse.status}`);
      }

      const generatedTest = await testResponse.json();
      
      // Validate test structure
      if (!generatedTest.MCQ_Test || !Array.isArray(generatedTest.MCQ_Test)) {
        console.error("❌ Invalid test structure:", generatedTest);
        throw new Error("Invalid test format received");
      }

      console.log("✅ Test generated successfully:", {
        questions: generatedTest.TotalQuestions,
        duration: generatedTest.TestDuration
      });

      setTestData(generatedTest);
      setTimeRemaining(generatedTest.TestDuration || 1800);

    } catch (error) {
      console.error("❌ Setup error:", error);
      setError(error instanceof Error ? error.message : "Failed to initialize test");
    } finally {
      setLoading(false);
    }
  };

  fetchUserDataAndGenerateTest();
}, [router, backendUrl]);


  useEffect(() => {
    if (!testData || timeRemaining <= 0 || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testData, timeRemaining, isSubmitting]);

  // Anti-cheating: Tab visibility
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && testData && !isSubmitting) {
        setViolations(prev => prev + 1);
        showWarning("⚠️ Tab switch detected!");
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [testData, isSubmitting]);

  // Anti-cheating: Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) ||
        (e.metaKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) ||
        (e.key === 'PrintScreen') ||
        (e.ctrlKey && e.shiftKey && e.key === 'S')
      ) {
        e.preventDefault();
        showWarning("⚠️ Copy/paste/screenshot blocked");
        setViolations(prev => prev + 1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Anti-cheating: Right-click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showWarning("⚠️ Right-click disabled");
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const showWarning = (msg: string) => {
    setWarningMessage(msg);
    setTimeout(() => setWarningMessage(""), 3000);
  };

  const handleAnswer = (selectedOption: string) => {
    if (!testData || isSubmitting) return;

    const currentQuestion = testData.MCQ_Test[currentIndex];
    const newAnswer = {
      question: currentQuestion.Question,
      selected: selectedOption,
      correct: currentQuestion.Answer,
      difficulty: currentQuestion.Difficulty,
      skill: currentQuestion.Skill
    };

    // Check if this is the last question
    const isLastQuestion = currentIndex + 1 >= testData.MCQ_Test.length;
    
    if (isLastQuestion) {
      // For last question, submit immediately with updated answers
      const finalAnswers = [...answers, newAnswer];
      console.log('Last question answered - submitting with', finalAnswers.length, 'answers');
      submitTestWithAnswers(finalAnswers);
    } else {
      // Not last question - update state and move to next
      setAnswers(prev => [...prev, newAnswer]);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const submitTestWithAnswers = async (finalAnswers: typeof answers) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !userData) throw new Error("Not authenticated");

      const timeSpent = Math.floor((Date.now() - testStartTime) / 1000);

      console.log('Submitting test with', finalAnswers.length, 'answers');

      const testResponse = await fetch(`${backendUrl}/test/check_test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: finalAnswers,
          profile_summary: userData.resumeSummary,
          timeSpent,
          violations
        })
      });

      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        throw new Error(`Failed to submit: ${errorText}`);
      }

      const result = await testResponse.json();
      console.log('Test results:', result);

      const storeResponse = await fetch(`${backendUrl}/user/storeTestResults`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userId
        },
        body: JSON.stringify({
          userId,
          Score: result.Score,
          Feedback: result.Feedback,
          "Recommended Career Path": result["Recommended Career Path"],
          "Recommended Courses": result["Recommended Courses"]
        })
      });

      if (!storeResponse.ok) {
        console.error('Failed to store results');
      }

      // Show results modal
      setTestResults(result);
      setShowResults(true);

      // Auto-redirect after 8 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 8000);

    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : "Submission failed");
      setIsSubmitting(false);
    }
  };

  const submitTest = () => {
    submitTestWithAnswers(answers);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!testData || !testData.MCQ_Test) return null;

  if (isSubmitting && !showResults) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Evaluating your test...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we analyze your answers</p>
        </div>
      </div>
    );
  }

  const currentQuestion = testData.MCQ_Test[currentIndex];
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Skill Assessment Test</h1>
          <p className="text-gray-400">Question {currentIndex + 1} of {testData.TotalQuestions}</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5" />
            <span className={`font-mono ${timeRemaining < 300 ? 'text-red-500' : ''}`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
            <Shield className="w-5 h-5" />
            <span>{violations} violations</span>
          </div>
        </div>
      </div>

      {/* Warning Message */}
      {warningMessage && (
        <div className="max-w-4xl mx-auto mb-4 bg-yellow-500/20 border border-yellow-500 rounded-lg p-3 text-yellow-200">
          {warningMessage}
        </div>
      )}

      {/* Question */}
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-6">
        <div className="mb-4 flex gap-2">
          {currentQuestion?.Difficulty && (
            <span className={`px-2 py-1 rounded text-xs ${
              currentQuestion.Difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
              currentQuestion.Difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {currentQuestion.Difficulty}
            </span>
          )}
          {currentQuestion?.Skill && (
            <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400">
              {currentQuestion.Skill}
            </span>
          )}
        </div>

        <h2 className="text-lg font-semibold mb-6 whitespace-pre-wrap">{currentQuestion?.Question}</h2>

        <div className="space-y-3">
          {currentQuestion?.Options?.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={isSubmitting}
              className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Warning */}
      <div className="max-w-4xl mx-auto mt-6 bg-gray-800 rounded-lg p-4 text-sm text-gray-400">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white mb-1">Anti-Cheating Measures Active</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Tab switching is monitored</li>
              <li>Copy/paste is disabled</li>
              <li>Screenshots are blocked</li>
              <li>Right-click is disabled</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {showResults && testResults && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                testResults.Score >= 70 ? 'bg-green-500/20' : 
                testResults.Score >= 40 ? 'bg-yellow-500/20' : 
                'bg-red-500/20'
              }`}>
                {testResults.Score >= 70 ? (
                  <CheckCircle className="w-12 h-12 text-green-400" />
                ) : (
                  <span className={`text-4xl font-bold ${
                    testResults.Score >= 70 ? 'text-green-400' : 
                    testResults.Score >= 40 ? 'text-yellow-400' : 
                    'text-red-400'
                  }`}>
                    {testResults.Score}%
                  </span>
                )}
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">Test Complete!</h2>
              <p className="text-gray-400 text-lg">
                You answered <span className="text-white font-semibold">{testResults.CorrectAnswers}</span> out of{' '}
                <span className="text-white font-semibold">{testResults.TotalQuestions}</span> questions correctly
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Feedback</h3>
              <p className="text-gray-300 leading-relaxed">{testResults.Feedback}</p>
            </div>

            {testResults["Recommended Career Path"] && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-4">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Recommended Career Path</h3>
                <p className="text-gray-300">{testResults["Recommended Career Path"]}</p>
              </div>
            )}

            {testResults["Recommended Courses"] && testResults["Recommended Courses"].length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Recommended Courses</h3>
                <ul className="space-y-2">
                  {testResults["Recommended Courses"].map((course, idx) => (
                    <li key={idx} className="text-gray-300 flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span>{course}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
            >
              View Dashboard
            </button>
            <p className="text-xs text-center text-gray-500 mt-3">
              Auto-redirecting in 8 seconds...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
