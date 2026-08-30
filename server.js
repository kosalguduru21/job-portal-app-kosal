import exp from "express";
import { connect } from "mongoose";
import { authRoute } from "./APIs/authAPI.js";
import { jobSeekerRoute } from "./APIs/jobSeekerAPI.js";
import { employerRoute } from "./APIs/employerAPI.js";
import { adminRouter } from "./APIs/adminAPI.js";
import cookieParser from "cookie-parser";

const app = exp();

//body parser
app.use(exp.json());
//cokie parser middleware
app.use(cookieParser())

// DB config
async function connectDB() {
  try {
    await connect("mongodb://localhost:27017/jobportaldb");
    console.log("DB connected");
    app.listen(4000, () => console.log("server listening on port 4000..."));
  } catch (err) {
    console.log("Err id DB connection:", err);
  }
}

connectDB();

app.use("/auth-api", authRoute);
app.use("/jobseeker-api", jobSeekerRoute);
app.use("/employer-api", employerRoute);
app.use("/admin-api", adminRouter);

//Error handling middleware
app.use((err, req, res, next) => {
  console.log("Err is ", err);
  res.json({ success: false, err: err.message });
});
