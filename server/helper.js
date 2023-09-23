const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "./config", ".env") });

const jwt = require("jsonwebtoken");

//MIDDLEWARE
function authenticateToken(req, res, next) {
  console.log("middleware in use");
  const authHeader = req.headers["authorization"];
  //console.log(req.headers);
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.authUser = user; //to set req for future functions
    //console.log("calling next function");
    next();
  });
}

module.exports.authenticateToken = authenticateToken;
