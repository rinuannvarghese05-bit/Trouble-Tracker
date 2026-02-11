import express from "express";
import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";
import ImageKit from "imagekit";
import dotenv from "dotenv";
import { sendEmail } from "../utils/sendEmail.js";

dotenv.config();

const router = express.Router();
const upload = multer(); // memory storage, not local
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ===============================
// 🔐 Authentication Middleware
// ===============================
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token, authorization denied." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.user._id;
    next();
  } catch {
    res.status(401).json({ message: "Token is not valid." });
  }
};

// ===============================
// 🛡️ Admin Middleware
// ===============================
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
  } catch {
    res.status(500).json({ message: "Server error checking admin role." });
  }
};

// ===============================
// 🌤️ ImageKit Configuration
// ===============================
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// =========================================================================
// 📤 IMAGE UPLOAD ROUTE
// =========================================================================
router.post("/upload-images", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No images uploaded." });

    const uploadedImageUrls = [];

    for (const file of req.files) {
      const result = await imagekit.upload({
        file: file.buffer.toString("base64"),
        fileName: file.originalname,
        folder: "/complaints",
      });
      uploadedImageUrls.push(result.url);
    }

    res.status(200).json({
      message: "Images uploaded successfully to ImageKit",
      imageUrls: uploadedImageUrls,
    });
  } catch (err) {
    console.error("❌ Image upload failed:", err);
    res.status(500).json({ error: "Failed to upload images" });
  }
});

// =========================================================================
// SYSTEM NOTIFICATION ROUTE (unchanged)
// =========================================================================
router.post("/notifications/send-system", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { type, title, message, recipients } = req.body;
    if (!recipients?.length) {
      return res.status(400).json({ message: "Recipient list cannot be empty." });
    }

    const notificationsToInsert = recipients.map(uid => ({
      userId: uid,
      type,
      title,
      message,
      isRead: false,
    }));

    const result = await Notification.insertMany(notificationsToInsert);
    res.status(201).json({
      message: "System notification sent successfully.",
      count: result.length,
    });
  } catch (err) {
    console.error("Error sending system notification:", err);
    res.status(500).json({ message: "Failed to send system notification." });
  }
});

// =========================================================================
// ASSIGNMENT ROUTE
// =========================================================================
router.put("/:id/assign", authMiddleware, adminMiddleware, async (req, res) => {
  // (This route is unchanged)
  try {
    const { assignee } = req.body; 

    if (!assignee) {
      return res.status(400).json({ message: "Assignee ID is required." });
    }
    
    if (!mongoose.Types.ObjectId.isValid(assignee)) {
        return res.status(400).json({ message: "Invalid format for assignee ID." });
    }

    const assignedUser = await User.findById(assignee);
    if (!assignedUser) {
        return res.status(404).json({ message: "Assigned user not found." });
    }
    if (assignedUser.role !== 'admin') {
        return res.status(400).json({ message: "Cannot assign to a non-admin user." });
    }
    
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedTo: assignee, status: 'in-progress' }, 
      { new: true }
    );

    if (!updatedComplaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }
    
    const assignerUser = await User.findById(req.userId);
    const submitterId = updatedComplaint.submittedBy.toString();
    const adminUsers = await User.find({ role: 'admin' });
    const adminIds = adminUsers.map(user => user._id.toString());
    
    const uniqueRecipients = new Set([
        submitterId, 
        assignee, 
        req.userId, 
        ...adminIds 
    ]);
    
    const assignerName = assignerUser?.name || "Admin";
    const assignedName = assignedUser?.name || "Staff"; 

    const notificationsToInsert = Array.from(uniqueRecipients).map(uid => {
        let title = "Complaint Assigned";
        let message;

        if (uid === submitterId) {
            message = `Your complaint "${updatedComplaint.title}" has been assigned to ${assignedName} and is now 'In Progress'.`;
        } else if (uid === assignee) {
            title = "New Assignment Received";
            message = `You have been assigned complaint "${updatedComplaint.title}" by ${assignerName}. Status set to 'In Progress'.`;
        } else {
            title = "Assignment Logged";
            message = `${assignerName} successfully assigned complaint "${updatedComplaint.title}" to ${assignedName}.`;
        }
        
        return {
            userId: uid,
            type: 'warning',
            title: title,
            message: message,
            isRead: false,
        };
    });

    await Notification.insertMany(notificationsToInsert);
    console.log(`[Assignment] Complaint ${updatedComplaint._id} assigned to ${assignee}.`);

    res.json(updatedComplaint);
  } catch (err) {
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ message: "Invalid format for complaint ID in URL." });
    }
    console.error('Error assigning staff:', err);
    res.status(500).json({ message: "Server error during assignment." });
  }
});

