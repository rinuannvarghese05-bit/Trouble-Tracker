import express from "express";
// Assuming User model has a property like 'isActive' or 'status'
import User from "../models/User.js"; 

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    // 500 Internal Server Error
    res.status(500).json({ message: err.message });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new user
router.post("/", async (req, res) => {
  // NOTE: You should add validation and password hashing here (e.g., using bcrypt)
  const user = new User(req.body); 
  try {
    const newUser = await user.save();
    // 201 Created
    res.status(201).json(newUser);
  } catch (err) {
    // 400 Bad Request for validation errors
    res.status(400).json({ message: err.message });
  }
});

/** * PATCH /:id: Update user (partial update). 
 * Changed from PUT to PATCH for semantically correct partial updates.
 */
router.patch("/:id", async (req, res) => {
  try {
    // Options: { new: true } returns the updated document
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { 
        new: true, 
        runValidators: true // Ensure model validations run on update
    });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * PATCH /:id/toggle-status: Toggle a specific user's status (e.g., active/inactive/banned).
 * This supports the new updateStatus function in the UserService.
 */
router.patch("/:id/toggle-status", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Assuming the User model has an 'isActive' boolean field
    // Toggle the status
    user.isActive = !user.isActive; 
    
    // Save the change
    await user.save();
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
