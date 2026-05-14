function Sidebar({ orgs, selectedOrg, onSelectOrg, onCreateOrg }) {
  return (
    <aside style={{
      width: "240px",
      background: "rgba(255,255,255,0.02)",
      borderRight: "1px solid rgba(255,255,255,0.05)",
      padding: "20px 12px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "4px 8px",
        marginBottom: "8px",
      }}>
        <span style={{
          fontSize: "11px",
          fontWeight: "600",
          color: "rgba(255,255,255,0.3)",
          letterSpacing: "0.8px",
          textTransform: "uppercase",
        }}>
          Workspaces
        </span>
        <button
          onClick={onCreateOrg}
          style={{
            background: "rgba(6,182,212,0.1)",
            border: "1px solid rgba(6,182,212,0.2)",
            borderRadius: "6px",
            width: "24px",
            height: "24px",
            color: "#06b6d4",
            fontSize: "16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'DM Sans', sans-serif",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(6,182,212,0.2)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(6,182,212,0.1)"}
        >
          +
        </button>
      </div>

      {orgs.length === 0 && (
        <p style={{
          color: "rgba(255,255,255,0.25)",
          fontSize: "13px",
          padding: "8px",
          margin: 0,
        }}>
          No workspaces yet
        </p>
      )}

      {orgs.map((org) => (
        <button
          key={org._id}
          onClick={() => onSelectOrg(org)}
          style={{
            textAlign: "left",
            padding: "9px 12px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            border: "none",
            fontFamily: "'DM Sans', sans-serif",
            background: selectedOrg?._id === org._id
              ? "rgba(6,182,212,0.12)"
              : "transparent",
            color: selectedOrg?._id === org._id
              ? "#22d3ee"
              : "rgba(255,255,255,0.55)",
            borderLeft: selectedOrg?._id === org._id
              ? "2px solid #06b6d4"
              : "2px solid transparent",
            transition: "background 0.15s, color 0.15s",
            width: "100%",
          }}
          onMouseEnter={(e) => {
            if (selectedOrg?._id !== org._id) {
              e.currentTarget.style.background = "rgba(6,182,212,0.06)";
              e.currentTarget.style.color = "rgba(255,255,255,0.8)";
            }
          }}
          onMouseLeave={(e) => {
            if (selectedOrg?._id !== org._id) {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(255,255,255,0.55)";
            }
          }}
        >
          {org.name}
        </button>
      ))}
    </aside>
  );
}

export default Sidebar;