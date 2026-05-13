import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore.js";
import useBoardStore from "../store/boardStore.js";

function Dashboard() {
  const { user, logout } = useAuthStore();
  const { orgs, boards, loading, getOrgs, createOrg, getBoards, createBoard, deleteBoard } = useBoardStore();
  const navigate = useNavigate();

  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [boardName, setBoardName] = useState("");

  useEffect(() => { getOrgs(); }, []);
  useEffect(() => { if (selectedOrg) getBoards(selectedOrg._id); }, [selectedOrg]);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    const org = await createOrg(orgName);
    if (org) {
      toast.success("Workspace created!");
      setOrgName("");
      setShowOrgModal(false);
      setSelectedOrg(org);
    } else {
      toast.error("Failed to create workspace");
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    const board = await createBoard(selectedOrg._id, { name: boardName });
    if (board) {
      toast.success("Board created!");
      setBoardName("");
      setShowBoardModal(false);
    } else {
      toast.error("Failed to create board");
    }
  };

  const handleDeleteBoard = async (e, boardId) => {
    e.stopPropagation();
    if (!confirm("Delete this board? This cannot be undone.")) return;
    const success = await deleteBoard(selectedOrg._id, boardId);
    if (success) toast.success("Board deleted!");
    else toast.error("Failed to delete board");
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const modalOverlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  };

  const modalCard = {
    background: "#1a2535",
    border: "1px solid rgba(6,182,212,0.15)",
    borderRadius: "20px",
    padding: "32px",
    width: "100%",
    maxWidth: "380px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1.5px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "11px 16px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
    marginBottom: "12px",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f1923",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.2); }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .board-card {
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          animation: fadeIn 0.3s ease forwards;
        }
        .board-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(6,182,212,0.15), 0 0 0 1px rgba(6,182,212,0.2) !important;
          border-color: rgba(6,182,212,0.3) !important;
        }
        .org-btn {
          transition: background 0.15s, color 0.15s;
        }
        .org-btn:hover {
          background: rgba(6,182,212,0.1) !important;
          color: #22d3ee !important;
        }
        .delete-btn {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .board-card:hover .delete-btn {
          opacity: 1;
        }
        .primary-btn {
          transition: transform 0.15s, box-shadow 0.2s;
        }
        .primary-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 24px rgba(6,182,212,0.5) !important;
        }
      `}</style>

      {/* Navbar */}
      <nav style={{
        background: "rgba(255,255,255,0.03)",
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
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
            fontSize: "18px",
            fontWeight: "700",
            color: "#fff",
            letterSpacing: "-0.5px",
          }}>Trellis</span>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            padding: "6px 12px",
          }}>
            <div style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0891b2, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "700",
              color: "#fff",
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: "500" }}>
              {user?.name}
            </span>
          </div>

          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              padding: "7px 16px",
              color: "rgba(255,255,255,0.6)",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(239,68,68,0.1)";
              e.target.style.color = "#f87171";
              e.target.style.borderColor = "rgba(239,68,68,0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.05)";
              e.target.style.color = "rgba(255,255,255,0.6)";
              e.target.style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ display: "flex", flex: 1 }}>

        {/* Sidebar */}
        <aside style={{
          width: "240px",
          background: "rgba(255,255,255,0.02)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          padding: "20px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
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
              onClick={() => setShowOrgModal(true)}
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
              onMouseEnter={(e) => e.target.style.background = "rgba(6,182,212,0.2)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(6,182,212,0.1)"}
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
              onClick={() => setSelectedOrg(org)}
              className="org-btn"
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
              }}
            >
              {org.name}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
          {!selectedOrg ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: "16px",
            }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                background: "rgba(6,182,212,0.1)",
                border: "1px solid rgba(6,182,212,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="2" stroke="#06b6d4" strokeWidth="1.5"/>
                  <rect x="14" y="3" width="7" height="7" rx="2" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6"/>
                  <rect x="3" y="14" width="7" height="7" rx="2" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6"/>
                  <rect x="14" y="14" width="7" height="7" rx="2" stroke="#06b6d4" strokeWidth="1.5" opacity="0.3"/>
                </svg>
              </div>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "15px", margin: 0 }}>
                Select or create a workspace to get started
              </p>
              <button
                onClick={() => setShowOrgModal(true)}
                className="primary-btn"
                style={{
                  background: "linear-gradient(135deg, #0891b2, #06b6d4)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: "0 0 20px rgba(6,182,212,0.3)",
                }}
              >
                Create Workspace
              </button>
            </div>
          ) : (
            <>
              {/* Board header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}>
                <div>
                  <h1 style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#fff",
                    margin: 0,
                    letterSpacing: "-0.5px",
                  }}>
                    {selectedOrg.name}
                  </h1>
                  <p style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "13px",
                    margin: "4px 0 0",
                  }}>
                    {boards.length} board{boards.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setShowBoardModal(true)}
                  className="primary-btn"
                  style={{
                    background: "linear-gradient(135deg, #0891b2, #06b6d4)",
                    border: "none",
                    borderRadius: "10px",
                    padding: "9px 18px",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: "0 0 20px rgba(6,182,212,0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
                  New Board
                </button>
              </div>

              {/* Boards grid */}
              {loading ? (
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>
                  Loading boards...
                </p>
              ) : boards.length === 0 ? (
                <div style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px dashed rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "48px",
                  textAlign: "center",
                }}>
                  <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "14px", margin: 0 }}>
                    No boards yet — create your first one!
                  </p>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: "16px",
                }}>
                  {boards.map((board, index) => (
                    <div
                      key={board._id}
                      onClick={() => navigate(`/board/${board._id}`)}
                      className="board-card"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "16px",
                        padding: "20px",
                        cursor: "pointer",
                        position: "relative",
                        animationDelay: `${index * 0.05}s`,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                      }}
                    >
                      {/* Board color accent */}
                      <div style={{
                        width: "100%",
                        height: "4px",
                        borderRadius: "4px",
                        background: "linear-gradient(90deg, #0891b2, #06b6d4)",
                        marginBottom: "16px",
                        boxShadow: "0 0 12px rgba(6,182,212,0.4)",
                      }} />

                      <button
                        onClick={(e) => handleDeleteBoard(e, board._id)}
                        className="delete-btn"
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          borderRadius: "6px",
                          width: "28px",
                          height: "28px",
                          color: "#f87171",
                          cursor: "pointer",
                          fontSize: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        ×
                      </button>

                      <h3 style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#fff",
                        margin: "0 0 6px",
                        letterSpacing: "-0.3px",
                      }}>
                        {board.name}
                      </h3>
                      <p style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.3)",
                        margin: "0 0 12px",
                      }}>
                        {board.description || "No description"}
                      </p>
                      <span style={{
                        display: "inline-block",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#06b6d4",
                        background: "rgba(6,182,212,0.1)",
                        border: "1px solid rgba(6,182,212,0.2)",
                        borderRadius: "6px",
                        padding: "2px 8px",
                        letterSpacing: "0.3px",
                      }}>
                        {board.visibility}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Create Org Modal */}
      {showOrgModal && (
        <div style={modalOverlay} onClick={() => setShowOrgModal(false)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: "700", margin: "0 0 20px", letterSpacing: "-0.3px" }}>
              Create Workspace
            </h2>
            <form onSubmit={handleCreateOrg}>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Workspace name"
                required
                style={inputStyle}
                autoFocus
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="submit"
                  className="primary-btn"
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #0891b2, #06b6d4)",
                    border: "none",
                    borderRadius: "10px",
                    padding: "11px",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: "0 0 20px rgba(6,182,212,0.3)",
                  }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowOrgModal(false)}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    padding: "11px",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Board Modal */}
      {showBoardModal && (
        <div style={modalOverlay} onClick={() => setShowBoardModal(false)}>
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: "700", margin: "0 0 20px", letterSpacing: "-0.3px" }}>
              Create Board
            </h2>
            <form onSubmit={handleCreateBoard}>
              <input
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="Board name"
                required
                style={inputStyle}
                autoFocus
              />
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="submit"
                  className="primary-btn"
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #0891b2, #06b6d4)",
                    border: "none",
                    borderRadius: "10px",
                    padding: "11px",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: "0 0 20px rgba(6,182,212,0.3)",
                  }}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowBoardModal(false)}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    padding: "11px",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;