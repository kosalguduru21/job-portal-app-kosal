import exp from "express";
import { JobModel } from "../models/JobModel.js";
import { ApplicationModel } from "../models/ApplicationModel.js";
import { verifyToken } from "../middlewares/tokenVerificationMiddleware.js";
import { allowedRoles } from "../middlewares/allowedRolesMiddleware.js";
export const employerRoute = exp.Router();

//Create a new job posting
employerRoute.post("/jobs", verifyToken, allowedRoles("EMPLOYER"), async (req, res) => {
  //get job details from client
  let newJob = req.body;
  //attach logged in employer as owner of the job
  newJob.employer = req.user.id;
  //save in db
  let jobDocument = await JobModel.create(newJob);
  //send res
  res.status(201).json({ success: true, message: "Job posting created", data: jobDocument });
});

//View own job postings
employerRoute.get("/jobs", verifyToken, allowedRoles("EMPLOYER"), async (req, res) => {
  //id of logged in employer
  let currentUserId = req.user.id;
  //find jobs posted by this employer
  let jobs = await JobModel.find({ employer: currentUserId });
  res.status(200).json({ success: true, message: "list of jobs", data: jobs });
});

//View a single own job posting
employerRoute.get("/jobs/:id", verifyToken, allowedRoles("EMPLOYER"), async (req, res) => {
  //get job object id from url param
  let objectIdOfUrl = req.params.id;
  //id of logged in employer
  let currentUserId = req.user.id;
  //find job by id
  let job = await JobModel.findById(objectIdOfUrl);
  //if job not found
  if (job === null) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }
  //make sure this job belongs to the logged in employer
  if (job.employer.toString() !== currentUserId) {
    return res.status(401).json({ success: false, message: "You are not allowed to access other's job posting" });
  }
  res.status(200).json({ success: true, message: "Job found", data: job });
});

//update own job posting
employerRoute.put("/jobs/:id", verifyToken, allowedRoles("EMPLOYER"), async (req, res) => {
  //get job object id from url param
  let objectIdOfUrl = req.params.id;
  //id of logged in employer
  let currentUserId = req.user.id;
  //find job by id
  let job = await JobModel.findById(objectIdOfUrl);
  //if job not found
  if (job === null) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }
  //make sure this job belongs to the logged in employer
  if (job.employer.toString() !== currentUserId) {
    return res.status(401).json({ success: false, message: "You are not allowed to modify other's job posting" });
  }
  //get modified job from client
  let modifiedJob = req.body;
  //employer should never be reassigned via this route
  delete modifiedJob.employer;
  //update
  let updatedJob = await JobModel.findByIdAndUpdate(objectIdOfUrl, { $set: modifiedJob }, { new: true, runValidators: true });
  //send res
  res.status(200).json({ success: true, message: "Job posting updated", data: updatedJob });
});

//delete own job posting
employerRoute.delete("/jobs/:id", verifyToken, allowedRoles("EMPLOYER"), async (req, res) => {
  //get job object id from url param
  let objectIdOfUrl = req.params.id;
  //id of logged in employer
  let currentUserId = req.user.id;
  //find job by id
  let job = await JobModel.findById(objectIdOfUrl);
  //if job not found
  if (job === null) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }
  //make sure this job belongs to the logged in employer
  if (job.employer.toString() !== currentUserId) {
    return res.status(401).json({ success: false, message: "You are not allowed to delete other's job posting" });
  }
  //delete job
  await JobModel.findByIdAndDelete(objectIdOfUrl);
  //delete applications tied to this job
  await ApplicationModel.deleteMany({ job: objectIdOfUrl });
  //send res
  res.status(200).json({ success: true, message: "Job posting deleted" });
});

//View applications received for one of own jobs
employerRoute.get("/jobs/:id/applications", verifyToken, allowedRoles("EMPLOYER"), async (req, res) => {
  //get job object id from url param
  let objectIdOfUrl = req.params.id;
  //id of logged in employer
  let currentUserId = req.user.id;
  //find job by id
  let job = await JobModel.findById(objectIdOfUrl);
  //if job not found
  if (job === null) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }
  //make sure this job belongs to the logged in employer
  if (job.employer.toString() !== currentUserId) {
    return res.status(401).json({ success: false, message: "You are not allowed to view other's job applications" });
  }
  //find applications for this job
  let applications = await ApplicationModel.find({ job: objectIdOfUrl }).populate(
    "applicant",
    "name email skills experience education",
  );
  res.status(200).json({ success: true, message: "list of applications", data: applications });
});

//update status of an application received for own job
employerRoute.put("/applications/:id/status", verifyToken, allowedRoles("EMPLOYER"), async (req, res) => {
  //get application object id from url param
  let objectIdOfUrl = req.params.id;
  //id of logged in employer
  let currentUserId = req.user.id;
  //find application and its related job
  let application = await ApplicationModel.findById(objectIdOfUrl).populate("job");
  //if application not found
  if (application === null) {
    return res.status(404).json({ success: false, message: "Application not found" });
  }
  //make sure the related job belongs to the logged in employer
  if (application.job.employer.toString() !== currentUserId) {
    return res.status(401).json({ success: false, message: "You are not allowed to modify other's job applications" });
  }
  //get new status from client
  let { status } = req.body;
  //update
  let updatedApplication = await ApplicationModel.findByIdAndUpdate(
    objectIdOfUrl,
    { $set: { status: status } },
    { new: true, runValidators: true },
  );
  //send res
  res.status(200).json({ success: true, message: "Application status updated", data: updatedApplication });
});
