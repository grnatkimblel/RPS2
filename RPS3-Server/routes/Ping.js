import express from "express";
const router = express.Router();

router.get("/ping", (req, res) => {
  let now = Date.now();
  res.json({
    requestReceived: now,
  });
});

export default router;
