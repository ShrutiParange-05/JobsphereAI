require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
const prompt = "Say hi";
const chat = model.startChat({
  systemInstruction: { parts: [{ text: "You are a poet" }] }
});
chat.sendMessage(prompt).then(r => console.log(r.response.text())).catch(e => console.error(e.message));
