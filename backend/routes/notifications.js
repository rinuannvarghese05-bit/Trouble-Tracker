// backend/routes/notifications.js
import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

/**
 * POST /api/notifications
 * Create a new notification
 */
router.post("/", async (req, res) => {
  try {
    const newNotif = new Notification(req.body); // req.body must include userId
    await newNotif.save();
    res.status(201).json(newNotif);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/notifications/send-multiple
 * Send notifications to multiple users
 */
router.post("/send-multiple", async (req, res) => {
  const { notification, userIds } = req.body;
  if (!notification || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: "Notification and at least one userId are required" });
  }

  try {
    const notificationsToInsert = userIds.map((id) => ({
      ...notification,
      userId: id,
    }));

    const createdNotifs = await Notification.insertMany(notificationsToInsert);
    res.status(201).json(createdNotifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications as read for a specific user
 */
router.put("/mark-all-read", async (req, res) => {
  const { userId } = req.body;
  try {
    const updated = await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.json({ message: `${updated.modifiedCount} notifications marked as read.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/notifications/:id/mark-read
 * Mark a single notification as read
 */
router.put("/:id/mark-read", async (req, res) => {
  try {
    const updatedNotif = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!updatedNotif) return res.status(404).json({ message: "Notification not found" });
    res.json(updatedNotif);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Notification.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/notifications/:userId
 * Get ALL notifications for a specific user (read and unread)
 * FIX: Convert userId string to ObjectId for correct MongoDB lookup.
 */
router.get("/:userId", async (req, res) => {
  const targetUserId = req.params.userId;
  
  try {
    // Access the ObjectId type via Mongoose
    const ObjectId = Notification.base.Types.ObjectId; 
    
    if (!ObjectId.isValid(targetUserId)) {
        return res.status(400).json({ error: "Invalid user ID format." });
    }

    const userIdAsObjectId = new ObjectId(targetUserId);

    console.log(`[Notification Debug] Querying DB with ObjectId: ${userIdAsObjectId}`);

    const notifications = await Notification.find({
      // Use the converted ObjectId in the query
      userId: userIdAsObjectId,
    }).sort({ createdAt: -1 });
    
    console.log(`[Notification Debug] SUCCESS: Fetched ${notifications.length} notifications.`);
    
    res.json(notifications);
  } catch (err) {
    console.error('[Notification Debug] ERROR during fetch:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;