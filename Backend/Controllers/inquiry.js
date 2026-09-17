import Inquiry from "../Models/Inquiry.js";

export const createInquiry = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const inquiry = await Inquiry.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      inquiry,
    });
  } catch (error) {
    console.error("Create inquiry error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit inquiry",
    });
  }
};

export const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      inquiries,
    });
  } catch (error) {
    console.error("Get inquiries error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inquiries",
    });
  }
};

export const resolveInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      {
        status: "resolved",
      },
      {
        new: true,
      },
    );

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Inquiry resolved successfully",
      inquiry,
    });
  } catch (error) {
    console.error("Resolve inquiry error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to resolve inquiry",
    });
  }
};