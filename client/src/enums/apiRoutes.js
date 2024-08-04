const API_ROUTES = {
  LOGIN: "http://localhost:8100/api/auth/login",
  LOGOUT: "http://localhost:8080/api/menu/user/logout",
  REGISTER: "http://localhost:8080/menu/api/user/createUser",
  REFRESH_ACCESS_TOKEN: "http://localhost:8100/api/auth/token",
  GET_USERS: "http://localhost:8080/api/menu/user/getUsers",
  MATCHMAKING: {
    ADD_PLAYER: "http://localhost:8080/api/menu/matchmaking/addPlayer",
    REMOVE_PLAYER: "http://localhost:8080/api/menu/matchmaking/removePlayer",
    SEARCH: {
      CHECK_INVITE:
        "http://localhost:8080/api/menu/matchmaking/quickplay/quickdraw/search/checkInvite",
    },
  },
  GAME: {
    QUICKDRAW: {
      PREGAME: "http://localhost:8200/api/game/quickdraw/pregame",
      START_GAME: "http://localhost:8200/api/game/quickplay/startGame",
      RUN: "http://localhost:8200/api/game/quickplay/run",
    },
  },
};

export default API_ROUTES;
