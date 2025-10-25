import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
// import User from "../models/User.js";
import getUserById from "../utils/getUserById.js";

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateSearchQuery(userSkills, userSummary) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const generationConfig = {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 1024,
  };

  try {
    const prompt = `Act as a career advisor AI. Using the following information about a user:
      Skills: ${userSkills.join(", ")}
      Summary: ${userSummary}
  
      Generate exactly 3 specific YouTube search queries that would help enhance their career.
      Return ONLY a JSON array of strings. Example format: ["query1", "query2", "query3"]
      Make queries specific and detailed.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();

    try {
      const queries = JSON.parse(response);
      if (!Array.isArray(queries) || queries.length !== 3) {
        throw new Error("Invalid response format");
      }
      return queries;
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError);
      // Fallback queries based on user skills
      return [
        `${userSkills[0]} advanced tutorial 2024`,
        `${userSkills[1]} complete course`,
        `${userSkills[2]} masterclass`,
      ];
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate course recommendations");
  }
}

// Fetch YouTube courses
async function getYouTubeCourses(searchQuery) {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=3&key=${API_KEY}`;
  const response = await axios.get(url);
  return response.data.items;
}
const user = {
  _id: "mock123",
  name: "John Doe",
  email: "john@example.com",
  skills: ["JavaScript", "React", "Node.js", "MongoDB"],
  summary:
    "Full stack developer with 3 years of experience in web development. Passionate about building scalable applications and learning new technologies.",
};

router.get("/get-videos", async (req, res) => {
  try {
    const { userId } = req.query;
    console.log("userId", userId);

    const dbUser =await getUserById(userId);

    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Transform Prisma user to match mock structure
    const user = {
      _id: dbUser.id.toString(),
      name: dbUser.name || "Anonymous",
      email: dbUser.email,
      skills: ["JavaScript", "Web Development"], // Default skills since not in schema
      summary: "Aspiring developer looking to enhance skills", // Default summary
    };

    // Generate search queries based on user profile
    const searchQueries = await generateSearchQuery(user.skills, user.summary);

    // Fetch courses for each query
    const coursesPromises = searchQueries.map((query) =>
      getYouTubeCourses(query)
    );
    const courseResults = await Promise.all(coursesPromises);

    // Combine and format results
    const recommendedCourses = courseResults.flat().map((course) => ({
      title: course.snippet.title,
      description: course.snippet.description,
      thumbnailUrl: course.snippet.thumbnails.medium.url,
      videoId: course.id.videoId,
      url: `https://www.youtube.com/watch?v=${course.id.videoId}`,
    }));

    res.json({
      user: {
        name: user.name,
        email: user.email,
        skills: user.skills,
        summary: user.summary,
      },
      recommendedCourses,
    });
  } catch (error) {
    console.error("Career route error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
