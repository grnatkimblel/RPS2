import fs from "fs";
// import path from "path"

// Load .env in development only
if (process.env.NODE_ENV !== "production") {
  const dotenv = await import("dotenv");
  dotenv.config();
}

function getEnvVar(name) {
  const value = process.env[name];
  if (!value) {
    return false;
  }

  // Check if the value looks like a file path (starts with '/' and exists as a file)
  if (value.startsWith("/") && fs.existsSync(value)) {
    try {
      return fs.readFileSync(value, "utf8").trim();
    } catch (err) {
      throw new Error(`Failed to read secret file ${value}: ${err.message}`);
    }
  }

  // If not a file path, return the value as-is
  return value;
}

// Export your environment variables
export default {
  jwtAccessTokenSecret: getEnvVar("JWT_ACCESS_TOKEN_SECRET"),
  jwtRefreshTokenSecret: getEnvVar("JWT_REFRESH_TOKEN_SECRET"),
  mysqlPassword: await getEnvVar("MYSQL_PASSWORD_FILE"),

  // Add other variables as needed
};
