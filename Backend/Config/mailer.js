import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config/mailer.js se ek level upar Backend/.env
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

console.log("EMAIL_USER loaded:", !!process.env.EMAIL_USER);
console.log("EMAIL_PASS loaded:", !!process.env.EMAIL_PASS);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error(
    "EMAIL_USER ya EMAIL_PASS .env file me missing hai"
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOtpEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "EventX Signup OTP",
      text: `Your EventX OTP is ${otp}. This OTP is valid for 10 minutes.`,
    });

    console.log("OTP email sent successfully");
  } catch (error) {
    console.error("OTP email error:", error.message);
    throw error;
  }
};