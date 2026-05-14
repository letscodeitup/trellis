function Spinner({ size = 36, color = "#06b6d4" }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `3px solid rgba(6,182,212,0.15)`,
        borderTop: `3px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Spinner;