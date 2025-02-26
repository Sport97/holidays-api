const express = require("express");
const router = new express.Router();
const authController = require("../controllers/auth");
const utilities = require("../utilities/");

router.get("/auth", utilities.handleErrors(authController.getGoogleAuthURL));

router.get("/auth/callback", utilities.handleErrors(authController.handleGoogleCallback));

module.exports = router;
