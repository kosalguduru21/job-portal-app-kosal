import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { JobModel } from "../models/JobModel.js";
import { ApplicationModel } from "../models/ApplicationModel.js";
import { verifyToken } from "../middlewares/tokenVerificationMiddleware.js";
import { allowedRoles } from "../middlewares/allowedRolesMiddleware.js";
export const jobSeekerRoute = exp.Router();

//View own profile(protected route)
jobSeekerRoute.get("/profile", verifyToken, allowedRoles("JOBSEEKER"), async (req, res) => {
  //id of logged in user
  let currentUserId = req.user.id;
  //find user by id
  let user = await UserModel.findById(currentUserId);
  //if user not found
  if (user === null) {
    res.status(404).json({ success: false, message: "User not found" });
  } else {
    res.status(200).json({ success: true, message: "Profile found", data: user });
  }
});

//update own profile(protected route)
jobSeekerRoute.put("/profile", verifyToken, allowedRoles("JOBSEEKER"), async (req, res) => {
  //id of logged in user
  let currentUserId = req.user.id;
  //get modified fields from client
  let { name, skills, experience, education } = req.body;

  //update
  let updatedUser = await UserModel.findByIdAndUpdate(
    currentUserId,
    { $set: { name: name, skills: skills, experience: experience, education: education } },
    { new: true, runValidators: true },
  );

  //send res
  res.status(200).json({ success: true, message: "Profile updated", data: updatedUser });
});

//View all open jobs
jobSeekerRoute.get("/jobs", verifyToken, allowedRoles("JOBSEEKER"), async (req, res) => {
  //only open jobs are shown to job seekers
  let jobs = await JobModel.find({ status: "OPEN" }).populate("employer", "name companyName email");
  res.status(200).json({ success: true, message: "list of jobs", data: jobs });
});

//View a single job by id
jobSeekerRoute.get("/jobs/:id", verifyToken, allowedRoles("JOBSEEKER"), async (req, res) => {
  //get job object id from url param
  let objectIdOfUrl = req.params.id;
  //find job by id
  let job = await JobModel.findById(objectIdOfUrl).populate("employer", "name companyName email");
  //if job not found
  if (job === null) {
    res.status(404).json({ success: false, message: "Job not found" });
  } else {
    res.status(200).json({ success: true, message: "Job found", data: job });
  }
});

//Apply for a job
jobSeekerRoute.post("/jobs/:id/apply", verifyToken, allowedRoles("JOBSEEKER"), async (req, res) => {
  //id of the job from url param
  let jobId = req.params.id;
  //id of logged in job seeker
  let currentUserId = req.user.id;
  //find the job
  let job = await JobModel.findById(jobId);
  //if job not found
  if (job === null) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }
  //if job is closed
  if (job.status !== "OPEN") {
    return res.status(400).json({ success: false, message: "This job is no longer accepting applications" });
  }
  //check if already applied
  let existingApplication = await ApplicationModel.findOne({ job: jobId, applicant: currentUserId });
  if (existingApplication !== null) {
    return res.status(400).json({ success: false, message: "You have already applied for this job" });
  }
  //get cover letter from client
  let { coverLetter } = req.body;
  //create application
  let applicationDocument = await ApplicationModel.create({
    job: jobId,
    applicant: currentUserId,
    coverLetter: coverLetter,
  });
  //send res
  res.status(201).json({ success: true, message: "Application submitted", data: applicationDocument });
});

//View own submitted applications
jobSeekerRoute.get("/applications", verifyToken, allowedRoles("JOBSEEKER"), async (req, res) => {
  //id of logged in job seeker
  let currentUserId = req.user.id;
  //find applications submitted by this job seeker
  let applications = await ApplicationModel.find({ applicant: currentUserId }).populate(
    "job",
    "title companyName location employmentType status",
  );
  res.status(200).json({ success: true, message: "list of applications", data: applications });
});

//View status of a single own application
jobSeekerRoute.get("/applications/:id", verifyToken, allowedRoles("JOBSEEKER"), async (req, res) => {
  //id of logged in job seeker
  let currentUserId = req.user.id;
  //get application object id from url param
  let objectIdOfUrl = req.params.id;
  //find application by id
  let application = await ApplicationModel.findById(objectIdOfUrl).populate("job");
  //if application not found
  if (application === null) {
    return res.status(404).json({ success: false, message: "Application not found" });
  }
  //make sure this application belongs to the logged in job seeker
  if (application.applicant.toString() !== currentUserId) {
    return res.status(401).json({ success: false, message: "You are not allowed to access other's application" });
  }
  res.status(200).json({ success: true, message: "Application found", data: application });
});
