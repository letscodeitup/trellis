import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
  org: { type: mongoose.Schema.Types.ObjectId, ref: "Org", required: true },
  column: { type: mongoose.Schema.Types.ObjectId, required: true },
  order: { type: Number, required: true },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  dueDate: { type: Date },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  attachments: [{ url: String, filename: String }],
  checklist: [
    {
      text: { type: String, required: true },
      done: { type: Boolean, default: false },
    }
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Card = mongoose.model("Card", cardSchema);
export default Card;