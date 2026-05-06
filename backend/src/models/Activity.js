import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  org: { type: mongoose.Schema.Types.ObjectId, ref: "Org", required: true },
  board: { type: mongoose.Schema.Types.ObjectId, ref: "Board" },
  card: { type: mongoose.Schema.Types.ObjectId, ref: "Card" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
}, { timestamps: true });

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;