import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import api from "../api/axios.js";
import CardModal from "../components/CardModal.jsx";
import useSocket from "../hooks/useSocket.js";

function DroppableColumn({ id, children }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[50px]">
      {children}
    </div>
  );
}

function SortableCard({ card, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityConfig = {
    high: { color: "#f87171", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)" },
    medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" },
    low: { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" },
  };

  const p = priorityConfig[card.priority] || priorityConfig.medium;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="trellis-card"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="drag-handle"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="7" r="1.5" fill="currentColor"/>
          <circle cx="15" cy="7" r="1.5" fill="currentColor"/>
          <circle cx="9" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="15" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="9" cy="17" r="1.5" fill="currentColor"/>
          <circle cx="15" cy="17" r="1.5" fill="currentColor"/>
        </svg>
        drag
      </div>

      {/* Card content */}
      <div onClick={onClick} style={{ cursor: "pointer" }}>
        <p style={{
          fontSize: "13px",
          fontWeight: "500",
          color: "#e2e8f0",
          margin: "0 0 8px",
          lineHeight: "1.4",
        }}>
          {card.title}
        </p>
        {card.description && (
          <p style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.35)",
            margin: "0 0 10px",
            lineHeight: "1.4",
          }}>
            {card.description.length > 60
              ? card.description.slice(0, 60) + "..."
              : card.description}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span style={{
            fontSize: "11px",
            fontWeight: "600",
            color: p.color,
            background: p.bg,
            border: `1px solid ${p.border}`,
            borderRadius: "5px",
            padding: "2px 7px",
            letterSpacing: "0.2px",
          }}>
            {card.priority}
          </span>
          {card.dueDate && (
            <span style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.35)",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {new Date(card.dueDate).toLocaleDateString()}
            </span>
          )}
          {card.checklist?.length > 0 && (
            <span style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.35)",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {card.checklist.filter(i => i.done).length}/{card.checklist.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Board() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [activeColumn, setActiveColumn] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [activities, setActivities] = useState([]);
  const [showActivity, setShowActivity] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const socket = useSocket(boardId);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => { fetchBoard(); }, [boardId]);

  useEffect(() => {
    if (!socket) return;
    socket.on("card_moved", (data) => {
      setCards((prev) => prev.map((c) =>
        c._id === data.cardId ? { ...c, column: data.columnId } : c
      ));
    });
    socket.on("card_created", (data) => {
      setCards((prev) => {
        const exists = prev.find((c) => c._id === data.card._id);
        if (exists) return prev;
        return [...prev, data.card];
      });
    });
    socket.on("card_updated", (data) => {
      setCards((prev) => prev.map((c) => c._id === data.card._id ? data.card : c));
    });
    socket.on("card_deleted", (data) => {
      setCards((prev) => prev.filter((c) => c._id !== data.cardId));
    });
    return () => {
      socket.off("card_moved");
      socket.off("card_created");
      socket.off("card_updated");
      socket.off("card_deleted");
    };
  }, [socket]);

  const fetchBoard = async () => {
    try {
      const res = await api.get(`/boards/org/${boardId}`);
      setBoard(res.data.board);
      setCards(res.data.cards);
      fetchActivity(res.data.board.org);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async (orgId) => {
    try {
      const res = await api.get(`/activity/${orgId}/${boardId}`);
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getColumnCards = (columnId) => {
    return cards.filter((c) => {
      const matchesColumn = c.column === columnId;
      const matchesSearch = searchQuery
        ? c.title.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesPriority = priorityFilter === "all" ? true : c.priority === priorityFilter;
      return matchesColumn && matchesSearch && matchesPriority;
    });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;
    const activeCard = cards.find((c) => c._id === active.id);
    if (!activeCard) return;
    const overCard = cards.find((c) => c._id === over.id);
    const targetColumnId = overCard ? overCard.column : over.id;
    const validColumn = board.columns.find((col) => col._id === targetColumnId);
    if (!validColumn) return;
    setCards((prev) => prev.map((c) =>
      c._id === activeCard._id ? { ...c, column: targetColumnId } : c
    ));
    if (socket) socket.emit("card_moved", { boardId, cardId: activeCard._id, columnId: targetColumnId });
    try {
      await api.put(`/cards/${board.org}/${boardId}/${activeCard._id}/move`, {
        columnId: targetColumnId,
        order: getColumnCards(targetColumnId).length,
      });
    } catch (err) {
      console.error(err);
      fetchBoard();
    }
  };

  const handleAddCard = async (e, columnId) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    try {
      const res = await api.post(`/cards/${board.org}/${boardId}/${columnId}`, {
        title: newCardTitle,
        priority: "medium",
      });
      setCards((prev) => [...prev, res.data]);
      if (socket) socket.emit("card_created", { boardId, card: res.data });
      setNewCardTitle("");
      setActiveColumn(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCardUpdate = (updatedCard, deletedId) => {
    if (deletedId) {
      setCards((prev) => prev.filter((c) => c._id !== deletedId));
      if (socket) socket.emit("card_deleted", { boardId, cardId: deletedId });
    } else {
      setCards((prev) => prev.map((c) => c._id === updatedCard._id ? updatedCard : c));
      if (socket) socket.emit("card_updated", { boardId, card: updatedCard });
    }
  };

  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    try {
      const res = await api.post(`/boards/${board.org}/${boardId}/columns`, { name: newColumnName });
      setBoard(res.data);
      setNewColumnName("");
      setShowAddColumn(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div style={{
      minHeight: "100vh",
      background: "#0f1923",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "3px solid rgba(6,182,212,0.2)",
          borderTop: "3px solid #06b6d4",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px",
        }} />
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>Loading board...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!board) return (
    <div style={{
      minHeight: "100vh",
      background: "#0f1923",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <p style={{ color: "#f87171", fontSize: "14px" }}>Board not found</p>
    </div>
  );

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

        .trellis-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 12px;
          transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
        }
        .trellis-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(6,182,212,0.15);
          border-color: rgba(6,182,212,0.2);
        }
        .drag-handle {
          display: flex;
          align-items: center;
          gap: 4px;
          color: rgba(255,255,255,0.2);
          font-size: 11px;
          cursor: grab;
          margin-bottom: 8px;
          user-select: none;
          transition: color 0.15s;
        }
        .drag-handle:hover { color: rgba(6,182,212,0.6); }
        .add-card-btn {
          width: 100%;
          text-align: left;
          padding: 8px 10px;
          background: transparent;
          border: 1px dashed rgba(255,255,255,0.08);
          border-radius: 8px;
          color: rgba(255,255,255,0.3);
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .add-card-btn:hover {
          background: rgba(6,182,212,0.06);
          color: #06b6d4;
          border-color: rgba(6,182,212,0.2);
        }
        .nav-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 7px 12px;
          color: #fff;
          font-size: 13px;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s;
        }
        .nav-input:focus {
          border-color: rgba(6,182,212,0.5);
        }
        .nav-select {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 7px 12px;
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
        }
        .activity-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .activity-panel {
          animation: slideIn 0.25s ease forwards;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{
        background: "rgba(255,255,255,0.02)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 20px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>

        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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

          <span style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "#fff",
            letterSpacing: "-0.3px",
          }}>
            {board.name}
          </span>
        </div>

        {/* Center — search + filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, maxWidth: "420px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <svg style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255,255,255,0.3)",
            }} width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cards..."
              className="nav-input"
              style={{ paddingLeft: "30px", width: "100%" }}
            />
          </div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="nav-select"
          >
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Right */}
        <button
          onClick={() => setShowActivity(!showActivity)}
          style={{
            background: showActivity
              ? "rgba(6,182,212,0.15)"
              : "rgba(255,255,255,0.05)",
            border: showActivity
              ? "1px solid rgba(6,182,212,0.3)"
              : "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            padding: "7px 14px",
            color: showActivity ? "#06b6d4" : "rgba(255,255,255,0.5)",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.15s",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Activity
        </button>
      </nav>

      {/* Board */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div style={{
          display: "flex",
          gap: "14px",
          padding: "20px",
          overflowX: "auto",
          flex: 1,
          alignItems: "flex-start",
        }}>

          {board.columns.sort((a, b) => a.order - b.order).map((column) => (
            <div key={column._id} style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "14px",
              width: "280px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              padding: "12px",
              maxHeight: "calc(100vh - 120px)",
            }}>

              {/* Column header */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "4px 2px 8px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                marginBottom: "4px",
              }}>
                <span style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "rgba(255,255,255,0.7)",
                  letterSpacing: "0.2px",
                }}>
                  {column.name}
                </span>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "5px",
                  padding: "2px 7px",
                }}>
                  {getColumnCards(column._id).length}
                </span>
              </div>

              {/* Cards */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                overflowY: "auto",
                flex: 1,
              }}>
                <DroppableColumn id={column._id}>
                  <SortableContext
                    items={getColumnCards(column._id).map((c) => c._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {getColumnCards(column._id).map((card) => (
                      <SortableCard
                        key={card._id}
                        card={card}
                        onClick={() => setSelectedCard(card)}
                      />
                    ))}
                  </SortableContext>
                </DroppableColumn>
              </div>

              {/* Add card */}
              {activeColumn === column._id ? (
                <form onSubmit={(e) => handleAddCard(e, column._id)}>
                  <input
                    autoFocus
                    type="text"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    placeholder="Card title..."
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.06)",
                      border: "1.5px solid rgba(6,182,212,0.3)",
                      borderRadius: "8px",
                      padding: "9px 12px",
                      color: "#fff",
                      fontSize: "13px",
                      outline: "none",
                      fontFamily: "'DM Sans', sans-serif",
                      marginBottom: "8px",
                    }}
                  />
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        background: "linear-gradient(135deg, #0891b2, #06b6d4)",
                        border: "none",
                        borderRadius: "7px",
                        padding: "8px",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        boxShadow: "0 0 12px rgba(6,182,212,0.3)",
                      }}
                    >
                      Add card
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveColumn(null)}
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "7px",
                        padding: "8px",
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setActiveColumn(column._id)}
                  className="add-card-btn"
                >
                  + Add card
                </button>
              )}
            </div>
          ))}

          {/* Add Column */}
          <div style={{ width: "280px", flexShrink: 0 }}>
            {showAddColumn ? (
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "14px",
                padding: "12px",
              }}>
                <form onSubmit={handleAddColumn}>
                  <input
                    autoFocus
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Column name..."
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.06)",
                      border: "1.5px solid rgba(6,182,212,0.3)",
                      borderRadius: "8px",
                      padding: "9px 12px",
                      color: "#fff",
                      fontSize: "13px",
                      outline: "none",
                      fontFamily: "'DM Sans', sans-serif",
                      marginBottom: "8px",
                    }}
                  />
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        background: "linear-gradient(135deg, #0891b2, #06b6d4)",
                        border: "none",
                        borderRadius: "7px",
                        padding: "8px",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        boxShadow: "0 0 12px rgba(6,182,212,0.3)",
                      }}
                    >
                      Add column
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddColumn(false)}
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "7px",
                        padding: "8px",
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setShowAddColumn(true)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px dashed rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  padding: "14px",
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "background 0.15s, color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(6,182,212,0.05)";
                  e.currentTarget.style.color = "#06b6d4";
                  e.currentTarget.style.borderColor = "rgba(6,182,212,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.3)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                + Add column
              </button>
            )}
          </div>
        </div>
      </DndContext>

      {/* Activity Panel */}
      {showActivity && (
        <div className="activity-panel" style={{
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh",
          width: "300px",
          background: "#111c27",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <h2 style={{
              color: "#fff",
              fontSize: "15px",
              fontWeight: "600",
              margin: 0,
              letterSpacing: "-0.3px",
            }}>
              Activity
            </h2>
            <button
              onClick={() => setShowActivity(false)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "6px",
                width: "28px",
                height: "28px",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              ×
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {activities.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px", textAlign: "center", marginTop: "24px" }}>
                No activity yet
              </p>
            ) : (
              activities.map((activity) => (
                <div key={activity._id} className="activity-item">
                  <div style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #0891b2, #06b6d4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: "700",
                    color: "#fff",
                    flexShrink: 0,
                  }}>
                    {activity.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", margin: "0 0 3px", lineHeight: "1.4" }}>
                      <span style={{ color: "#fff", fontWeight: "600" }}>{activity.user?.name}</span>{" "}
                      {activity.action}
                    </p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", margin: 0 }}>
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {selectedCard && (
        <CardModal
          card={selectedCard}
          boardId={boardId}
          orgId={board.org}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleCardUpdate}
        />
      )}
    </div>
  );
}

export default Board;