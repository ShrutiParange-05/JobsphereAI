import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate that all fields are provided
    if (
      [name, email, password].some((field) => !field || field.trim() === "")
    ) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, {}, "All fields are required"));
    }

    // Check if the user already exists
    const findUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (findUser) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            400,
            {},
            "Email already taken. Please use another email."
          )
        );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
      },
    });

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = newUser;

    return res
      .status(201)
      .json(
        new ApiResponse(
          true,
          201,
          userWithoutPassword,
          "User registered successfully"
        )
      );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate that all fields are provided
    if ([email, password].some((field) => !field || field.trim() === "")) {
      return res
        .status(400)
        .json(
          new ApiResponse(false, 400, {}, "Email and password are required")
        );
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(false, 401, {}, "Invalid email or password"));
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json(new ApiResponse(false, 401, {}, "Invalid email or password"));
    }

    // Generate JWT access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = user;

    // Set the access token as a cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true, // Ensure secure cookies
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          { user: userWithoutPassword, accessToken },
          "Login successful"
        )
      );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// update the user
export const updateUser = async (req, res) => {
  const { name, password } = req.body;

  try {
    const userId = req.user.id;

    if (!req.user) {
      return res
        .status(401)
        .json(new ApiResponse(false, 401, null, "Unauthorized request"));
    }

    const updateData = {};

    // Only add fields to updateData if they are provided
    if (name) {
      updateData.name = name;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json(
          new ApiResponse(false, 400, null, "No fields provided to update")
        );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: updateData,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(true, 200, updatedUser, "User updated successfully")
      );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, {}, "Internal Server Error"));
  }
};

// * Delete user
export const deleteUser = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!req.user) {
      return res
        .status(401)
        .json(new ApiResponse(false, 401, null, "Unauthorized request"));
    }

    // Attempt to delete the user
    await prisma.user.delete({
      where: {
        id: Number(userId),
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(true, 200, null, "User deleted successfully"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

export const logoutUser = (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res
        .status(401)
        .json(new ApiResponse(false, 401, null, "Unauthorized request"));
    }

    // Clear the cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS in production
      sameSite: "strict",
    });

    return res
      .status(200)
      .json(new ApiResponse(true, 200, null, "User logged out successfully"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, "Internal Server Error"));
  }
};

// export const storeUserSkillsAndSummary = async (req, res) => {
//   try {
//     const { userId, skills, resumeSummary } = req.body; // ← FIXED

//     console.log("📥 Received request to store skills and summary");
//     console.log("User ID:", userId);
//     console.log("Skills count:", skills?.length);

//     const userIdInt = parseInt(userId, 10);

//     if (isNaN(userIdInt)) {
//       return res
//         .status(400)
//         .json(new ApiResponse(false, 400, null, "Invalid user ID"));
//     }

//     if (!skills || !Array.isArray(skills) || skills.length === 0) {
//       return res
//         .status(400)
//         .json(new ApiResponse(false, 400, null, "Skills array is required"));
//     }

//     if (!resumeSummary || typeof resumeSummary !== "string") {
//       return res
//         .status(400)
//         .json(new ApiResponse(false, 400, null, "Resume summary is required"));
//     }

//     const user = await prisma.user.update({
//       where: { id: userIdInt },
//       data: {
//         skills: skills,
//         resumeSummary: resumeSummary,
//       },
//     });

//     console.log("✅ Skills and summary stored successfully");

//     return res
//       .status(200)
//       .json(
//         new ApiResponse(
//           true,
//           200,
//           { skills: user.skills, summary: user.resumeSummary },
//           "Skills and summary stored successfully"
//         )
//       );
//   } catch (error) {
//     console.error("❌ Error storing skills and summary:", error);
//     return res
//       .status(500)
//       .json(new ApiResponse(false, 500, null, error.message));
//   }
// };
// export const storeUserSkillsAndSummary = async (req, res) => {
//   try {
//     const { userId, skills, resumeSummary } = req.body;

//     console.log("📥 Received request to store skills and summary");
//     console.log("User ID:", userId);
//     console.log("Skills count:", skills?.length);

//     const userIdInt = parseInt(userId, 10);

//     if (isNaN(userIdInt)) {
//       return res
//         .status(400)
//         .json(new ApiResponse(false, 400, null, "Invalid user ID"));
//     }

