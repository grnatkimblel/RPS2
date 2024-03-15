import { io } from "socket.io-client";
const SOCKET_SERVER_URL = "http://localhost:8200";
// "undefined" means the URL will be computed from the `window.location` object
const URL =
  process.env.NODE_ENV === "production" ? undefined : SOCKET_SERVER_URL;

export const socket = io(URL);
