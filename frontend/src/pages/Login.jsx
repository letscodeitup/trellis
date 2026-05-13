import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore.js";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    const user = useAuthStore.getState().user;
    if (user) {
      toast.success(`Welcome back, ${user.name}!`);
      navigate("/dashboard");
    } else {
      toast.error("Invalid email or password");
    }
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "12px 16px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
    marginBottom: "8px",
    letterSpacing: "0.3px",
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = "rgba(6,182,212,0.7)";
    e.target.style.boxShadow = "0 0 0 3px rgba(6,182,212,0.12)";
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = "rgba(255,255,255,0.08)";
    e.target.style.boxShadow = "none";
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
        input::placeholder { color: rgba(255,255,255,0.18); }
        * { box-sizing: border-box; }

        @keyframes float1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-40px, 20px) scale(1.08); }
          66% { transform: translate(30px, -40px) scale(0.92); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(20px, 30px) scale(1.1); }
        }
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 24px rgba(6,182,212,0.4); }
          50% { box-shadow: 0 0 40px rgba(6,182,212,0.7); }
        }
        .login-card {
          animation: fadeInUp 0.5s ease forwards;
        }
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 36px rgba(6,182,212,0.65) !important;
        }
        .login-btn:active {
          transform: translateY(0px);
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

      {/* Glow blob 1 */}
      <div style={{
        position: "absolute",
        width: "550px",
        height: "550px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 70%)",
        top: "-180px",
        left: "-180px",
        animation: "float1 9s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      {/* Glow blob 2 */}
      <div style={{
        position: "absolute",
        width: "420px",
        height: "420px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(8,145,178,0.15) 0%, transparent 70%)",
        bottom: "-120px",
        right: "-120px",
        animation: "float2 11s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      {/* Glow blob 3 */}
      <div style={{
        position: "absolute",
        width: "300px",
        height: "300px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)",
        top: "55%",
        right: "18%",
        animation: "float3 13s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      {/* Card */}
      <div className="login-card" style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(6,182,212,0.12)",
        borderRadius: "24px",
        padding: "44px 40px",
        width: "100%",
        maxWidth: "400px",
        backdropFilter: "blur(24px)",
        boxShadow: "0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(6,182,212,0.06)",
        position: "relative",
        zIndex: 1,
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "8px",
          }}>
            <div style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #0891b2, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "glowPulse 3s ease-in-out infinite",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="2" fill="white"/>
                <rect x="14" y="3" width="7" height="7" rx="2" fill="white" opacity="0.7"/>
                <rect x="3" y="14" width="7" height="7" rx="2" fill="white" opacity="0.7"/>
                <rect x="14" y="14" width="7" height="7" rx="2" fill="white" opacity="0.4"/>
              </svg>
            </div>
            <span style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#fff",
              letterSpacing: "-0.5px",
            }}>Trellis</span>
          </div>
          <p style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: "14px",
            margin: 0,
          }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-btn"
            style={{
              width: "100%",
              background: loading
                ? "rgba(6,182,212,0.3)"
                : "linear-gradient(135deg, #0891b2, #06b6d4)",
              border: "none",
              borderRadius: "12px",
              padding: "13px",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "6px",
              boxShadow: "0 0 24px rgba(6,182,212,0.4)",
              transition: "transform 0.15s, box-shadow 0.2s",
              letterSpacing: "0.3px",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          margin: "24px 0",
        }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", fontWeight: "500" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
        </div>

        <p style={{
          textAlign: "center",
          fontSize: "13px",
          color: "rgba(255,255,255,0.3)",
          margin: 0,
        }}>
          Don't have an account?{" "}
          <Link to="/register" style={{
            color: "#22d3ee",
            textDecoration: "none",
            fontWeight: "600",
          }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;