import { Router } from "express";
import axios from "axios";
import os from "os";
const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "llama3.2";
const MAX_THREADS = os.cpus().length;
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();


// Helper function to clean AI response
function cleanAIResponse(responseText) {
  console.log('📝 Raw response length:', responseText.length);
  console.log('📝 First 200 chars:', responseText.substring(0, 200));
  
  // Try to extract JSON from markdown code blocks
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (jsonMatch) {
    responseText = jsonMatch[1].trim();
    console.log('✂️ Extracted from code blocks');
  } else {
    // Clean markdown markers
    responseText = responseText
      .replace(/^\s*```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/g, '')
      .replace(/^\s*json\s*/i, '')
      .trim();
    console.log('🧹 Cleaned markers');
  }
  
  console.log('✅ Final cleaned (first 200 chars):', responseText.substring(0, 200));
  return responseText;
}

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
}`;

    console.log('🤖 Sending to Ollama for test generation...');
    const result = await axios.post(OLLAMA_URL, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      format: "json",
      options: {
        num_thread: MAX_THREADS
      }
    });
    
    const responseText = cleanAIResponse(result.data.response);

    const parsedResponse = JSON.parse(responseText);
    
    if (!parsedResponse.MCQ_Test || !Array.isArray(parsedResponse.MCQ_Test)) {
      throw new Error('Invalid test format');
    }

    console.log('✅ Generated', parsedResponse.MCQ_Test.length, 'questions');
    return res.status(200).json(parsedResponse);

  } catch (error) {
    console.error('❌ Test generation error:', error.message);
    return res.status(500).json(
      new ApiResponse(false, 500, null, 'Failed to generate test: ' + error.message)
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
}`;

    console.log('🤖 Sending to Ollama for test evaluation...');
    const result = await axios.post(OLLAMA_URL, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      format: "json",
      options: {
        num_thread: MAX_THREADS
      }
    });
    const responseText = cleanAIResponse(result.data.response);

    const parsedResponse = JSON.parse(responseText);
    console.log('✅ Score:', parsedResponse.Score + '%');

    return res.status(200).json(parsedResponse);

  } catch (error) {
    console.error('❌ Evaluation error:', error.message);
    return res.status(500).json(
      new ApiResponse(false, 500, null, 'Failed to evaluate test: ' + error.message)
    );
  }
});

export default router;
