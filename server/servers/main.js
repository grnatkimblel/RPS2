import logger from "../utils/logger.js";
import db from "../models/index.js";

import menuServer from "./menuServer.js";
import authServer from "./authServer.js";
import gameControllerServer from "./gameControllerServer.js";

const MENU_PORT = process.env.MENU_PORT || 3100;
const AUTH_PORT = process.env.AUTH_PORT || 3200;
const GAME_CONTROLLER_PORT = process.env.GAME_CONTROLLER_PORT || 3300;

db.sync()
  .then(() => {
    menuServer.listen(MENU_PORT, () => {
      logger.info(`listening on port http://server:${MENU_PORT}`);
    });

    authServer.listen(AUTH_PORT, () => {
      logger.info(`listening on port http://server:${AUTH_PORT}`);
    });

    gameControllerServer.listen(GAME_CONTROLLER_PORT, () => {
      logger.info(`listening on port http://server:${GAME_CONTROLLER_PORT}`);
    });
  })
  .catch((error) => {
    logger.error("Failed to start servers due to database sync error:", error);
    process.exit(1);
  });
