import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore.js";
import useBoardStore from "../store/boardStore.js";
import toast from "react-hot-toast";
function Dashboard() {
  const { user, logout } = useAuthStore();
  const { orgs, boards, loading, getOrgs, createOrg, getBoards, createBoard ,deleteBoard} = useBoardStore();
  const navigate = useNavigate();

  const [selectedOrg, setSelectedOrg] = useState(null);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [boardName, setBoardName] = useState("");
  

  useEffect(() => {
    getOrgs();
  }, []);

  useEffect(() => {
    if (selectedOrg) getBoards(selectedOrg._id);
  }, [selectedOrg]);

  const handleCreateOrg = async (e) => {
  e.preventDefault();
  const org = await createOrg(orgName);
  if (org) {
    toast.success("Workspace created! 🎉");
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
    toast.success("Board created! 🚀");
    setBoardName("");
    setShowBoardModal(false);
  } else {
    toast.error("Failed to create board");
  }
};

  const handleLogout = async () => {
  await logout();
  toast.success("Logged out successfully");
  navigate("/login");
};


const handleDeleteBoard = async (e, boardId) => {
  e.stopPropagation();
  if (!confirm("Delete this board? This cannot be undone.")) return;
  const success = await deleteBoard(selectedOrg._id, boardId);
  if (success) {
    toast.success("Board deleted!");
  } else {
    toast.error("Failed to delete board");
  }
};

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">Trellis</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">👋 {user?.name}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar - Orgs */}
        <div className="w-64 bg-white shadow-md p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-gray-700">Workspaces</h2>
            <button
              onClick={() => setShowOrgModal(true)}
              className="text-blue-600 text-xl font-bold hover:text-blue-800"
            >
              +
            </button>
          </div>

          {orgs.length === 0 && (
            <p className="text-gray-400 text-sm">No workspaces yet</p>
          )}

          {orgs.map((org) => (
            <button
              key={org._id}
              onClick={() => setSelectedOrg(org)}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                selectedOrg?._id === org._id
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {org.name}
            </button>
          ))}
        </div>

        {/* Main content - Boards */}
        <div className="flex-1 p-6">
          {!selectedOrg ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-lg">
                Select or create a workspace to get started
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedOrg.name}
                </h2>
                <button
                  onClick={() => setShowBoardModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  + New Board
                </button>
              </div>

              {loading ? (
                <p className="text-gray-400">Loading boards...</p>
              ) : boards.length === 0 ? (
                <p className="text-gray-400">No boards yet — create one!</p>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {boards.map((board) => (
  <div
    key={board._id}
    onClick={() => navigate(`/board/${board._id}`)}
    className="bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-md transition relative group"
  >
    <button
      onClick={(e) => handleDeleteBoard(e, board._id)}
      className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition text-lg"
    >
      🗑️
    </button>
    <h3 className="font-semibold text-gray-800">{board.name}</h3>
    <p className="text-sm text-gray-500 mt-1">
      {board.description || "No description"}
    </p>
    <span className="text-xs text-blue-500 mt-2 block">
      {board.visibility}
    </span>
  </div>
))}
                  
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Org Modal */}
      {showOrgModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold mb-4">Create Workspace</h2>
            <form onSubmit={handleCreateOrg} className="flex flex-col gap-3">
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Workspace name"
                required
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowOrgModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold mb-4">Create Board</h2>
            <form onSubmit={handleCreateBoard} className="flex flex-col gap-3">
              <input
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                placeholder="Board name"
                required
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowBoardModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200"
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