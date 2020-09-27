const express = require("express");
const Score = require("../controller/score");
const Check = require("../middleware/check");
const router = express.Router();

router.post("/update", Check, Score.updateScore);
module.exports = router;
