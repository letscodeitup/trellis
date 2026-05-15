import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore.js";

function Invite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, getMe } = useAuthStore();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMe();
  }, []);

  const handleJoin = async () => {
    if (!user) {
      navigate(`/login?redirect=/invite/${token}`);
      return;
    }
    setJoining(true);
    try {
      await api.post(`/orgs/join/${token}`);
      setJoined(true);
      toast.success("Joined workspace successfully!");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired invite link");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f1923",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        .invite-card { animation: fadeInUp 0.5s ease forwards; }
        .join-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 32px rgba(6,182,212,0.6) !important;
        }
      `}</style>

      {/* Animated grid */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(6,182,212,0.07) 1px, transparent 1px),
          linear-gradient(90deg, rgba(6,182,212,0.07) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        animation: "gridMove 5s linear infinite",
        pointerEvents: "none",
      }} />

      {/* Glow */}
      <div style={{
        position: "absolute",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      <div className="invite-card" style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(6,182,212,0.12)",
        borderRadius: "24px",
        padding: "44px 40px",
        width: "100%",
        maxWidth: "400px",
        backdropFilter: "blur(24px)",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        position: "relative",
        zIndex: 1,
        textAlign: "center",
      }}>

        {/* Logo */}
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #0891b2, #06b6d4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: "0 0 24px rgba(6,182,212,0.4)",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="2" fill="white"/>
            <rect x="14" y="3" width="7" height="7" rx="2" fill="white" opacity="0.7"/>
            <rect x="3" y="14" width="7" height="7" rx="2" fill="white" opacity="0.7"/>
            <rect x="14" y="14" width="7" height="7" rx="2" fill="white" opacity="0.4"/>
          </svg>
        </div>

        {joined ? (
          <>
            <h2 style={{ color: "#34d399", fontSize: "20px", fontWeight: "700", margin: "0 0 8px" }}>
              Joined successfully!
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: 0 }}>
              Redirecting to dashboard...
            </p>
          </>
        ) : error ? (
          <>
            <h2 style={{ color: "#f87171", fontSize: "20px", fontWeight: "700", margin: "0 0 8px" }}>
              Invalid invite
            </h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: "0 0 24px" }}>
              {error}
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                background: "linear-gradient(135deg, #0891b2, #06b6d4)",
                border: "none",
                borderRadius: "12px",
                padding: "12px 24px",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Go to Dashboard
            </button>
          </>
        ) : (
          <>
            <h2 style={{
              color: "#fff",
              fontSize: "20px",
              fontWeight: "700",
              margin: "0 0 8px",
              letterSpacing: "-0.3px",
            }}>
              You've been invited!
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "14px",
              margin: "0 0 8px",
            }}>
              You have been invited to join a workspace on Trellis.
            </p>

            {!user && (
              <p style={{
                color: "#22d3ee",
                fontSize: "13px",
                margin: "0 0 24px",
              }}>
                You'll need to sign in first
              </p>
            )}

            {user && (
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "12px 16px",
                margin: "0 0 24px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0891b2, #06b6d4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#fff",
                  flexShrink: 0,
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ color: "#fff", fontSize: "13px", fontWeight: "600", margin: 0 }}>
                    {user.name}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", margin: 0 }}>
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleJoin}
              disabled={joining}
              className="join-btn"
              style={{
                width: "100%",
                background: joining
                  ? "rgba(6,182,212,0.3)"
                  : "linear-gradient(135deg, #0891b2, #06b6d4)",
                border: "none",
                borderRadius: "12px",
                padding: "13px",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "600",
                cursor: joining ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 0 24px rgba(6,182,212,0.4)",
                transition: "transform 0.15s, box-shadow 0.2s",
              }}
            >
              {joining ? "Joining..." : user ? "Accept Invitation" : "Sign in to Join"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Invite;