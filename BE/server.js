import "dotenv/config";
import { Buffer } from "buffer";

// Polyfill SlowBuffer for older packages that expect it (Node v25 removed SlowBuffer)
if (!Buffer.SlowBuffer) {
  Buffer.SlowBuffer = Buffer;
}

import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

// Route modules are imported dynamically after the polyfill to avoid
// loading dependencies (like `jwa`) that access `SlowBuffer` during
// module initialization.
const { default: userRouter } = await import("./routes/userRoutes.js");
const { default: jobrouter } = await import("./routes/jobroutes.js");
const { default: testRouter } = await import("./routes/testRoutes.js");
const { default: careerRouter } = await import("./routes/careerRoutes.js");
const { default: resumeRoutes } = await import("./routes/resumeRoutes.js");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
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
