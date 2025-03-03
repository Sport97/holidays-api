const express = require("express");
const router = express.Router();
const accountController = require("../controllers/account");
const utilities = require("../utilities/");

router.get("/account", utilities.handleErrors(accountController.getAccount));

router.post("/account/signup", accountController.signup);
router.post("/account/login", accountController.login);
router.get("/account/logout", accountController.logout);

module.exports = router;
