const express = require("express");
const Impression = require("../controller/impression");
const Check = require("../middleware/check");
const router = express.Router();

router.get("/getImpressionToCaptain", Check, Impression.getImpressionToCaptain);
router.get(
  "/getImpressionForCaptain",
  Check,
  Impression.getImpressionForCaptain
);
router.get("/getImpressionForTutor", Check, Impression.getImpressionForTutor);
router.post("/updateImpression", Check, Impression.updateImpression);
module.exports = router;
