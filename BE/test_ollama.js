import axios from 'axios';
const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "qwen2.5:14b";

const prompt = `Create a CHALLENGING 10-question MCQ test for this candidate:
PROFILE: Full Stack Developer
SKILLS: React, Node.js, Express, MongoDB
Requirements: 3 easy, 4 medium, 3 hard questions
Return ONLY valid JSON:
{
  "MCQ_Test": [ ... ]
}`;

async function run() {
  console.time("Ollama Generation");
  try {
    const result = await axios.post(OLLAMA_URL, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      format: "json"
    });
    console.timeEnd("Ollama Generation");
    console.log("Success!");
  } catch (err) {
    console.error(err.message);
  }
}
run();
