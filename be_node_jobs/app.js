// require("dotenv").config();
import express from "express";
import "dotenv/config";
import jobController from "./src/controllers/job.controller.js";
import { handlePendingJobs } from "./src/services/jobScheduler.service.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000"
  })
);
const PORT = process.env.PORT || 4000;

app.post("/jobs", jobController.createJob);
app.get("/jobs", jobController.getAllJobs);
app.get("/jobs/:id", jobController.getJobById);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    handlePendingJobs();
  });
}

export { app };
