const express = require("express");
const router = express.Router();

router.get("/ping", (req, res) => {
  let now = Date.now();
  res.json({
    requestReceived: now,
  });
});

module.exports = router;
