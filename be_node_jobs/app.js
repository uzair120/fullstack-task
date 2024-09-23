// require("dotenv").config();
import express from "express";
import "dotenv/config";
import jobController from "./src/controllers/job.controller.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/jobs", jobController.createJob);
app.get("/jobs", jobController.getAllJobs);
app.get("/jobs/:id", jobController.getJobById);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
