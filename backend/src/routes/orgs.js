import express from "express";
import crypto from "crypto";
import Org from "../models/Org.js";
import User from "../models/User.js";
import protect from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = express.Router();

// Create org
router.post("/", protect, async (req, res) => {
  try {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + crypto.randomBytes(3).toString("hex");

    const org = await Org.create({
      name,
      slug,
      owner: req.user._id,
      members: [{ user: req.user._id, role: "owner" }],
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: { orgs: org._id },
    });

    res.status(201).json(org);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orgs for current user
router.get("/", protect, async (req, res) => {
  try {
    const orgs = await Org.find({ "members.user": req.user._id })
      .populate("owner", "name email");
    res.json(orgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single org
router.get("/:orgId", protect, async (req, res) => {
  try {
    const org = await Org.findById(req.params.orgId)
      .populate("members.user", "name email avatar");

    if (!org) return res.status(404).json({ message: "Org not found" });

    const isMember = org.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) return res.status(403).json({ message: "Not a member" });

    res.json(org);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate invite link with role
router.post("/:orgId/invite", protect, requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    const org = await Org.findById(req.params.orgId);
    if (!org) return res.status(404).json({ message: "Org not found" });

    const token = crypto.randomBytes(20).toString("hex");
    org.inviteToken = token;
    org.inviteTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
    org.inviteRole = role || "member";
    await org.save();

    res.json({
      inviteLink: `${process.env.CLIENT_URL}/invite/${token}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join org via invite token
router.post("/join/:token", protect, async (req, res) => {
  try {
    const org = await Org.findOne({
      inviteToken: req.params.token,
      inviteTokenExpiry: { $gt: Date.now() },
    });

    if (!org) return res.status(400).json({ message: "Invalid or expired invite link" });

    const alreadyMember = org.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      // Make sure user has org in their orgs array
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { orgs: org._id },
      });
      return res.json({ message: "Already a member", org });
    }

    org.members.push({ user: req.user._id, role: org.inviteRole || "member" });
    await org.save();

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { orgs: org._id },
    });

    res.json({ message: "Joined org successfully", org });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;