//     if (!skills || !Array.isArray(skills) || skills.length === 0) {
//       return res
//         .status(400)
//         .json(new ApiResponse(false, 400, null, "Skills array is required"));
//     }

//     if (!resumeSummary || typeof resumeSummary !== "string") {
//       return res
//         .status(400)
//         .json(new ApiResponse(false, 400, null, "Resume summary is required"));
//     }

//     // ✅ FIX: Convert array to JSON string
//     const skillsString = JSON.stringify(skills);

//     const user = await prisma.user.update({
//       where: { id: userIdInt },
//       data: {
//         skills: skillsString,
//         resumeSummary: resumeSummary,
//       },
//     });

//     console.log("✅ Skills and summary stored successfully");

//     return res.status(200).json(
//       new ApiResponse(
//         true,
//         200,
//         {
//           skills: JSON.parse(user.skills), // ✅ Parse back to array for response
//           summary: user.resumeSummary,
//         },
//         "Skills and summary stored successfully"
//       )
//     );
//   } catch (error) {
//     console.error("❌ Error storing skills and summary:", error);
//     return res
//       .status(500)
//       .json(new ApiResponse(false, 500, null, error.message));
//   }
// };



// export const getUserSkillsAndSummary = async (req, res) => {
//   try {
//     const userId = parseInt(req.query.userId, 10);

//     if (Number.isNaN(userId)) {
//       return res.status(400).json({ error: "Invalid userId format" });
//     }

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         resumeSummary: true,
//         skills: true,
//       },
//     });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.status(200).json(user);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

// export const storeTestResults = async (req, res) => {
//   try {
//     const {
//       userId,
//       Score,
//       Feedback,
//       "Recommended Career Path": recommendedCareer,
//       "Recommended Courses": recommendedCourses,
//     } = req.body;

//     console.log("Storing test results for user:", userId);
//     console.log("Score:", Score);

//     const userIdInt = parseInt(userId, 10);

//     if (isNaN(userIdInt)) {
//       return res
//         .status(400)
//         .json(new ApiResponse(false, 400, null, "Invalid user ID"));
//     }

//     const user = await prisma.user.findUnique({
//       where: { id: userIdInt },
//     });

//     if (!user) {
//       return res
//         .status(404)
//         .json(new ApiResponse(false, 404, null, "User not found"));
//     }

//     // Handle recommended career
//     const careerString = Array.isArray(recommendedCareer)
//       ? recommendedCareer.join(", ")
//       : recommendedCareer || "Not specified";

//     // Handle recommended courses
//     const coursesString = Array.isArray(recommendedCourses)
//       ? recommendedCourses.join(", ")
//       : typeof recommendedCourses === "string"
//       ? recommendedCourses
//       : "No courses recommended";

//     // Upsert test results (create or update)
//     await prisma.testResult.upsert({
//       where: { userId: userIdInt },
//       update: {
//         score: Score,
//         feedback: Feedback,
//         recommendedCareer: careerString,
//         recommendedCourses: coursesString,
//       },
//       create: {
//         userId: userIdInt,
//         score: Score,
//         feedback: Feedback,
//         recommendedCareer: careerString,
//         recommendedCourses: coursesString,
//       },
//     });

//     console.log("✅ Test results stored successfully");

//     return res.status(200).json(
//       new ApiResponse(
//         true,
//         200,
//         {
//           Score,
//           Feedback,
//           recommendedCareer: careerString,
//           recommendedCourses: coursesString,
//         },
//         "Test results stored successfully"
//       )
//     );
//   } catch (error) {
//     console.error("Error storing test results:", error);
//     return res
//       .status(500)
//       .json(new ApiResponse(false, 500, null, error.message));
//   }
// };
// ✅ FIXED: Store test results directly in User table

// export const getUserSkillsAndSummary = async (req, res) => {
//   try {
//     const userId = parseInt(req.query.userId, 10);

//     if (Number.isNaN(userId)) {
//       return res.status(400).json({ error: "Invalid userId format" });
//     }

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         resumeSummary: true,
//         skills: true,
//       },
//     });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // ✅ Parse skills back to array
//     const skillsArray = user.skills ? JSON.parse(user.skills) : [];

//     res.status(200).json({
//       ...user,
//       skills: skillsArray, // ✅ Return as array
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };

