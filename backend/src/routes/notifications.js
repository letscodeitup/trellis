import express from "express";
import Activity from "../models/Activity.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Get activity for a board
router.get("/:orgId/:boardId", protect, async (req, res) => {
  try {
    const activities = await Activity.find({
      board: req.params.boardId,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;