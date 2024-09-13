const API_ROUTES = Object.freeze({
  LOGIN: process.env.REACT_APP_HOST_URL + "api/auth/login",
  LOGOUT: process.env.REACT_APP_HOST_URL + "api/menu/user/logout",
  REGISTER: process.env.REACT_APP_HOST_URL + "api/menu/user/createUser",
  REFRESH_ACCESS_TOKEN: process.env.REACT_APP_HOST_URL + "api/auth/token",
  GET_USERS: process.env.REACT_APP_HOST_URL + "api/menu/user/getUsers",
  MATCHMAKING: {
    ADD_PLAYER:
      process.env.REACT_APP_HOST_URL + "api/menu/matchmaking/addPlayer",
    REMOVE_PLAYER:
      process.env.REACT_APP_HOST_URL + "api/menu/matchmaking/removePlayer",
    SEARCH: {
      CHECK_INVITE:
        process.env.REACT_APP_HOST_URL +
        "api/menu/matchmaking/quickplay/quickdraw/search/checkInvite",
    },
  },
  GAME: {
    QUICKDRAW: {
      PREGAME: process.env.REACT_APP_HOST_URL + "api/game/quickdraw/pregame",
      START_GAME:
        process.env.REACT_APP_HOST_URL + "api/game/quickdraw/startGame",
      RUN: process.env.REACT_APP_HOST_URL + "api/game/quickdraw/run",
    },
  },
});

export default API_ROUTES;
