//connect to a socket using access and request tokens, return the socket.
import { Socket, io } from "socket.io-client";
import { useState, useEffect } from "react";
import { getNewAccessToken } from "../helper";

const SOCKET_SERVER_URL = "http://localhost:8200";

export default function useSocket(refreshToken, isConnected) {
  const [socket, setSocket] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    if (isConnected) {
      const initializeSocket = async () => {
        try {
          const newAccessToken = await getNewAccessToken(refreshToken);
          console.log("newAccessToken: ", newAccessToken);

          //get new socket instance with fresh access
          const newSocket = await io(SOCKET_SERVER_URL, {
            autoConnect: false, // autoConnect disabled
            transports: ["websocket"],
            auth: { token: newAccessToken },
          });
          console.log("newSocket");
          console.log(newSocket);

          //On Socket Connect Events
          newSocket.on("connect", () => {
            console.log("Socket connected To Server");
            setIsSocketConnected(true);
          });
          newSocket.on("disconnect", () => {
            console.log("Socket disconnected To Server");
          });

          newSocket.connect(); //this is not instantaneous
          setSocket(newSocket);
        } catch (error) {
          console.error("Error initializing socket:", error);
        }
      };
      initializeSocket();
    } else {
      if (socket?.connected) {
        socket.off("connect");
        socket.off("disconnect");
        socket.disconnect();
        setSocket(null);
      }
    }
    return () => {
      console.log("SocketCleanup");
      if (socket) {
        console.log("SocketCleanup actually");
        socket.off("connect");
        socket.off("disconnect");
        socket.disconnect();
        setIsSocketConnected(false);
      }
    };
  }, [refreshToken, isConnected]);

  return isSocketConnected ? socket : null;
}
