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
const mongodb = require("../database/connect");

authController.loadCredentials = async () => {
  try {
    let credentials;

    if (process.env.CREDENTIALS_JSON) {
      console.log("Loaded Credentials from Environment Variable");
      const cleanJson = process.env.CREDENTIALS_JSON.replace(/\\n/g, "");
      credentials = JSON.parse(cleanJson);
    } else {
      console.log("Loaded Credentials from File");
      const content = await fs.readFile(CREDENTIALS_PATH, "utf-8");
      credentials = JSON.parse(content);
    }

    return credentials;
  } catch (error) {
    console.error("Failed to load credentials:", error.message);
    throw new Error("Failed to load Google OAuth credentials.");
  }
};

authController.getGoogleAuthURL = async (req, res, next) => {
  try {
    const credentials = await authController.loadCredentials();
    const { client_id, client_secret, redirect_uris } = credentials.installed;
    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    const accessType = req.hostname === "localhost" ? "offline" : "online";

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: accessType,
      scope: SCOPES,
      prompt: "consent",
      redirect_uri: redirect_uris[0]
    });

    console.log("Redirecting to Google Auth...");
    res.redirect(authUrl);

    return next();
  } catch (error) {
    res.status(500).json({ error: "Failed to generate Google auth URL" });
  }
};

authController.handleGoogleCallback = async (req, res, next) => {
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

    console.log("User Authenticated:", data);

    const db = mongodb.getDb();
    const users = db.collection("users");

    const user = await users.findOneAndUpdate(
      { googleId: data.id },
      {
        $set: {
          email: data.email
        }
      },
      { upsert: true, returnDocument: "after" }
    );

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    req.session.user = data;
    req.session.token = token;

    console.log("Session Token Created:", token);

    res.redirect("/api-docs");
  } catch (error) {
    console.error("Error in callback:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Google OAuth failed" });
    }
  }
};

let lastLog = 0;
const throttle = (msg) => {
  if (Date.now() - lastLog > 10000) {
    console.log(msg);
    lastLog = Date.now();
  }
};

authController.verifyToken = (req, res, next) => {
  if (req.session && req.session.token) {
    jwt.verify(req.session.token, JWT_SECRET, (err, user) => {
      if (err) {
        throttle("Invalid token, redirecting to Google Auth...");
        return res.redirect("/auth");
      }
      req.user = user;
      throttle(`Token Verified: ${JSON.stringify(user)}`);
      return next();
    });
  } else {
    throttle("No token found in session, redirecting to Google Auth...");
    res.redirect("/auth");
  }
};

module.exports = authController;
