import Org from "../models/Org.js";

// Get user's role in an org
const getUserRole = async (userId, orgId) => {
  const org = await Org.findById(orgId);
  if (!org) return null;
  const member = org.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  return member ? member.role : null;
};

// Role hierarchy
const roleLevel = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
};

// Middleware factory
const requireRole = (minRole) => {
  return async (req, res, next) => {
    try {
      const orgId = req.params.orgId;
      if (!orgId) {
        return res.status(400).json({ message: "Org ID required" });
      }

      const role = await getUserRole(req.user._id, orgId);
      if (!role) {
        return res.status(403).json({ message: "Not a member of this org" });
      }

      if (roleLevel[role] < roleLevel[minRole]) {
        return res.status(403).json({
          message: `Requires ${minRole} role or higher`,
        });
      }

      req.userRole = role;
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

export { requireRole, getUserRole };