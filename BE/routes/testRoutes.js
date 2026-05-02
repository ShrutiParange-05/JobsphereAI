import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import os from "os";
import { ApiResponse } from "../utils/ApiResponse.js";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const router = Router();


// Helper function to clean AI response
function cleanJsonResponse(text) {
  let cleaned = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "");
  cleaned = cleaned.replace(/^\s*json\s*/i, "").replace(/`/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

// Fallback questions in case of API failure or quota limit
const FALLBACK_TESTS = {
  "default": [
    {
      "Question": "What is the primary purpose of version control systems like Git?",
      "Options": ["To compile code faster", "To track changes and collaborate on code", "To encrypt source files", "To automatically deploy applications"],
      "Answer": "To track changes and collaborate on code",
      "Difficulty": "easy",
      "Skill": "Software Engineering"
    },
    {
      "Question": "In React, what is the 'virtual DOM' primarily used for?",
      "Options": ["To store user data securely", "To optimize rendering performance by minimizing actual DOM updates", "To replace CSS for styling", "To handle database connections"],
      "Answer": "To optimize rendering performance by minimizing actual DOM updates",
      "Difficulty": "medium",
      "Skill": "React"
    },
    {
      "Question": "Which of the following is a key characteristic of RESTful APIs?",
      "Options": ["Stateful communication", "Statelessness", "Proprietary protocols", "Mandatory XML format"],
      "Answer": "Statelessness",
      "Difficulty": "medium",
      "Skill": "Web Development"
    },
    {
      "Question": "In Python, what does the 'with' statement help with when opening a file?",
      "Options": ["Making the code run faster", "Automatically closing the file after the block finishes", "Encrypting the file content", "Allowing multiple users to edit at once"],
      "Answer": "Automatically closing the file after the block finishes",
      "Difficulty": "easy",
      "Skill": "Python"
    },
    {
      "Question": "What is the time complexity of searching for an element in a balanced binary search tree?",
      "Options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
      "Answer": "O(log n)",
      "Difficulty": "hard",
      "Skill": "Data Structures"
    },
    {
      "Question": "Which SQL command is used to combine rows from two or more tables based on a related column?",
      "Options": ["COMBINE", "JOIN", "MERGE", "ATTACH"],
      "Answer": "JOIN",
      "Difficulty": "easy",
      "Skill": "SQL"
    },
    {
      "Question": "In JavaScript, what is the difference between '==' and '==='?",
      "Options": ["There is no difference", "'==' checks value and type, '===' only checks value", "'===' checks value and type, '==' performs type coercion", "'==' is for numbers, '===' is for strings"],
      "Answer": "'===' checks value and type, '==' performs type coercion",
      "Difficulty": "medium",
      "Skill": "JavaScript"
    },
    {
      "Question": "What is the main goal of the 'normalization' process in database design?",
      "Options": ["To increase data redundancy", "To reduce data redundancy and improve data integrity", "To make queries slower", "To compress the database size"],
      "Answer": "To reduce data redundancy and improve data integrity",
      "Difficulty": "hard",
      "Skill": "Databases"
    },
    {
      "Question": "Which of these is NOT a principle of Object-Oriented Programming (OOP)?",
      "Options": ["Encapsulation", "Inheritance", "Polymorphism", "Synchronization"],
      "Answer": "Synchronization",
      "Difficulty": "medium",
      "Skill": "OOP"
    },
    {
      "Question": "What does the 'Big O' notation represent in algorithm analysis?",
      "Options": ["The exact number of lines of code", "The worst-case scenario of time or space complexity", "The average execution time in seconds", "The number of variables used"],
      "Answer": "The worst-case scenario of time or space complexity",
      "Difficulty": "hard",
      "Skill": "Computer Science"
    }
  ]
};

// Generate personalized skill test
router.post('/generate_skill_test', async (req, res) => {
  try {
    const { skills, resumeSummary } = req.body;
    
    if (!skills || !resumeSummary) {
      return res.status(400).json(
        new ApiResponse(false, 400, null, 'Skills and resume summary required')
      );
    }

    const skillsText = Array.isArray(skills) ? skills.join(', ') : skills;
    console.log('📝 Generating test for:', skillsText.substring(0, 100) + '...');

    const prompt = `Create a CHALLENGING 10-question MCQ test for this candidate:

PROFILE: ${resumeSummary}
SKILLS: ${skillsText}

Requirements:
- 3 easy, 4 medium, 3 hard questions
- Test DEEP understanding with scenarios
- Relevant to their experience level
- Cover different aspects of skills

Return ONLY valid JSON:
{
  "MCQ_Test": [
    {
      "Question": "Question text",
      "Options": ["A", "B", "C", "D"],
      "Answer": "Correct option text",
      "Difficulty": "easy|medium|hard",
      "Skill": "Skill name"
    }
  ],
  "TestDuration": 1800,
  "TotalQuestions": 10
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks.`;

    try {
      console.log('🤖 Sending to Gemini for test generation...');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      const cleanedText = cleanJsonResponse(responseText);
      const parsedResponse = JSON.parse(cleanedText);
      
      if (!parsedResponse.MCQ_Test || !Array.isArray(parsedResponse.MCQ_Test)) {
        throw new Error('Invalid test format from AI');
      }

      console.log('✅ Generated via AI:', parsedResponse.MCQ_Test.length, 'questions');
      return res.status(200).json(parsedResponse);

    } catch (aiError) {
      console.warn('⚠️ Gemini API error (quota or failure), using fallback test:', aiError.message);
      
      const fallbackResponse = {
        "MCQ_Test": FALLBACK_TESTS.default,
        "TestDuration": 1800,
        "TotalQuestions": 10,
        "isFallback": true
      };

      return res.status(200).json(fallbackResponse);
    }

  } catch (error) {
    console.error('❌ Critical Test generation error:', error.message);
    return res.status(500).json(
      new ApiResponse(false, 500, null, 'Failed to process test request: ' + error.message)
    );
  }
});

// Evaluate test results
router.post('/check_test', async (req, res) => {
  try {
    const { answers, profile_summary, timeSpent = 0, violations = 0 } = req.body;

    if (!answers || !profile_summary) {
      return res.status(400).json(
        new ApiResponse(false, 400, null, 'Test data required')
      );
    }

    console.log('🔍 Evaluating:', answers.length, 'answers, violations:', violations);

    const answersText = answers.map((ans, idx) => 
      `Q${idx + 1}: ${ans.question}\nSelected: ${ans.selected}\nCorrect: ${ans.correct}`
    ).join('\n\n');

    const correctCount = answers.filter(a => a.selected === a.correct).length;
    const rawScore = Math.round((correctCount / answers.length) * 100);

    const prompt = `You are an expert evaluator. Analyze these test answers and generate a personalized assessment.

CANDIDATE PROFILE: ${profile_summary}

TEST ANSWERS (${answers.length} total):
${answersText}

CORRECT ANSWERS: ${correctCount} out of ${answers.length}
TIME SPENT: ${Math.floor(timeSpent / 60)} minutes
INTEGRITY VIOLATIONS: ${violations}

Generate a response where:
- Score must be exactly ${rawScore}
- Write specific, personalized 3-4 sentence feedback mentioning the candidate's actual skills
- List 2-3 genuine specific strengths observed from correct answers
- List 2-3 real specific weak areas based on wrong answers
- Recommend a SPECIFIC career path (e.g., "Full Stack Developer", "Data Scientist", "DevOps Engineer")
- Recommend 3 REAL, SPECIFIC courses with actual names and platforms. Examples of good course names:
  * "The Complete JavaScript Course - Jonas Schmedtmann (Udemy)"
  * "CS50: Introduction to Computer Science - Harvard (edX)"
  * "Python for Data Science and Machine Learning Bootcamp (Udemy)"
  * "AWS Certified Developer Associate Course (A Cloud Guru)"
  * "The Web Developer Bootcamp by Colt Steele (Udemy)"
  Use courses relevant to the candidate's skills and weak areas.

Return ONLY valid JSON with no extra text:
{
  "Score": ${rawScore},
  "CorrectAnswers": ${correctCount},
  "TotalQuestions": ${answers.length},
  "Feedback": "<specific personalized feedback referencing their actual tech stack>",
  "Strengths": ["<specific strength based on correct answers>", "<specific strength 2>"],
  "WeakAreas": ["<specific weak area from wrong answers>", "<specific weak area 2>"],
  "Recommended Career Path": "<specific career title relevant to their profile>",
  "Recommended Courses": ["<Real Course Name - Platform>", "<Real Course Name - Platform>", "<Real Course Name - Platform>"],
  "IntegrityScore": ${violations > 3 ? 50 : violations > 0 ? 75 : 100}
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks.`;

    try {
      console.log('🤖 Sending to Gemini for test evaluation...');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      const cleanedText = cleanJsonResponse(responseText);
      const parsedResponse = JSON.parse(cleanedText);
      console.log('✅ Score:', parsedResponse.Score + '%');
      return res.status(200).json(parsedResponse);

    } catch (aiError) {
      console.warn('⚠️ Gemini evaluation failed, using basic calculated results:', aiError.message);
      
      return res.status(200).json({
        "Score": rawScore,
        "CorrectAnswers": correctCount,
        "TotalQuestions": answers.length,
        "Feedback": `You scored ${rawScore}% on the assessment. You showed good understanding of some concepts but have room for improvement in others. Focus on practical implementation of your core skills.`,
        "Strengths": ["Core concept knowledge", "Attention to detail"],
        "WeakAreas": ["Advanced scenarios", "Optimization techniques"],
        "Recommended Career Path": "Software Engineer",
        "Recommended Courses": ["Full Stack Web Development (Coursera)", "Data Structures and Algorithms (Udemy)", "System Design Fundamentals (YouTube)"],
        "IntegrityScore": violations > 3 ? 50 : violations > 0 ? 75 : 100,
        "isFallback": true
      });
    }

  } catch (error) {
    console.error('❌ Critical Evaluation error:', error.message);
    return res.status(500).json(
      new ApiResponse(false, 500, null, 'Failed to process evaluation request: ' + error.message)
    );
  }
});

export default router;

