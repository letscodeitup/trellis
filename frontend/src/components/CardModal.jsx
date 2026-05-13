import { useState } from "react";
import api from "../api/axios.js";

function CardModal({ card, boardId, orgId, onClose, onUpdate }) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [priority, setPriority] = useState(card.priority || "medium");
  const [dueDate, setDueDate] = useState(
    card.dueDate ? card.dueDate.split("T")[0] : ""
  );
  const [checklist, setChecklist] = useState(card.checklist || []);
  const [newCheckItem, setNewCheckItem] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(
        `/cards/${orgId}/${boardId}/${card._id}`,
        { title, description, priority, dueDate }
      );
      onUpdate(res.data);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!confirm("Delete this card?")) return;
    try {
      await api.delete(`/cards/${orgId}/${boardId}/${card._id}`);
      onUpdate(null, card._id);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCheckItem = (e) => {
    e.preventDefault();
    if (!newCheckItem.trim()) return;
    const updated = [...checklist, { text: newCheckItem, done: false }];
    setChecklist(updated);
    setNewCheckItem("");
    saveChecklist(updated);
  };

  const handleToggleCheck = (index) => {
    const updated = checklist.map((item, i) =>
      i === index ? { ...item, done: !item.done } : item
    );
    setChecklist(updated);
    saveChecklist(updated);
  };

  const handleDeleteCheckItem = (index) => {
    const updated = checklist.filter((_, i) => i !== index);
    setChecklist(updated);
    saveChecklist(updated);
  };

  const saveChecklist = async (updated) => {
    try {
      await api.put(`/cards/${orgId}/${boardId}/${card._id}/checklist`, {
        checklist: updated,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const doneCount = checklist.filter((i) => i.done).length;

  const priorityConfig = {
    high: { color: "#f87171", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
    medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)" },
    low: { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)" },
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1.5px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "13px",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111c27",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(6,182,212,0.08)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
          * { box-sizing: border-box; }
          input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.2); }
          textarea { resize: none; }
          .check-item { transition: opacity 0.15s; }
          .check-item:hover .del-check { opacity: 1 !important; }
        `}</style>

        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              borderBottom: "1.5px solid rgba(255,255,255,0.08)",
              borderRadius: 0,
              padding: "4px 0",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "600",
              outline: "none",
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.3px",
            }}
            onFocus={(e) => e.target.style.borderBottomColor = "rgba(6,182,212,0.5)"}
            onBlur={(e) => e.target.style.borderBottomColor = "rgba(255,255,255,0.08)"}
          />
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              fontSize: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontFamily: "'DM Sans', sans-serif",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)";
              e.currentTarget.style.color = "#f87171";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "rgba(255,255,255,0.4)";
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Description */}
          <div>
            <label style={{
              display: "block",
              fontSize: "11px",
              fontWeight: "600",
              color: "rgba(255,255,255,0.35)",
              marginBottom: "8px",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              style={{
                ...inputStyle,
                lineHeight: "1.5",
              }}
              onFocus={(e) => e.target.style.borderColor = "rgba(6,182,212,0.4)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>

          {/* Priority + Due Date */}
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "600",
                color: "rgba(255,255,255,0.35)",
                marginBottom: "8px",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
              }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  ...inputStyle,
                  cursor: "pointer",
                  color: priorityConfig[priority]?.color || "#fff",
                }}
                onFocus={(e) => e.target.style.borderColor = "rgba(6,182,212,0.4)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "600",
                color: "rgba(255,255,255,0.35)",
                marginBottom: "8px",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
              }}>
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  ...inputStyle,
                  colorScheme: "dark",
                }}
                onFocus={(e) => e.target.style.borderColor = "rgba(6,182,212,0.4)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}>
              <label style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
              }}>
                Checklist
              </label>
              {checklist.length > 0 && (
                <span style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.3)",
                  fontWeight: "500",
                }}>
                  {doneCount}/{checklist.length} done
                </span>
              )}
            </div>

            {/* Progress bar */}
            {checklist.length > 0 && (
              <div style={{
                width: "100%",
                height: "3px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "3px",
                marginBottom: "12px",
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${(doneCount / checklist.length) * 100}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #0891b2, #06b6d4)",
                  borderRadius: "3px",
                  transition: "width 0.3s ease",
                  boxShadow: "0 0 8px rgba(6,182,212,0.4)",
                }} />
              </div>
            )}

            {/* Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
              {checklist.map((item, index) => (
                <div
                  key={index}
                  className="check-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 10px",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => handleToggleCheck(index)}
                    style={{
                      width: "15px",
                      height: "15px",
                      accentColor: "#06b6d4",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{
                    flex: 1,
                    fontSize: "13px",
                    color: item.done ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.7)",
                    textDecoration: item.done ? "line-through" : "none",
                    transition: "color 0.15s",
                  }}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => handleDeleteCheckItem(index)}
                    className="del-check"
                    style={{
                      background: "none",
                      border: "none",
                      color: "#f87171",
                      cursor: "pointer",
                      fontSize: "14px",
                      opacity: 0,
                      padding: "0 2px",
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "opacity 0.15s",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Add checklist item */}
            <form onSubmit={handleAddCheckItem} style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                placeholder="Add checklist item..."
                style={{ ...inputStyle, flex: 1 }}
                onFocus={(e) => e.target.style.borderColor = "rgba(6,182,212,0.4)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
              <button
                type="submit"
                style={{
                  background: "rgba(6,182,212,0.1)",
                  border: "1px solid rgba(6,182,212,0.2)",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  color: "#06b6d4",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(6,182,212,0.18)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(6,182,212,0.1)"}
              >
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,0,0,0.15)",
          borderRadius: "0 0 20px 20px",
        }}>
          <button
            onClick={handleDeleteCard}
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.15)",
              borderRadius: "8px",
              padding: "8px 14px",
              color: "#f87171",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
          >
            Delete card
          </button>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "rgba(255,255,255,0.4)",
                fontSize: "13px",
                fontWeight: "500",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saving
                  ? "rgba(6,182,212,0.3)"
                  : "linear-gradient(135deg, #0891b2, #06b6d4)",
                border: "none",
                borderRadius: "8px",
                padding: "8px 20px",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "600",
                cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: saving ? "none" : "0 0 16px rgba(6,182,212,0.3)",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 0 24px rgba(6,182,212,0.5)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 0 16px rgba(6,182,212,0.3)";
              }}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardModal;