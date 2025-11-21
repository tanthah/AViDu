import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    avatar: { type: String, default: "" },
    dateOfBirth: Date,
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    role: { type: String, default: "user" }, // admin, user
    resetPasswordOtp: String,
    resetPasswordOtpExpires: Date
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);