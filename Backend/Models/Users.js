import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  emailAddress: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  number:{type: String, default:null},
  username: { type: String, default: "" },
  bio: { type: String, default: "" },
  language: { type: String, default: "English" },
  timezone: { type: String, default: "Asia/Kolkata" },
  role: {
  type: String,
  enum: ["user", "creator", "admin"],
  default: "user",
  default: "user"
} }
, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;