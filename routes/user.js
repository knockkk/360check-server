const express = require("express");
const User = require("../controller/user");
const router = express.Router();

router.get("/getRateList", User.getRateList);
module.exports = router;