// =========================================================================
// GET ALL COMPLAINTS
// =========================================================================
router.get("/", async (req, res) => {
  // (This route is unchanged)
  try {
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================================================================
// GET COMPLAINT BY ID
// =========================================================================
router.get("/:id", async (req, res) => {
  // (This route is unchanged)
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================================================================
// CREATE NEW COMPLAINT (Student) - 🚀 FIX: Corrected daily limit & duplicate check
// =========================================================================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const studentId = req.userId; // Get student ID from auth middleware
    const { title, description, domain, images } = req.body;

    // ⭐ FIX 1: Use UTC Time for accurate Mongoose/MongoDB comparison
    const dailyLimit = 5;
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0); // Start of today in UTC
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); 
    sevenDaysAgo.setUTCHours(0, 0, 0, 0); // Start of 7 days ago in UTC

    // --- 1. Daily Limit Logic (Keep max 5 complaints a day) ---
    const complaintsToday = await Complaint.countDocuments({
      submittedBy: studentId,
      // 🚀 FIX 2: Use 'submittedAt' to match your Complaint Model schema
      submittedAt: { $gte: startOfToday } 
    });

    if (complaintsToday >= dailyLimit) {
      return res.status(429).json({ // 429 Too Many Requests
        message: `You have reached your daily limit of ${dailyLimit} complaints. Please try again tomorrow.` 
      });
    }
    // --- End of Limit Logic ---

    // --- 2. Duplicate Check Logic ---
    // Check against complaints submitted by the same user in the last 7 days
    
    const recentComplaints = await Complaint.find({
      submittedBy: studentId,
      // 🚀 FIX 2: Use 'submittedAt' to match your Complaint Model schema
      submittedAt: { $gte: sevenDaysAgo }
    }).select('title description domain');

    const newTitle = title.trim().toLowerCase();
    const newDescription = description.trim().toLowerCase();

    const isDuplicate = recentComplaints.some(existingComplaint => {
      const existingTitle = existingComplaint.title.trim().toLowerCase();
      const existingDescription = existingComplaint.description.trim().toLowerCase();

      // Check for a near-exact match on title, description, AND domain
      const exactMatch = existingTitle === newTitle &&
                         existingDescription === newDescription &&
                         existingComplaint.domain === domain;
                         
      // Check for high similarity: same domain AND (new title is part of an old title OR vice versa)
      const similarTitleAndDomain = existingComplaint.domain === domain && (
          existingTitle.includes(newTitle) || newTitle.includes(existingTitle) 
      );

      return exactMatch || similarTitleAndDomain;
    });

    if (isDuplicate) {
      return res.status(409).json({ // 409 Conflict
        message: "A very similar complaint has already been submitted by you recently under this domain. Please check your submitted complaints." 
      });
    }
    // --- End of Duplicate Check Logic ---

    // --- 3. Create and Save Complaint ---
    const complaint = new Complaint({
      title,
      description,
      domain,
      images,
      submittedBy: studentId,
      status: "pending",
      votes: 0,
      votedBy: [], 
    });
    
    const newComplaint = await complaint.save();
    const complaintIDShort = newComplaint._id.toString().slice(-6);

    // --- 4. Send Email & In-App Notification ---
    
    // 🚀 Look up the student's details from the database
    const student = await User.findById(studentId);

    // Now we use `student.email` and `student.name` which we know are correct
    if (student?.email) {
      // 📧 Send Email
      const emailSubject = `Complaint Received: #${complaintIDShort}`;
      const emailMessage = `
        Hi ${student.name || 'Student'},
        
        We have successfully received your complaint "${newComplaint.title}".
        Your complaint ID is: ${newComplaint._id}
        
        An admin will review it shortly.
        - Hostel Management
      `;
      
      // Use the correct variable `student.email`
      sendEmail(student.email, emailSubject, emailMessage).catch(err => {
        console.error(`[Email Error] Failed to send submission email to ${student.email}:`, err);
      });
    }

    // 🔔 Create In-App Notification
    await Notification.create({
      userId: studentId,
      type: "success",
      title: `Complaint Submitted: #${complaintIDShort}`,
      message: `Your complaint for "${newComplaint.title}" was successfully submitted.`
    });

    // --- 4. Send Response ---
    res.status(201).json(newComplaint);

  } catch (err) {
    console.error("Error creating complaint:", err);
    res.status(400).json({ message: err.message });
  }
});

// =========================================================================
// UPDATE COMPLAINT (General)
// =========================================================================
router.put("/:id", authMiddleware, async (req, res) => {
  // (This route is unchanged)
  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedComplaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// =========================================================================
// UPDATE COMPLAINT STATUS (Admin)
// =========================================================================
router.put("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  // (This route is unchanged and was already working)
  try {
    const { status } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      // Typo fix: was 4404
      return res.status(404).json({ message: "Complaint not found" });
    }

    const submitterId = complaint.submittedBy.toString();
    const adminUsers = await User.find({ role: 'admin' });
    const adminIds = adminUsers.map(user => user._id.toString());
    const uniqueRecipients = new Set([submitterId, ...adminIds]);

    const updatedComplaint = await Complaint.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    );

    const performingAdmin = await User.findById(req.userId);
    const adminName = performingAdmin?.name || "An Administrator";
    const complaintIDShort = updatedComplaint._id.toString().slice(-6);

    // --- Create In-App Notifications ---
    const notificationsToInsert = Array.from(uniqueRecipients).map(uid => {
        let title = `Status Updated: #${complaintIDShort}`;
        let message;
        let type = 'info';

        if (uid === submitterId) {
            message = `Your complaint "${updatedComplaint.title}" has been updated to **${status}** by ${adminName}.`;
            type = 'success';
        } else {
            message = `${adminName} updated complaint "${updatedComplaint.title}" to **${status}**.`;
            type = 'info';
        }
        
        return {
            userId: uid,
            type: type,
            title: title,
            message: message,
            isRead: false,
        };
    });
    await Notification.insertMany(notificationsToInsert);

    // --- Send Email to Student ---
    const student = await User.findById(submitterId);
    if (student?.email) {
      const emailSubject = `Your Complaint Status: ${status.toUpperCase()} (#${complaintIDShort})`;
      const emailMessage = `
        Hello ${student.name},
        
        Your complaint "${updatedComplaint.title}" has been marked as "${status}" by ${adminName}.
        
        Thank you,
        Hostel Management System
      `;

      sendEmail(student.email, emailSubject, emailMessage).catch(err => {
        console.error(`[Email Error] Failed to send status update email to ${student.email}:`, err);
      });
    }

    res.json(updatedComplaint);
  } catch (err) {
    console.error('Error updating complaint status:', err);
    res.status(500).json({ message: err.message });
  }
});

// =========================================================================
// VOTE ROUTE (Student)
// =========================================================================
router.patch("/:id/vote", authMiddleware, async (req, res) => {
  // (This route is unchanged)
  try {
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid format for complaint ID." });
    }

    const votingUser = await User.findById(userId);
    if (!votingUser || votingUser.role !== "student") {
        return res.status(403).json({ message: "Access denied. Only students may vote." });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    
    const hasVoted = (complaint.votedBy || []).includes(userId);

    if (hasVoted) {
      complaint.votes = (complaint.votes || 1) - 1;
      complaint.votedBy = complaint.votedBy.filter(id => id.toString() !== userId.toString());
    } else {
      complaint.votes = (complaint.votes || 0) + 1;
      complaint.votedBy = [...(complaint.votedBy || []), userId];
    }

    const updatedComplaint = await complaint.save();
    res.json(updatedComplaint);
  } catch (err)
  {
    console.error('Error during vote operation:', err);
    // Typo fix: was 5OS00
    res.status(500).json({ message: "Server error during vote operation." });
  }
});

// =========================================================================
// DELETE COMPLAINT (Admin)
// =========================================================================
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  // (This route is unchanged)
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;