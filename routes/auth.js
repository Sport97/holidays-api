const express = require("express");
const router = new express.Router();
const authController = require("../controllers/auth");
const utilities = require("../utilities/");

/**
 * @swagger
 * /auth:
 *   get:
 *     summary: Get Google OAuth URL
 *     description: Returns the Google OAuth URL to start the login flow.
 *     responses:
 *       200:
 *         description: Successfully generated Google OAuth URL
 *         content:
 *           application/json:
 *             example:
 *               authUrl: "https://accounts.google.com/o/oauth2/auth?client_id=..."
 *       500:
 *         description: Failed to generate Google auth URL
 */

router.get("/auth", utilities.handleErrors(authController.getGoogleAuthURL));

/**
 * @swagger
 * /auth/callback:
 *   get:
 *     summary: Google OAuth Callback
 *     description: Handles Google OAuth callback, generates JWT, and returns user information.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *     responses:
 *       200:
 *         description: Login Successful
 *         content:
 *           application/json:
 *             example:
 *               message: "Login successful"
 *               user:
 *                 email: "testuser@gmail.com"
 *               token: "JWT_TOKEN_HERE"
 *       400:
 *         description: Authorization code is missing
 *       500:
 *         description: Google OAuth failed
 */

router.get("/auth/callback", utilities.handleErrors(authController.handleGoogleCallback));

module.exports = router;
