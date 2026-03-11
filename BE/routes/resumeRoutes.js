import { Router } from "express";
import multer from "multer";
import axios from "axios";
import os from "os";
const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "llama3.2";
const MAX_THREADS = os.cpus().length;
import { ApiResponse } from "../utils/ApiResponse.js";

// Import pdf-parse correctly
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const router = Router();

// Configure multer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});



router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    console.log('📄 Resume upload received');
    
    if (!req.file) {
      return res.status(400).json(
        new ApiResponse(false, 400, null, 'No file uploaded.')
      );
    }

    console.log('📤 File received:', req.file.originalname);
    console.log('📦 File size:', req.file.size, 'bytes');

    // Parse PDF
    const pdfBuffer = req.file.buffer;
    const pdfData = await pdfParse(pdfBuffer);
    const resumeText = pdfData.text;

    console.log('✅ PDF parsed, text length:', resumeText.length, 'characters');

    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }



    const prompt = `You are a professional resume analyzer. Extract skills and generate a concise professional summary from this resume text.

Resume Text:
${resumeText}

IMPORTANT: Return ONLY valid JSON. No markdown, no code blocks, no explanation. Just raw JSON in this exact format:
{
  "profile_summary": "A concise 2-3 sentence professional summary",
  "skills": ["skill1", "skill2", "skill3"]
}

Extract 10-20 relevant technical and professional skills.`;

    console.log('🤖 Sending to Ollama AI for analysis...');

    const result = await axios.post(OLLAMA_URL, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      format: "json",
      options: {
        num_thread: MAX_THREADS
      }
    });
    let responseText = result.data.response;
    
    console.log('📝 Raw AI response:', responseText.substring(0, 200) + '...');
    
    // ✅ IMPROVED: More aggressive cleanup
    // Remove markdown code blocks
    responseText = responseText.replace(/```\s*/g, '');
    
    // Remove any standalone "json" text at the beginning
    responseText = responseText.replace(/^\s*json\s*/i, '');
    
    // Remove all backticks
    responseText = responseText.replace(/`/g, '');
    
    // Trim whitespace
    responseText = responseText.trim();
    
    // Find first { and last } to extract just the JSON object
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      responseText = responseText.substring(firstBrace, lastBrace + 1);
    }

    console.log('🧹 Cleaned response:', responseText.substring(0, 200) + '...');

    // Parse JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('❌ JSON Parse Error:', jsonError.message);
      console.error('❌ Response text:', responseText);
      throw new Error('AI returned invalid JSON format');
    }

    // Validate response structure
    if (!parsedResponse.profile_summary || !Array.isArray(parsedResponse.skills)) {
      throw new Error('AI response missing required fields');
    }

    console.log('✅ Successfully extracted:');
    console.log('   - Summary:', parsedResponse.profile_summary.substring(0, 50) + '...');
    console.log('   - Skills count:', parsedResponse.skills.length);

    // Return response
    return res.status(200).json(
      new ApiResponse(
        true, 
        200, 
        {
          summary: parsedResponse.profile_summary,
          skills: parsedResponse.skills
        },
        'Resume parsed successfully'
      )
    );

  } catch (error) {
    console.error('❌ Resume parsing error:', error);
    console.error('Error message:', error.message);
    
    return res.status(500).json(
      new ApiResponse(
        false, 
        500, 
        null, 
        error.message || 'Failed to process resume'
      )
    );
  }
});

export default router;
