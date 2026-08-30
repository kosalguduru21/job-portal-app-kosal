import { Schema, model } from "mongoose";

const applicationSchema = new Schema(
  {
    //reference, job has its own identity/lifecycle, queried independently
    job: {
      type: Schema.Types.ObjectId,
      ref: "job",
      required: true,
    },
    //reference, applicant is a User with its own identity/lifecycle
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    //embedded fields, belong only to this application
    coverLetter: {
      type: String,
      trim: true,
      maxLength: [3000, "Max length of cover letter should not exceed 3000"],
    },
    status: {
      type: String,
      enum: {
        values: ["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "REJECTED", "ACCEPTED"],
        message: "Invalid application status",
      },
      default: "APPLIED",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: "throw",
  },
);

//a job seeker cannot apply for the same job more than once
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

//create model
export const ApplicationModel = model("application", applicationSchema);
