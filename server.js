const express = require("express");
const app = express();
const env = require("dotenv").config();
const port = process.env.PORT || 3000;
const host = process.env.HOST;
const MongoClient = require("mongodb").MongoClient;
const mongodb = require("./database/connect");
const utilities = require("./utilities/");
const cookieParser = require("cookie-parser");
const session = require("express-session");

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
  })
);

app.use(express.json()).use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

mongodb.initDb((err) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log("Database Initialized");
  const authController = require("./controllers/auth");
  authController.loadCredentials();
  app.get("/auth/callback", utilities.handleErrors(authController.handleGoogleCallback));
  app.use("/", require("./routes"));
  app.listen(port);
  console.log(`Connected to Database and listening on ${host}:${port}`);
});
