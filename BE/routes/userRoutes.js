import { Router } from "express";
import {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  logoutUser,
  storeUserSkillsAndSummary,
  getUserSkillsAndSummary,
  storeTestResults,
  getUserData,
  getUserById,
} from "../controllers/userController.js";

const router = Router();

// Auth routes
router.post("/register", createUser);
router.post("/login", loginUser);
router.put("/update", updateUser);
router.delete("/delete", deleteUser);
router.post("/logout", logoutUser);

// Resume/Skills routes
router.post("/storeUserSkillsAndSummary", storeUserSkillsAndSummary);
router.get("/getUserSkillsAndSummary", getUserSkillsAndSummary);

// Test results routes
router.post("/storeTestResults", storeTestResults);
router.get("/getUserData", getUserData);
router.get("/:id", getUserById);  


export default router;
