const API_ROUTES = {
  LOGIN: import.meta.env.VITE_HOST_URL + "api/auth/login",
  GUEST_LOGIN: import.meta.env.VITE_HOST_URL + "api/auth/guestLogin",
  LOGOUT: import.meta.env.VITE_HOST_URL + "api/menu/user/logout",
  REGISTER: import.meta.env.VITE_HOST_URL + "api/menu/user/createUser",
  REFRESH_ACCESS_TOKEN: import.meta.env.VITE_HOST_URL + "api/auth/token",
  GET_USERS: import.meta.env.VITE_HOST_URL + "api/menu/user/getUsers",
  MATCHMAKING: {
    ADD_PLAYER: import.meta.env.VITE_HOST_URL + "api/menu/matchmaking/addPlayer",
    REMOVE_PLAYER: import.meta.env.VITE_HOST_URL + "api/menu/matchmaking/removePlayer",
    SEARCH: {
      CHECK_INVITE: import.meta.env.VITE_HOST_URL + "api/menu/matchmaking/search/checkInvite",
    },
  },
  GAME: {
    QUICKDRAW: {
      PING: import.meta.env.VITE_HOST_URL + "api/game/quickdraw/ping",
      PREGAME: import.meta.env.VITE_HOST_URL + "api/game/quickdraw/pregame",
      START_GAME: import.meta.env.VITE_HOST_URL + "api/game/quickdraw/startGame",
      RUN: import.meta.env.VITE_HOST_URL + "api/game/quickdraw/run",
    },
    TDM: {
      PREGAME: import.meta.env.VITE_HOST_URL + "api/game/tdm/pregame",
    },
  },
} as const;

export default API_ROUTES;
