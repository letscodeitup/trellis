import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

let socket;

const useSocket = (boardId) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!boardId) return;

    socket = io("http://localhost:5000", {
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.emit("join_board", boardId);

    return () => {
      socket.emit("leave_board", boardId);
      socket.disconnect();
    };
  }, [boardId]);

  return socketRef.current;
};

export default useSocket;