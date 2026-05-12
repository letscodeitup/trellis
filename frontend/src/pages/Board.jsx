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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab mb-1 text-gray-300 hover:text-gray-400 text-xs"
      >
        ⠿ drag
      </div>
      <div onClick={onClick} className="cursor-pointer">
        <p className="text-sm font-medium text-gray-800">{card.title}</p>
        {card.description && (
          <p className="text-xs text-gray-400 mt-1">{card.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium
            ${card.priority === "high" ? "bg-red-100 text-red-600" :
              card.priority === "medium" ? "bg-yellow-100 text-yellow-600" :
              "bg-green-100 text-green-600"}`}>
            {card.priority}
          </span>
          {card.dueDate && (
            <span className="text-xs text-gray-400">
              📅 {new Date(card.dueDate).toLocaleDateString()}
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
  const socket = useSocket(boardId);
  const [activities, setActivities] = useState([]);
const [showActivity, setShowActivity] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchBoard();
  }, [boardId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("card_moved", (data) => {
      setCards((prev) =>
        prev.map((c) =>
          c._id === data.cardId ? { ...c, column: data.columnId } : c
        )
      );
    });

    socket.on("card_created", (data) => {
      setCards((prev) => {
        const exists = prev.find((c) => c._id === data.card._id);
        if (exists) return prev;
        return [...prev, data.card];
      });
    });

    socket.on("card_updated", (data) => {
      setCards((prev) =>
        prev.map((c) => (c._id === data.card._id ? data.card : c))
      );
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
    return cards.filter((c) => c.column === columnId);
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

    setCards((prev) =>
      prev.map((c) =>
        c._id === activeCard._id ? { ...c, column: targetColumnId } : c
      )
    );

    // Emit socket event
    if (socket) {
      socket.emit("card_moved", {
        boardId,
        cardId: activeCard._id,
        columnId: targetColumnId,
      });
    }

    try {
      await api.put(
        `/cards/${board.org}/${boardId}/${activeCard._id}/move`,
        {
          columnId: targetColumnId,
          order: getColumnCards(targetColumnId).length,
        }
      );
    } catch (err) {
      console.error(err);
      fetchBoard();
    }
  };

  const handleAddCard = async (e, columnId) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    try {
      const res = await api.post(
        `/cards/${board.org}/${boardId}/${columnId}`,
        { title: newCardTitle, priority: "medium" }
      );
      setCards((prev) => [...prev, res.data]);

      // Emit socket event
      if (socket) {
        socket.emit("card_created", {
          boardId,
          card: res.data,
        });
      }

      setNewCardTitle("");
      setActiveColumn(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCardUpdate = (updatedCard, deletedId) => {
    if (deletedId) {
      setCards((prev) => prev.filter((c) => c._id !== deletedId));
      // Emit socket event
      if (socket) {
        socket.emit("card_deleted", { boardId, cardId: deletedId });
      }
    } else {
      setCards((prev) =>
        prev.map((c) => (c._id === updatedCard._id ? updatedCard : c))
      );
      // Emit socket event
      if (socket) {
        socket.emit("card_updated", { boardId, card: updatedCard });
      }
    }
  };

  const handleAddColumn = async (e) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    try {
      const res = await api.post(
        `/boards/${board.org}/${boardId}/columns`,
        { name: newColumnName }
      );
      setBoard(res.data);
      setNewColumnName("");
      setShowAddColumn(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading board...</p>
      </div>
    );

  if (!board)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400 text-lg">Board not found</p>
      </div>
    );

return (
    <div className="min-h-screen bg-blue-700">
      <nav className="bg-blue-800 text-white px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-200 hover:text-white text-sm"
          >
            ← Dashboard
          </button>
          <h1 className="font-bold text-lg">{board.name}</h1>
        </div>
        <button
          onClick={() => setShowActivity(!showActivity)}
          className="bg-blue-700 hover:bg-blue-600 px-4 py-1.5 rounded-lg text-sm font-medium"
        >
          📋 Activity
        </button>
      </nav>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 p-6 overflow-x-auto">

          {/* Columns */}
          {board.columns
            .sort((a, b) => a.order - b.order)
            .map((column) => (
              <div
                key={column._id}
                className="bg-gray-100 rounded-xl w-72 flex-shrink-0 p-3 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center mb-1">
                  <h2 className="font-semibold text-gray-700 text-sm">
                    {column.name}
                  </h2>
                  <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                    {getColumnCards(column._id).length}
                  </span>
                </div>

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

                {activeColumn === column._id ? (
                  <form
                    onSubmit={(e) => handleAddCard(e, column._id)}
                    className="flex flex-col gap-2 mt-1"
                  >
                    <input
                      autoFocus
                      type="text"
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      placeholder="Card title..."
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveColumn(null)}
                        className="flex-1 bg-gray-200 text-gray-700 py-1.5 rounded-lg text-sm hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setActiveColumn(column._id)}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg py-1.5 text-sm transition w-full text-left px-2"
                  >
                    + Add a card
                  </button>
                )}
              </div>
            ))}

          {/* Add Column — OUTSIDE the map */}
          <div className="flex-shrink-0 w-72">
            {showAddColumn ? (
              <form
                onSubmit={handleAddColumn}
                className="bg-gray-100 rounded-xl p-3 flex flex-col gap-2"
              >
                <input
                  autoFocus
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Column name..."
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddColumn(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-1.5 rounded-lg text-sm hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddColumn(true)}
                className="w-full bg-blue-600 bg-opacity-30 hover:bg-opacity-50 text-white rounded-xl py-3 text-sm font-semibold transition"
              >
                + Add Column
              </button>
            )}
          </div>

        </div>
      </DndContext>

      {/* Activity Panel */}
      {showActivity && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-40 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="font-bold text-gray-800">Activity Log</h2>
            <button
              onClick={() => setShowActivity(false)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {activities.length === 0 ? (
              <p className="text-gray-400 text-sm text-center mt-4">
                No activity yet
              </p>
            ) : (
              activities.map((activity) => (
                <div key={activity._id} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {activity.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">{activity.user?.name}</span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
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