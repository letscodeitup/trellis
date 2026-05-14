import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

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

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        .not-found-content {
          animation: fadeInUp 0.5s ease forwards;
        }
        .float-icon {
          animation: float 3s ease-in-out infinite;
        }
        .go-btn {
          transition: transform 0.15s, box-shadow 0.2s;
        }
        .go-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 32px rgba(6,182,212,0.6) !important;
        }
      `}</style>

      {/* Animated grid */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(6,182,212,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(6,182,212,0.05) 1px, transparent 1px)
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
        background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }} />

      <div className="not-found-content" style={{
        textAlign: "center",
        position: "relative",
        zIndex: 1,
      }}>

        {/* Floating icon */}
        <div className="float-icon" style={{
          width: "72px",
          height: "72px",
          borderRadius: "20px",
          background: "rgba(6,182,212,0.1)",
          border: "1px solid rgba(6,182,212,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          boxShadow: "0 0 30px rgba(6,182,212,0.15)",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#06b6d4" strokeWidth="1.5"/>
            <path d="M12 8v4M12 16h.01" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* 404 */}
        <h1 style={{
          fontSize: "96px",
          fontWeight: "700",
          color: "transparent",
          background: "linear-gradient(135deg, #0891b2, #06b6d4, #22d3ee)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          margin: "0 0 8px",
          letterSpacing: "-4px",
          lineHeight: 1,
        }}>
          404
        </h1>

        <h2 style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "#fff",
          margin: "0 0 10px",
          letterSpacing: "-0.3px",
        }}>
          Page not found
        </h2>

        <p style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: "14px",
          margin: "0 0 32px",
          maxWidth: "300px",
        }}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="go-btn"
          style={{
            background: "linear-gradient(135deg, #0891b2, #06b6d4)",
            border: "none",
            borderRadius: "12px",
            padding: "12px 28px",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 0 24px rgba(6,182,212,0.4)",
            letterSpacing: "0.2px",
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default NotFound;