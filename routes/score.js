const express = require("express");
const Score = require("../controller/score");
const Check = require("../middleware/check");
const ScoreModel = require("../models/score");
const router = express.Router();

router.post("/update", Check, Score.updateScore);
router.get("/getGroupScore", Check, Score.getGroupScore);
router.get("/getFinalScore", Check, Score.getFinalScore);
router.get("/getStars", Check, Score.getStars);
router.get("/getSeedScore", Check, Score.getSeedScore);
module.exports = router;
