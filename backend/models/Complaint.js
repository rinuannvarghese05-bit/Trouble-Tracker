import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  images: {
    type: [String],
    default: []
  },
  status: { 
    type: String, 
    enum: ["pending", "in-progress", "resolved", "rejected"], 
    default: "pending" 
  },
  // Ensure votes defaults to 0
  votes: { 
    type: Number, 
    default: 0 
  },
  // ⭐ FIX: Add votedBy array with ObjectId references and an empty array default
  votedBy: { 
    type: [mongoose.Schema.Types.ObjectId], 
    ref: 'User',
    default: [] 
  },
  // Use ObjectId for user references
  submittedBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  domain: {
    type: String,
    required: true
  },
  // Use ObjectId for admin assignment, default to null
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
});

const Complaint = mongoose.model("Complaint", ComplaintSchema);
export default Complaint;
