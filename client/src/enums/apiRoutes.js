const API_ROUTES = {
  LOGIN: "http://localhost:8100/userAuth/login",
  LOGOUT: "http://localhost:8080/user/logout",
  REGISTER: "http://localhost:8080/user/createUser",
  REFRESH_ACCESS_TOKEN: "http://localhost:8100/userAuth/token",
  GET_USERS: "http://localhost:8080/user/getUsers",
  MATCHMAKING: {
    ADD_PLAYER: "http://localhost:8080/matchmaking/addPlayer",
    REMOVE_PLAYER: "http://localhost:8080/matchmaking/removePlayer",
    SEARCH: {
      CHECK_INVITE:
        "http://localhost:8080/matchmaking/quickplay/quickdraw/search/checkInvite",
    },
  },
  GAME: {
    QUICKDRAW: {
      PREGAME: "http://localhost:8200/game/quickdraw/pregame",
      START_GAME: "http://localhost:8200/game/quickplay/startGame",
      RUN: "http://localhost:8200/game/quickplay/run",
    },
  },
};

export default API_ROUTES;
