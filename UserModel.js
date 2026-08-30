import { Schema, model } from "mongoose";

//embedded sub-schema for job seeker education (belongs to user, no own identity)
const educationSchema = new Schema(
  {
    degree: { type: String, trim: true },
    institution: { type: String, trim: true },
    fieldOfStudy: { type: String, trim: true },
    startYear: { type: Number },
    endYear: { type: Number },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minLength: [4, "Min length of name should be 4"],
      maxLength: [50, "Max length of name should not exceed 50"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: [true, "Email already existed"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [4, "Min length of password should be 4"],
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ["JOBSEEKER", "EMPLOYER", "ADMIN"],
        message: "Invalid role",
      },
    },
    active: {
      type: Boolean,
      default: true,
    },

    //---job seeker profile fields (embedded, belongs only to this user)---
    skills: {
      type: [String],
    },
    experience: {
      type: String,
      trim: true,
    },
    education: {
      type: [educationSchema],
    },

    //---employer profile fields (embedded, belongs only to this user)---
    companyName: {
      type: String,
      trim: true,
    },
    companyDescription: {
      type: String,
      trim: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: "throw",
  },
);

//create model
export const UserModel = model("user", userSchema);
