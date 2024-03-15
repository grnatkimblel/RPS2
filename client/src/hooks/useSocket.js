//connect to a socket using access and request tokens, return the socket.
import { Socket, io } from "socket.io-client";
import { useState, useEffect } from "react";
import { getNewAccessToken } from "../helper";

const SOCKET_SERVER_URL = "http://localhost:8200";

export default async function useSocket(refreshToken, isConnected) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const newAccessToken = await getNewAccessToken(refreshToken);
        console.log("newAccessToken: ", newAccessToken);

        //get new socket instance with fresh access
        const newSocket = await io(SOCKET_SERVER_URL, {
          autoConnect: false,
          transports: ["websocket"],
          auth: { token: newAccessToken },
        });
        console.log("newSocket: ", newSocket);

        //On Socket Connect Events
        newSocket.on("connect", () => {
          console.log("Socket connected To Server");
        });
        newSocket.on("disconnect", () => {
          console.log("Socket disconnected To Server");
        });
        return newSocket;
      } catch (error) {
        console.error("Error initializing socket:", error);
      }
    };
    if (isConnected) {
      console.log("is connecting is true, socket being set in useSocket");
      initializeSocket().then((socket) => {
        console.log("newSocket: ", socket);
        setSocket(socket);
        socket.connect();
        console.log("socket.connected: " + socket.connected);
      });
    }

    return () => {
      if (socket?.connected) {
        socket.off("connect");
        socket.off("disconnect");
        socket.disconnect();
      }
      setSocket(null);
    };
  }, [refreshToken, isConnected]);

  return socket;
}
