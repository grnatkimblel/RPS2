/*
This custom hook is supposed to remove alot of socket code from the arenas. useSocket will still be responsible for socket lifecycles.
This hook will be responsible for the socket event registration and cleanup.

*/

import useSocket from "./useSocket";
import { useEffect, useState } from "react";

export default function useGameConnection(socket, subscriptionDetails, gameInfo) {
  useEffect(() => {
    if (socket?.connected) {
      let unsubscribeSocket = subscriptionDetails.subscribeSocketFunction(socket);
      socket.emit(subscriptionDetails.eventName, gameInfo);
      return () => {
        console.log("Unsubscribing socket");
        unsubscribeSocket();
      };
    }
  }, [socket?.connected]);
  return socket;
}
