import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import process from "process";
import { fileURLToPath } from "url";

// Determine the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";

// Load config
const config = (
  await import(path.join(__dirname, "../config/config.json"), {
    assert: { type: "json" },
  })
).default[env];

const db = {};

//Initalize Sequelize
let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

if (env === "production") {
  sequelize = new Sequelize({
    username: "produser",
    password: process.env.MYSQL_PASSWORD_FILE,
    database: "database_production",
    host: "db-prod",
    dialect: "mysql",
  });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Read all files in the current directory and import models dynamically
const modelFiles = fs.readdirSync(__dirname).filter((file) => {
  return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js" && !file.includes(".test.js");
});

for (const file of modelFiles) {
  const modelImportPath = path.join(__dirname, file);
  const { default: model } = await import(modelImportPath);

  // Initialize and assign the model to the db object
  const initializedModel = model(sequelize, Sequelize.DataTypes);
  db[initializedModel.name] = initializedModel;
}

// Call associate methods if defined
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
