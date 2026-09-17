import express from "express";

import {
  createInquiry,
  getInquiries,
  resolveInquiry,
} from "../Controllers/inquiry.js";

const inquiryrouter = express.Router();

// Contact page se public inquiry submit
inquiryrouter.post("/", createInquiry);

// Admin notifications ke liye inquiries
inquiryrouter.get("/", getInquiries);

// Inquiry resolve karna
inquiryrouter.patch("/:id/resolve", resolveInquiry);

export default inquiryrouter;