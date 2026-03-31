const dotenv = require("dotenv");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Gemini API Setup ─────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in .env file");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

// ─── ElevenLabs Setup ─────────────────────────────────────────────────────
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
// Switching to a more natural, empathetic voice (e.g., Jessica)
const VOICE_ID = process.env.VOICE_ID || "cgSgSAsjRGOvdWU7KnDq"; 


// Store the Gemini chat sessions for each user
const userSessions = {};

function getSystemPrompt(role) {
  return `You are an AI interviewer called Saarthi AI designed to conduct mock job interviews for candidates applying for a ${role}.  
Your job is to ask relevant, structured, and engaging questions, adapting dynamically based on the candidate's responses.  

### Interview Flow:
1. **Introduction**
   - Start the conversation warmly by introducing yourself as the interviewer.  
   - Briefly explain the interview process.  
   - Ask the candidate to introduce themselves.

2. **Technical / Behavioral Questions**  
   - Ask one question at a time, adjusting based on the candidate's previous answers.  
   - Encourage detailed responses and follow up with clarifications if needed.  
   - Ensure the conversation feels natural, with pauses for the candidate to respond.

3. **Situational & Problem-Solving Questions**  
   - Provide real-world scenarios and ask the candidate how they would handle them.  
   - Challenge them with hypothetical problems to assess their thinking.  

4. **Closing the Interview**  
   - Ask if the candidate has any questions.  
   - Thank them for their time and provide brief feedback on how they did.

### Tone & Personality:  
- Maintain a formal yet conversational tone, similar to real-world interviews.  
- Show interest in the candidate's responses, and adapt your questions accordingly.  
- If a candidate struggles, encourage them politely instead of pressuring them.
- Keep responses concise (2-4 sentences typically). Don't write essays.
- Don't use special characters, markdown, or emojis. Keep it natural speech.

### Example Opening:  
"Hello, I'm Saarthi AI, and I'll be your interviewer today. Thank you for taking the time for this mock interview. This session will include a mix of technical and behavioral questions to assess your skills for the ${role} position. Before we begin, could you introduce yourself and tell me a little about your background?"`;
}

app.get("/", (req, res) => {
  res.send("Saarthi AI Interview Server - Running with Gemini API");
});

// Reset conversation
app.post("/reset-conversation", (req, res) => {
  const { userId } = req.body;
  if (userId) {
    delete userSessions[userId];
    console.log(`✅ Conversation reset for user: ${userId}`);
    res.json({ success: true, message: `Conversation reset for user ${userId}` });
  } else {
    Object.keys(userSessions).forEach((key) => delete userSessions[key]);
    console.log("✅ All conversations reset");
    res.json({ success: true, message: "All conversations reset" });
  }
});

// Generate voice response using Gemini
app.post("/generate-voice", async (req, res) => {
  const { userId, text, role } = req.body;
  console.log(`📩 User ${userId}: "${text}"`);

  try {
    // Create or retrieve the chat session for this user
    if (!userSessions[userId]) {
      userSessions[userId] = model.startChat({
        history: [],
        systemInstruction: {
          role: "user",
          parts: [{ text: getSystemPrompt(role || "Software Engineer") }],
        },
      });
      console.log(`🆕 New chat session created for ${userId} (${role})`);
    }

    const chat = userSessions[userId];
    
    // Send message and get response
    const result = await chat.sendMessage(text);
    let aiResponse = result.response.text();
    
    // Clean the response for speech synthesis (remove special chars)
    aiResponse = aiResponse.replace(/[\*\#\`\_\~\[\]\(\)\{\}]/g, "").trim();
    
    console.log(`🤖 AI: "${aiResponse.substring(0, 100)}..."`);

    let audioBase64 = null;
    
    // Generate high-quality voice with ElevenLabs
    if (ELEVEN_LABS_API_KEY) {
      try {
        console.log("🎙️ Generating ElevenLabs audio...");
        const voiceResponse = await axios.post(
          `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
          {
            text: aiResponse,
            model_id: "eleven_flash_v2_5", // Using the latest ultra-natural model
            voice_settings: {
              stability: 0.45,
              similarity_boost: 0.8,
              style: 0.5,
              use_speaker_boost: true
            },
          },
          {
            headers: {
              "xi-api-key": ELEVEN_LABS_API_KEY,
              "Content-Type": "application/json",
            },
            responseType: "arraybuffer",
          }
        );
        
        audioBase64 = Buffer.from(voiceResponse.data).toString("base64");
        console.log("✅ Audio generated successfully");
      } catch (voiceError) {
        console.error("⚠️ ElevenLabs Error (falling back to browser TTS):", voiceError.response ? voiceError.response.status : voiceError.message);
      }
    }

    // Respond with text and optional audio
    res.json({
      audio: audioBase64,
      text: aiResponse,
      success: true,
    });
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "Error generating response",
    });
  }
});

server.listen(5001, () => {
  console.log("─────────────────────────────────────────────");
  console.log("🚀 Saarthi AI Server running on port 5001");
  console.log("🧠 Using Gemini API for interview responses");
  console.log("─────────────────────────────────────────────");
});
