const express = require("express");
const Impression = require("../controller/impression");
const Check = require("../middleware/check");
const router = express.Router();

router.get("/getImpression", Check, Impression.getImpressionList);
router.post("/update", Check, Impression.updateImpression);
module.exports = router;
