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



    const prompt = `Evaluate this test:

PROFILE: ${profile_summary}
RESULTS: ${answersText}
TIME SPENT: ${Math.floor(timeSpent / 60)} minutes
VIOLATIONS: ${violations}

Return ONLY valid JSON:
{
  "Score": 85,
  "CorrectAnswers": 8,
  "TotalQuestions": 10,
  "Feedback": "3-4 sentence performance feedback",
  "Strengths": ["Strength 1", "Strength 2"],
  "WeakAreas": ["Area 1", "Area 2"],
  "Recommended Career Path": "Career recommendation",
  "Recommended Courses": ["Course 1", "Course 2", "Course 3"],
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
