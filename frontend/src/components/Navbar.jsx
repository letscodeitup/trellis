import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore.js";
import toast from "react-hot-toast";

function Navbar({ title, showBack = false, rightContent }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav style={{
      background: "rgba(255,255,255,0.02)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "0 24px",
      height: "60px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backdropFilter: "blur(12px)",
      position: "sticky",
      top: 0,
      zIndex: 10,
      fontFamily: "'DM Sans', sans-serif",
      gap: "12px",
    }}>

      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {showBack && (
          <>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "6px 12px",
                color: "rgba(255,255,255,0.5)",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Dashboard
            </button>
            <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.08)" }} />
          </>
        )}

        {/* Logo */}
        <div
          onClick={() => navigate("/dashboard")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #0891b2, #06b6d4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(6,182,212,0.4)",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="2" fill="white"/>
              <rect x="14" y="3" width="7" height="7" rx="2" fill="white" opacity="0.7"/>
              <rect x="3" y="14" width="7" height="7" rx="2" fill="white" opacity="0.7"/>
              <rect x="14" y="14" width="7" height="7" rx="2" fill="white" opacity="0.4"/>
            </svg>
          </div>
          <span style={{
            fontSize: "17px",
            fontWeight: "700",
            color: "#fff",
            letterSpacing: "-0.5px",
          }}>
            {title || "Trellis"}
          </span>
        </div>
      </div>

      {/* Center — custom content */}
      {rightContent && (
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          {rightContent}
        </div>
      )}

      {/* Right — user + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "10px",
          padding: "5px 10px",
        }}>
          <div style={{
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #0891b2, #06b6d4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: "700",
            color: "#fff",
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "13px",
            fontWeight: "500",
          }}>
            {user?.name}
          </span>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "8px",
            padding: "7px 14px",
            color: "rgba(255,255,255,0.5)",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            e.currentTarget.style.color = "#f87171";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}

export default Navbar;