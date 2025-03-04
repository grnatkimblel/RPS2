import dotenv from "dotenv";
import path from "path";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import secrets from "./secrets.js";

// Determine the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../config", ".env") });

//MIDDLEWARE
function authenticateToken(req, res, next) {
  //console.log("middleware in use");

  const authHeader = req.headers["authorization"];
  //console.log(req.headers);
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, secrets.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.authUser = user; //to set req for future functions
    //console.log("calling next function");
    next();
  });
}

export default authenticateToken;
