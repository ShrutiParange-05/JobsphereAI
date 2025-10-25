    import { Router } from "express";
    import fetch from "node-fetch"; // Install with: npm install node-fetch

    const router = Router();

    router.post("job", async (req, res) => {
        try {
            const response = await fetch("https://skillassessmentapi.onrender.com/jobs?job_title=software%20engineering&location=mumbai", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(req.body),
            });

            if (!response.ok) {
                throw new Error(`FastAPI request failed: ${response.status}`);
            }

            const data = await response.json();
            res.json(data);
            console.log(data);// Send the response to the frontend
        } catch (error) {
            console.error("Error fetching jobs:", error);
            res.status(500).json({ error: "Failed to fetch jobs" });
        }
    });

    export default router;
