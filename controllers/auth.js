const authController = {};
const dotenv = require("dotenv");
dotenv.config();
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs").promises;

const SCOPES = ["openid", "profile", "email"];
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const JWT_SECRET = process.env.JWT_SECRET;

authController.loadCredentials = async () => {
  try {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const credentials = JSON.parse(content);
    const redirectUri = process.env.REDIRECT_URI;

    if (redirectUri) {
      credentials.installed.redirect_uris = [redirectUri];
      console.log(`Redirect URI dynamically set: ${redirectUri}`);
    }
    return credentials;
  } catch (error) {
    console.error("Failed to load credentials:", error);
    throw new Error("Failed to load Google OAuth credentials.");
  }
};

authController.getGoogleAuthURL = async (req, res) => {
  try {
    const credentials = await authController.loadCredentials();
    const { client_id, client_secret, redirect_uris } = credentials.installed;
    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    const accessType = req.hostname === "localhost" ? "offline" : "online";

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: accessType,
      scope: SCOPES
    });

    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate Google auth URL" });
  }
};

authController.handleGoogleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "Authorization code is missing" });

    const credentials = await authController.loadCredentials();
    const { client_id, client_secret, redirect_uris } = credentials.installed;

    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    const token = jwt.sign({ id: data.id, email: data.email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", user: data, token });
  } catch (error) {
    console.error("Error in callback:", error);
    res.status(500).json({ error: "Google OAuth failed" });
  }
};

module.exports = authController;
