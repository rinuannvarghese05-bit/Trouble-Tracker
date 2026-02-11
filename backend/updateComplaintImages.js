import mongoose from 'mongoose';
import Complaint from './models/Complaint.js';

// MongoDB connection string (KEEP THIS AS IS)
const MONGO_URI = "mongodb+srv://himaprasobh2005:12345@troubletrackers.vggtvds.mongodb.net/?retryWrites=true&w=majority&appName=TroubleTrackers";

// The single ImageKit URL to be applied to all complaints
const IMAGEKIT_URL = "https://ik.imagekit.io/uvzn5qbpl/shivansh-singh-yZis-ijimJA-unsplash.jpg?updatedAt=1761099380843";

// ⚠️ IMPORTANT: Replace these with the actual MongoDB _id values of the broken complaints.
const updates = {
  // Replace this placeholder ID with the actual ID for the "Water Leakage" complaint
  "YOUR_WATER_LEAKAGE_ID": [IMAGEKIT_URL], 
  
  // Replace this placeholder ID with the actual ID for the "asdfghjk" complaint
  "YOUR_ASDFGHJK_ID": [IMAGEKIT_URL],
  
  // Add any other broken complaints here using their actual MongoDB IDs:
  // "ANOTHER_BROKEN_COMPLAINT_ID": [IMAGEKIT_URL],
};

async function updateComplaintImages() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    for (const [complaintId, imageUrls] of Object.entries(updates)) {
      const complaint = await Complaint.findById(complaintId);
      if (!complaint) {
        console.log(`Complaint not found: ${complaintId}`);
        continue;
      }

      // This line permanently updates the 'images' array in the database
      complaint.images = imageUrls;
      await complaint.save();
      console.log(`Updated complaint ${complaintId} with new ImageKit URL.`);
    }

    console.log("✅ All specified complaint images updated successfully.");
    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error updating complaint images:", error);
    mongoose.disconnect();
  }
}

updateComplaintImages();