export const storeUserSkillsAndSummary = async (req, res) => {
  try {
    const { userId, skills, resumeSummary } = req.body;

    console.log("📥 Received request to store skills and summary");
    console.log("User ID:", userId);
    console.log("Skills count:", skills?.length);

    const userIdInt = parseInt(userId, 10);

    if (isNaN(userIdInt)) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, null, "Invalid user ID"));
    }

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, null, "Skills array is required"));
    }

    if (!resumeSummary || typeof resumeSummary !== "string") {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, null, "Resume summary is required"));
    }

    // ✅ FIX: Check if user exists first
    const existingUser = await prisma.user.findUnique({
      where: { id: userIdInt },
    });

    if (!existingUser) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            false,
            404,
            null,
            `User with ID ${userIdInt} not found. Please log in again.`
          )
        );
    }

    // ✅ Now update the existing user
    const user = await prisma.user.update({
      where: { id: userIdInt },
      data: {
        skills: skills,
        resumeSummary: resumeSummary,
      },
    });

    console.log("✅ Skills and summary stored successfully");

    return res
      .status(200)
      .json(
        new ApiResponse(
          true,
          200,
          { skills: user.skills, summary: user.resumeSummary },
          "Skills and summary stored successfully"
        )
      );
  } catch (error) {
    if (error.message && error.message.includes("read-only transaction")) {
      const { userId, skills, resumeSummary } = req.body;
      const userIdInt = parseInt(userId, 10);
      
      if (!global.fallbackCache) global.fallbackCache = {};
      global.fallbackCache[userIdInt] = {
        ...(global.fallbackCache[userIdInt] || {}),
        skills,
        resumeSummary,
      };

      console.log("⚠️ DB is Read-Only. Stored skills & summary in memory fallback cache.");
      return res.status(200).json(
        new ApiResponse(
          true,
          200,
          { skills, summary: resumeSummary },
          "Skills and summary stored in fallback successfully"
        )
      );
    }
    
    console.error("❌ Error storing skills and summary:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, error.message));
  }
};



export const storeTestResults = async (req, res) => {
  try {
    const {
      userId,
      Score,
      Feedback,
      "Recommended Career Path": recommendedCareer,
      "Recommended Courses": recommendedCourses,
    } = req.body;

    console.log("📝 Storing test results for user:", userId);
    console.log("Score:", Score);

    const userIdInt = parseInt(userId, 10);

    if (isNaN(userIdInt)) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, null, "Invalid user ID"));
    }

    const user = await prisma.user.findUnique({
      where: { id: userIdInt },
    });

    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, "User not found"));
    }

    // Handle recommended career
    const careerString = Array.isArray(recommendedCareer)
      ? recommendedCareer.join(", ")
      : recommendedCareer || "Not specified";

    // Handle recommended courses
    const coursesString = Array.isArray(recommendedCourses)
      ? recommendedCourses.join(", ")
      : typeof recommendedCourses === "string"
      ? recommendedCourses
      : "No courses recommended";

    // ✅ Update User table directly (no separate TestResult table)
    const updatedUser = await prisma.user.update({
      where: { id: userIdInt },
      data: {
        testScore: Score,
        testFeedback: Feedback,
        recommendedCareer: careerString,
        recommendedCourses: coursesString,
      },
    });

    console.log("✅ Test results stored successfully in User table");

    return res.status(200).json(
      new ApiResponse(
        true,
        200,
        {
          testScore: updatedUser.testScore,
          testFeedback: updatedUser.testFeedback,
          recommendedCareer: updatedUser.recommendedCareer,
          recommendedCourses: updatedUser.recommendedCourses,
        },
        "Test results stored successfully"
      )
    );
  } catch (error) {
    if (error.message && error.message.includes("read-only transaction")) {
      const { userId, Score, Feedback, "Recommended Career Path": recommendedCareer, "Recommended Courses": recommendedCourses } = req.body;
      const userIdInt = parseInt(userId, 10);
      
      const careerString = Array.isArray(recommendedCareer) ? recommendedCareer.join(", ") : recommendedCareer || "Not specified";
      const coursesString = Array.isArray(recommendedCourses) ? recommendedCourses.join(", ") : typeof recommendedCourses === "string" ? recommendedCourses : "No courses recommended";

      // Store in fallback cache
      if (!global.fallbackCache) global.fallbackCache = {};
      global.fallbackCache[userIdInt] = {
        ...(global.fallbackCache[userIdInt] || {}),
        testScore: Score,
        testFeedback: Feedback,
        recommendedCareer: careerString,
        recommendedCourses: coursesString,
      };
      
      console.log("⚠️ DB is Read-Only. Stored test results in memory fallback cache.");
      return res.status(200).json(
        new ApiResponse(true, 200, global.fallbackCache[userIdInt], "Test results stored in fallback successfully")
      );
    }

    console.error("❌ Error storing test results:", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, error.message));
  }
};

