import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a board room
    socket.on("join_board", (boardId) => {
      socket.join(boardId);
      console.log(`Socket ${socket.id} joined board ${boardId}`);
    });

    // Leave a board room
    socket.on("leave_board", (boardId) => {
      socket.leave(boardId);
    });

    // Card moved
    socket.on("card_moved", (data) => {
      socket.to(data.boardId).emit("card_moved", data);
    });

    // Card created
    socket.on("card_created", (data) => {
      socket.to(data.boardId).emit("card_created", data);
    });

    // Card updated
    socket.on("card_updated", (data) => {
      socket.to(data.boardId).emit("card_updated", data);
    });

    // Card deleted
    socket.on("card_deleted", (data) => {
      socket.to(data.boardId).emit("card_deleted", data);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};