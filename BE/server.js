import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
// * routes file
import userRouter from "./routes/userRoutes.js";
import jobrouter from "./routes/jobroutes.js"
import cors from "cors";
import testRouter from "./routes/testRoutes.js";
import careerRouter from "./routes/careerRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";  // ← ADD THIS
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req, res) => {
  return res.send("Server is alive ");
});

app.use("/api/user", userRouter);
app.use("/api/career", careerRouter);
app.use("/api/test", testRouter); 
app.use("/api/jobs", jobrouter);
app.use("/api/resume", resumeRoutes);

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
