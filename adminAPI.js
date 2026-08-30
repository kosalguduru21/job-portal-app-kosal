import exp from "express";
import { UserModel } from "../models/UserModel.js";
import { JobModel } from "../models/JobModel.js";
import { ApplicationModel } from "../models/ApplicationModel.js";
import { verifyToken } from "../middlewares/tokenVerificationMiddleware.js";
import { allowedRoles } from "../middlewares/allowedRolesMiddleware.js";
export const adminRouter = exp.Router();

//View all registered users
adminRouter.get("/users", verifyToken, allowedRoles("ADMIN"), async (req, res) => {
  let users = await UserModel.find();
  res.status(200).json({ success: true, message: "list of users", data: users });
});

//View a single user by id
adminRouter.get("/users/:id", verifyToken, allowedRoles("ADMIN"), async (req, res) => {
  //get user object id from url param
  let objectIdOfUrl = req.params.id;
  //find user by id
  let user = await UserModel.findById(objectIdOfUrl);
  //if user not found
  if (user === null) {
    res.status(404).json({ success: false, message: "User not found" });
  } else {
    res.status(200).json({ success: true, message: "User found", data: user });
  }
});

//activate/deactivate a user
adminRouter.put("/users/:id/status", verifyToken, allowedRoles("ADMIN"), async (req, res) => {
  //get user object id from url param
  let objectIdOfUrl = req.params.id;
  //get active flag from client
  let { active } = req.body;
  //update
  let updatedUser = await UserModel.findByIdAndUpdate(
    objectIdOfUrl,
    { $set: { active: active } },
    { new: true, runValidators: true },
  );
  //if user not found
  if (updatedUser === null) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  //send res
  res.status(200).json({ success: true, message: "User status updated", data: updatedUser });
});

//delete a user
adminRouter.delete("/users/:id", verifyToken, allowedRoles("ADMIN"), async (req, res) => {
  //get user object id from url param
  let objectIdOfUrl = req.params.id;
  //delete user
  let deletedUser = await UserModel.findByIdAndDelete(objectIdOfUrl);
  //if user not found
  if (deletedUser === null) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  //send res
  res.status(200).json({ success: true, message: "User deleted" });
});

//View all job postings(any status)
adminRouter.get("/jobs", verifyToken, allowedRoles("ADMIN"), async (req, res) => {
  let jobs = await JobModel.find().populate("employer", "name companyName email");
  res.status(200).json({ success: true, message: "list of jobs", data: jobs });
});

//View a single job posting by id
adminRouter.get("/jobs/:id", verifyToken, allowedRoles("ADMIN"), async (req, res) => {
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

//remove an inappropriate or invalid job posting
adminRouter.delete("/jobs/:id", verifyToken, allowedRoles("ADMIN"), async (req, res) => {
  //get job object id from url param
  let objectIdOfUrl = req.params.id;
  //delete job
  let deletedJob = await JobModel.findByIdAndDelete(objectIdOfUrl);
  //if job not found
  if (deletedJob === null) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }
  //delete applications tied to this job
  await ApplicationModel.deleteMany({ job: objectIdOfUrl });
  //send res
  res.status(200).json({ success: true, message: "Job posting removed by admin" });
});
