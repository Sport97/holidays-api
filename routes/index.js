const express = require("express");
const router = new express.Router();

router.get("/", require("../controllers/index").buildIndex);

router.use("/", require("./account"));
router.use("/", require("./auth"));
router.use("/", require("./holidays"));
router.use("/", require("./api-docs"));

module.exports = router;
