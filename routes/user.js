const express = require("express");
const User = require("../controller/user");
const Check = require("../middleware/check");
const router = express.Router();

router.get("/rateList", Check, User.getRateList);
router.get("/profile", Check, User.getProfile);
router.post("/addGroupOrCommittee", Check, User.addGroupOrCommittee);
router.get("/partInfo", Check, User.getPartInfo);
router.post("/login", User.login);
router.get("/logout", Check, User.logout);
router.post("/uploadCaptainImg", Check, User.uploadCaptainImg);
module.exports = router;
