import express from "express";
import Board from "../models/Board.js";
import Card from "../models/Card.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// Create board
router.post("/:orgId", protect, async (req, res) => {
  try {
    const { name, description, visibility } = req.body;

    const board = await Board.create({
      name,
      description,
      visibility,
      org: req.params.orgId,
      createdBy: req.user._id,
      members: [req.user._id],
      columns: [
        { name: "To Do", order: 0 },
        { name: "In Progress", order: 1 },
        { name: "Done", order: 2 },
      ],
    });

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all boards for an org
router.get("/:orgId", protect, async (req, res) => {
  try {
    const boards = await Board.find({ org: req.params.orgId })
      .populate("createdBy", "name email")
      .populate("members", "name email avatar");
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get board by boardId only
router.get("/org/:boardId", protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId)
      .populate("members", "name email avatar")
      .populate("createdBy", "name email");

    if (!board) return res.status(404).json({ message: "Board not found" });

    const cards = await Card.find({ board: req.params.boardId })
      .populate("assignees", "name email avatar")
      .sort({ order: 1 });

    res.json({ board, cards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Delete board
router.delete("/:orgId/:boardId", protect, async (req, res) => {
  try {
    await Board.findByIdAndDelete(req.params.boardId);
    await Card.deleteMany({ board: req.params.boardId });
    res.json({ message: "Board deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add column
router.post("/:orgId/:boardId/columns", protect, async (req, res) => {
  try {
    const { name } = req.body;
    const board = await Board.findById(req.params.boardId);
    if (!board) return res.status(404).json({ message: "Board not found" });

    const order = board.columns.length;
    board.columns.push({ name, order });
    await board.save();

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete column
router.delete("/:orgId/:boardId/columns/:columnId", protect, async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) return res.status(404).json({ message: "Board not found" });

    board.columns = board.columns.filter(
      (col) => col._id.toString() !== req.params.columnId
    );
    await board.save();
    await Card.deleteMany({ column: req.params.columnId });

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;