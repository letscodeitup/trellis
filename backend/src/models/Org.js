import mongoose from "mongoose";

const orgSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["owner", "admin", "member", "viewer"], default: "member" },
    }
  ],
  inviteToken: { type: String },
  inviteTokenExpiry: { type: Date },
  inviteRole: { type: String, enum: ["admin", "member", "viewer"], default: "member" },
}, { timestamps: true });





const Org = mongoose.model("Org", orgSchema);
export default Org;

