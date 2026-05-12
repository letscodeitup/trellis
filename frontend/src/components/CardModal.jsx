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
      await api.put(
        `/cards/${orgId}/${boardId}/${card._id}/checklist`,
        { checklist: updated }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const doneCount = checklist.filter((i) => i.done).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-bold text-gray-800 w-full focus:outline-none border-b-2 border-transparent focus:border-blue-500 pb-1"
          />
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl ml-4"
          >
            ×
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Priority + Due Date */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600 mb-1 block">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-600 mb-1 block">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Checklist */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-600">
                Checklist
              </label>
              {checklist.length > 0 && (
                <span className="text-xs text-gray-400">
                  {doneCount}/{checklist.length} done
                </span>
              )}
            </div>

            {/* Progress bar */}
            {checklist.length > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{
                    width: `${(doneCount / checklist.length) * 100}%`,
                  }}
                />
              </div>
            )}

            {/* Checklist items */}
            <div className="flex flex-col gap-2 mb-2">
              {checklist.map((item, index) => (
                <div key={index} className="flex items-center gap-2 group">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => handleToggleCheck(index)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span
                    className={`flex-1 text-sm ${
                      item.done ? "line-through text-gray-400" : "text-gray-700"
                    }`}
                  >
                    {item.text}
                  </span>
                  <button
                    onClick={() => handleDeleteCheckItem(index)}
                    className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Add checklist item */}
            <form onSubmit={handleAddCheckItem} className="flex gap-2">
              <input
                type="text"
                value={newCheckItem}
                onChange={(e) => setNewCheckItem(e.target.value)}
                placeholder="Add item..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"
              >
                Add
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleDeleteCard}
            className="text-red-400 hover:text-red-600 text-sm font-medium"
          >
            🗑️ Delete card
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardModal;