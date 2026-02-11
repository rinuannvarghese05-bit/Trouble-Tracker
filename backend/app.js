// backend/app.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// --- 1. Import all your routes just once ---
import complaintRoutes from "./routes/complaints.js";
import notificationRoutes from "./routes/notifications.js";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import imageRoutes from "./routes/imageRoutes.js";
import imageUploadRoutes from './routes/imageupload.js';

dotenv.config();

const app = express();

// --- 2. Set up your middleware ---
app.use(cors());
app.use(express.json());

// --- NEW: serve uploaded images from /uploads ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Make sure this is placed before your API routes so clients can fetch image URLs.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- 3. Mount all your routes just once ---
app.use("/api/complaints", complaintRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);
app.use('/api/images', imageUploadRoutes);

// small safety: ensure MONGO_URI exists
const PORT = process.env.PORT || 5000;
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not set in environment. Exiting.");
  process.exit(1);
}

// --- 4. Connect to DB and start the server ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
