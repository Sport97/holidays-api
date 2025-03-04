const express = require("express");
const router = express.Router();
const accountController = require("../controllers/account");
const utilities = require("../utilities/");
const validate = require("../utilities/account-validate");

router.get("/account", utilities.handleErrors(accountController.getAccount));

router.post(
  "/account/signup",
  validate.signupRules(),
  validate.checkSignUpData,
  accountController.signup
);

router.post(
  "/account/login",
  validate.loginRules(),
  validate.checkLoginData,
  accountController.login
);

router.put(
  "/account/login/:email",
  utilities.verifyAccess,
  validate.updateRules(),
  validate.checkUpdateData,
  accountController.updateEmail
);

router.get("/account/logout", accountController.logout);

module.exports = router;
