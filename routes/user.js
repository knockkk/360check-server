const express = require("express");
const Student = require("../controller/user");

const router = express.Router();
/* GET home page. */
router.get("/getAll", Student.getAll);

module.exports = router;
