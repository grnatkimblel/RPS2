import path from "path";
import process from "process";
import { fileURLToPath } from "url";

import RefreshToken from "./RefreshToken.js";
import User from "./User.js";
import QuickdrawGameHeader from "./QuickdrawGameHeader.js";
import QuickdrawRound from "./QuickdrawRound.js";
import QuickdrawAction from "./QuickdrawAction.js";

import Sequelize from "sequelize";
import logger from "../utils/logger.js";
import secrets from "../helper/secrets.js";

// Determine the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const basename = path.basename(__filename);

const env = process.env.NODE_ENV || "development";
const db = {};

//Initalize Sequelize
let sequelize;
if (env === "production") {
  sequelize = new Sequelize({
    username: "produser",
    password: secrets.mysqlPassword,
    database: "database_production",
    host: "db-prod",
    dialect: "mysql",
    logging: false, // customize with https://sequelize.org/docs/v6/getting-started/
  });
} else {
  // Load config
  const config = (
    await import(path.join(__dirname, "../config/config.json"), {
      assert: { type: "json" },
    })
  ).default[env];
  sequelize = new Sequelize({ ...config });
}

try {
  await sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

const models = {
  RefreshToken: RefreshToken(sequelize, Sequelize.DataTypes),
  User: User(sequelize, Sequelize.DataTypes),
  QuickdrawGameHeader: QuickdrawGameHeader(sequelize, Sequelize.DataTypes),
  QuickdrawRound: QuickdrawRound(sequelize, Sequelize.DataTypes),
  QuickdrawAction: QuickdrawAction(sequelize, Sequelize.DataTypes),
};

// Call associate methods if defined
Object.keys(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
    logger.info(`Associations set for model: ${model.name}`);
  }
});

let dbSyncParam;
if (process.env.NODE_ENV == "test") dbSyncParam = { force: true };
else dbSyncParam = {};

const syncDatabase = async () => {
  try {
    if (dbSyncParam.force) {
      await models.RefreshToken.drop();
      logger.info("Dropped table: RefreshTokens");
      await models.QuickdrawAction.drop();
      logger.info("Dropped table: QuickdrawActions");
      await models.QuickdrawRound.drop();
      logger.info("Dropped table: QuickdrawRounds");
      await models.QuickdrawGameHeader.drop();
      logger.info("Dropped table: QuickdrawGameHeaders");
      await models.User.drop();
      logger.info("Dropped table: Users");
    }

    await models.RefreshToken.sync(dbSyncParam);
    logger.info("Synchronized model: RefreshToken");
    await models.User.sync(dbSyncParam);
    logger.info("Synchronized model: User");
    await models.QuickdrawGameHeader.sync(dbSyncParam);
    logger.info("Synchronized model: QuickdrawGameHeader");
    await models.QuickdrawRound.sync(dbSyncParam);
    logger.info("Synchronized model: QuickdrawRound");
    await models.QuickdrawAction.sync(dbSyncParam);
    logger.info("Synchronized model: QuickdrawAction");
  } catch (error) {
    logger.error("Error synchronizing models:", error);
    throw error; // Crash if sync fails
  }
};

db.sequelize = sequelize;
db.models = models;
db.sync = syncDatabase;

export default db;
