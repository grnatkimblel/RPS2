import { io } from "socket.io-client";

export const gameControllerSocket = io("http://localhost:8200", {
  autoConnect: false,
  transports: ["websocket"],
  auth: {},
});
