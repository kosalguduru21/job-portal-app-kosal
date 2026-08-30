import { Schema, model } from "mongoose";

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxLength: [150, "Max length of title should not exceed 150"],
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    employmentType: {
      type: String,
      enum: {
        values: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"],
        message: "Invalid employment type",
      },
      required: [true, "Employment type is required"],
    },
    //embedded, belongs directly to this job posting
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "USD" },
    },
    requiredSkills: {
      type: [String],
    },
    experienceRequired: {
      type: String,
      trim: true,
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    applicationDeadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ["OPEN", "CLOSED"],
        message: "Invalid job status",
      },
      default: "OPEN",
    },
    //reference, employer has its own identity/lifecycle as a User
    employer: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: "throw",
  },
);

//create model
export const JobModel = model("job", jobSchema);
