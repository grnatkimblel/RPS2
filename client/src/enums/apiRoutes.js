const API_ROUTES = {
  LOGIN: "http://localhost:8100/user/login",
  LOGOUT: "http://localhost:8080/user/logout",
  REGISTER: "http://localhost:8080/user/createUser",
  REFRESH_ACCESS_TOKEN: "http://localhost:8100/user/token",
  GET_USERS: "http://localhost:8080/user/getUsers",
  MATCHMAKING: {
    ADD_PLAYER: "http://localhost:8080/matchmaking/addPlayer",
    REMOVE_PLAYER: "http://localhost:8080/matchmaking/removePlayer",
    SEARCH: {
      CHECK_INVITE:
        "http://localhost:8080/matchmaking/quickplay/quickdraw/search/checkInvite",
    },
  },
};

export default API_ROUTES;
