import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  org: { type: mongoose.Schema.Types.ObjectId, ref: "Org", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  visibility: { type: String, enum: ["private", "team"], default: "team" },
  columns: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      name: { type: String, required: true },
      order: { type: Number, required: true },
    }
  ],
}, { timestamps: true });

const Board = mongoose.model("Board", boardSchema);
export default Board;