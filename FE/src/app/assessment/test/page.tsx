"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const backendTestUrl = process.env.NEXT_PUBLIC_TEST_URL;
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<
    { question: string; selected: string; correct: string }[]
  >([]);
  const [userData, setUserData] = useState<{
    skills: string[];
    resumeSummary: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        // Fetch user skills & summary once
        const userResponse = await fetch(
          `${backendUrl}/user/getUserSkillsAndSummary?userId=${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: userId,
            },
          }
        );

        if (!userResponse.ok) throw new Error("Failed to fetch user skills");
        const userData = await userResponse.json();

        if (!userData.skills || userData.skills.length === 0) {
          throw new Error("No skills found for the user");
        }

        // Store user data in state
        setUserData(userData);

        // Generate skill test
        const testResponse = await fetch(
          `${backendTestUrl}/generate_skill_test`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input_skills: userData.skills.join(", ") }),
          }
        );

        if (!testResponse.ok) throw new Error("Failed to generate test");
        const testResult = await testResponse.json();

        if (!testResult.MCQ_Test || testResult.MCQ_Test.length === 0) {
          throw new Error("No test data available");
        }

        setTestData(testResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAnswerSelect = (selectedOption: string) => {
    if (!testData || !testData.MCQ_Test) return;

    const currentQuestion = testData.MCQ_Test[currentQuestionIndex];

    setAnswers((prevAnswers) => [
      ...prevAnswers,
      {
        question: currentQuestion.Question,
        selected: selectedOption,
        correct: currentQuestion.Answer,
      },
    ]);

    if (currentQuestionIndex + 1 < testData.MCQ_Test.length) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      submitTest();
    }
  };

  const submitTest = async () => {
    try {
      if (!userData) throw new Error("User data not available");
      const { resumeSummary } = userData;

      let concatenatedString = answers
        .map(
          (item) =>
            `Question: ${item.question}\nselectedanswer: ${item.selected}\nAnswer: ${item.correct}\n`
        )
        .join("\n");

      const response = await fetch(`${backendTestUrl}/check_test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_test: concatenatedString,
          profile_summary: resumeSummary,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit test");

      const result = await response.json();
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("User not authenticated");

      await fetch(`${backendUrl}/user/storeTestResults`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userId,
        },
        body: JSON.stringify({
          userId,
          Score: result.Score,
          Feedback: result.Feedback,
          "Recommended Career Path": result["Recommended Career Path"],
          "Recommended Courses": result["Recommended Courses"],
        }),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error submitting test");
    }
  };

  if (loading)
    return (
      <div className="p-4">
        <p>Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-red-500">
        <h2 className="text-xl font-bold mb-2">Error:</h2>
        <p>{error}</p>
      </div>
    );

  if (!testData || !testData.MCQ_Test || testData.MCQ_Test.length === 0)
    return <p>No test data available</p>;

  const currentQuestion = testData.MCQ_Test[currentQuestionIndex];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Skill Test</h1>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">
          {currentQuestion.Question}
        </h2>
        <div className="space-y-2">
          {currentQuestion.Options.map((option: string, index: number) => (
            <button
              key={index}
              className="block w-full text-left p-2 border border-gray-300 rounded-lg hover:bg-gray-200"
              onClick={() => handleAnswerSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4">
        Question {currentQuestionIndex + 1} of {testData.MCQ_Test.length}
      </p>
    </div>
  );
};

export default Page;
