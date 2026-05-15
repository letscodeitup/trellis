import express from "express";
import Card from "../models/Card.js";
import protect from "../middleware/auth.js";
import Activity from "../models/Activity.js";
import { requireRole } from "../middleware/rbac.js";

const router = express.Router();
router.post("/:orgId/:boardId/:columnId", protect, requireRole("member"), async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignees } = req.body;

    const lastCard = await Card.findOne({
      board: req.params.boardId,
      column: req.params.columnId,
    }).sort({ order: -1 });

    const order = lastCard ? lastCard.order + 1 : 0;

    const card = await Card.create({
      title,
      description,
      priority,
      dueDate,
      assignees,
      board: req.params.boardId,
      org: req.params.orgId,
      column: req.params.columnId,
      order,
      createdBy: req.user._id,
    });

    // Log activity
    await Activity.create({
      org: req.params.orgId,
      board: req.params.boardId,
      card: card._id,
      user: req.user._id,
      action: `created card "${card.title}"`,
    });

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Get all cards for a board
router.get("/:orgId/:boardId", protect, async (req, res) => {
  try {
    const cards = await Card.find({ board: req.params.boardId })
      .populate("assignees", "name email avatar")
      .populate("createdBy", "name email")
      .sort({ order: 1 });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single card
router.get("/:orgId/:boardId/:cardId", protect, async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId)
      .populate("assignees", "name email avatar")
      .populate("createdBy", "name email");
    if (!card) return res.status(404).json({ message: "Card not found" });
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update card
router.put("/:orgId/:boardId/:cardId", protect, requireRole("member"), async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      req.body,
      { new: true }
    ).populate("assignees", "name email avatar");
    if (!card) return res.status(404).json({ message: "Card not found" });
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete card
router.delete("/:orgId/:boardId/:cardId", protect, requireRole("admin"), async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (!card) return res.status(404).json({ message: "Card not found" });

    await Activity.create({
      org: req.params.orgId,
      board: req.params.boardId,
      card: card._id,
      user: req.user._id,
      action: `deleted card "${card.title}"`,
    });

    await Card.findByIdAndDelete(req.params.cardId);
    res.json({ message: "Card deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Move card (drag and drop)
router.put("/:orgId/:boardId/:cardId/move", protect, requireRole("member"), async (req, res) => {
  try {
    const { columnId, order } = req.body;

    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { column: columnId, order },
      { new: true }
    );

    if (!card) return res.status(404).json({ message: "Card not found" });

    // Log activity
    await Activity.create({
      org: req.params.orgId,
      board: req.params.boardId,
      card: card._id,
      user: req.user._id,
      action: `moved card "${card.title}"`,
    });

    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update checklist
router.put("/:orgId/:boardId/:cardId/checklist", protect, requireRole("member"), async (req, res) => {
  try {
    const { checklist } = req.body;
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { checklist },
      { new: true }
    );
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;