import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // plain-text password for now
  role: { type: String, enum: ["student", "admin"], required: true },
  room: { type: String, default: "-" },
  category: { 
    type: String, 
    enum: ["Maintenance", "Cleanliness", "Food", "Internet", "Security", "SuperAdmin"], 
    default: null 
  },
  complaintsSubmitted: { type: Number, default: 0 },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
});

export default mongoose.model("User", UserSchema);
