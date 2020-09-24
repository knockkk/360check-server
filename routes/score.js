const express = require("express");
const Score = require("../controller/score");
const router = express.Router();

router.post("/update", Score.updateScore);
module.exports = router;
