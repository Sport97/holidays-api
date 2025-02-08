const express = require("express");
const router = new express.Router();

router.get("/", require("../controllers/index").buildIndex);

router.use("/", require("./api-docs"));
router.use("/", require("./holidays"));

module.exports = router;
