const express = require("express");
const router = new express.Router();
const authController = require("../controllers/auth");
const utilities = require("../utilities/");

router.get(
  "/auth",
  utilities.handleErrors(async (req, res, next) => {
    /*
          #swagger.auto = false
          #swagger.path = '/auth'
          #swagger.method = 'get'
          #swagger.summary = 'Login via Google OAuth'
          #swagger.description = '${process.env.SWAGGER_SCHEMES}://${process.env.SWAGGER_HOST}/auth'
          #swagger.responses[302] = {
              description: 'Redirects to Google OAuth'
          }
          #swagger.responses[401] = {
              description: 'Unauthorized'
          }
      */
    await authController.getGoogleAuthURL(req, res, next);
  })
);

module.exports = router;
