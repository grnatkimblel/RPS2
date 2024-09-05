const logger = require("../utils/logger");
const db = require("../models");

const menuServer = require("./menuServer");
const authServer = require("./authServer");
const gameControllerServer = require("./gameControllerServer");

const MENU_PORT = process.env.MENU_PORT || 8080;
const AUTH_PORT = process.env.AUTH_PORT || 8100;
const GAME_CONTROLLER_PORT = process.env.GAME_CONTROLLER_PORT || 8200;

dbSyncParam = process.env.NODE_ENV == "test" ? { force: true } : {};

db.sequelize.sync(dbSyncParam).then(() => {
  menuServer.listen(MENU_PORT, () => {
    logger.info(`listening on port http://localhost:${MENU_PORT}`);
  });
});

db.sequelize.sync(dbSyncParam).then(() => {
  authServer.listen(AUTH_PORT, () => {
    logger.info(`listening on port http://localhost:${AUTH_PORT}`);
  });
});

db.sequelize.sync(dbSyncParam).then(() => {
  gameControllerServer.listen(GAME_CONTROLLER_PORT, () => {
    logger.info(`listening on port http://localhost:${GAME_CONTROLLER_PORT}`);
  });
});