// ✅ FIXED: Get user data (no more testResults relation)
export const getUserData = async (req, res) => {
  try {
    const { userId } = req.query;

    const userIdInt = parseInt(userId, 10);

    if (isNaN(userIdInt)) {
      return res
        .status(400)
        .json(new ApiResponse(false, 400, null, "Invalid user ID"));
    }

    // ✅ Query User table directly (no relations needed)
    const user = await prisma.user.findUnique({
      where: { id: userIdInt },
      select: {
        id: true,
        name: true,
        email: true,
        skills: true,
        resumeSummary: true,
        testScore: true,        // ✅ Direct field
        testFeedback: true,     // ✅ Direct field
        recommendedCareer: true,    // ✅ Direct field
        recommendedCourses: true,   // ✅ Direct field
      },
    });

    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(false, 404, null, "User not found"));
    }

    // Overlay memory fallback data if any exists
    if (!global.fallbackCache) global.fallbackCache = {};
    const fallbackUser = global.fallbackCache[userIdInt] || {};

    // ✅ Access fields directly from user object
    const responseData = {
      testScore: fallbackUser.testScore !== undefined ? fallbackUser.testScore : (user.testScore || null),
      testFeedback: fallbackUser.testFeedback !== undefined ? fallbackUser.testFeedback : (user.testFeedback || null),
      recommendedCareer: fallbackUser.recommendedCareer !== undefined ? fallbackUser.recommendedCareer : (user.recommendedCareer || null),
      recommendedCourses: fallbackUser.recommendedCourses !== undefined ? fallbackUser.recommendedCourses : (user.recommendedCourses || null),
    };

    console.log("📤 Sending user ", responseData);

    return res
      .status(200)
      .json(new ApiResponse(true, 200, responseData, "User data retrieved"));
  } catch (error) {
    console.error("Error fetching user ", error);
    return res
      .status(500)
      .json(new ApiResponse(false, 500, null, error.message));
  }
};


// Duplicate getUserData removed — the earlier getUserData implementation (which reads fields directly from the User table)
// is the intended one to use; keep a single export named getUserData to avoid redeclaration errors.

// Add this export to userController.js
export const getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    
    console.log("📊 Fetching user by ID:", userId);

    if (isNaN(userId)) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid userId format" 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        resumeSummary: true,
        skills: true,
        testScore: true,
        testFeedback: true,
        recommendedCareer: true,
        recommendedCourses: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    const fallbackUser = global.fallbackCache?.[userId] || {};
    const finalUser = {
      ...user,
      skills: fallbackUser.skills !== undefined ? fallbackUser.skills : user.skills,
      resumeSummary: fallbackUser.resumeSummary !== undefined ? fallbackUser.resumeSummary : user.resumeSummary,
      testScore: fallbackUser.testScore !== undefined ? fallbackUser.testScore : user.testScore,
      testFeedback: fallbackUser.testFeedback !== undefined ? fallbackUser.testFeedback : user.testFeedback,
      recommendedCareer: fallbackUser.recommendedCareer !== undefined ? fallbackUser.recommendedCareer : user.recommendedCareer,
      recommendedCourses: fallbackUser.recommendedCourses !== undefined ? fallbackUser.recommendedCourses : user.recommendedCourses,
    };

    console.log("✅ User found:", finalUser);

    res.status(200).json({
      success: true,
      data: finalUser
    });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ 
      success: false,
      error: "Something went wrong" 
    });
  }
};

export const getUserSkillsAndSummary = async (req, res) => {
  try {
    const userId = parseInt(req.query.userId, 10);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        resumeSummary: true,
        skills: true, // ✅ Already an array, no parsing needed
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const fallbackUser = global.fallbackCache?.[userId] || {};
    const finalUser = {
      ...user,
      skills: fallbackUser.skills !== undefined ? fallbackUser.skills : user.skills,
      resumeSummary: fallbackUser.resumeSummary !== undefined ? fallbackUser.resumeSummary : user.resumeSummary,
    };

    // ✅ Return as-is (already an array)
    res.status(200).json(finalUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

