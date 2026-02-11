// utils/sendEmail.js
import dotenv from "dotenv"; // 👈 Add this line
dotenv.config(); // 👈 And this line

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, text, html = null) => {
  try {
    await transporter.sendMail({
      from: `"Hostel Management" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || text,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    // This catch block will now be triggered by the one in testEmail.js
    // We should "throw" the error so the calling function knows it failed
    console.error("❌ Error from sendEmail util:", error.message);
    throw error; // 👈 Re-throw the error
  }
};