const express = require("express");
const app = express();
const env = require("dotenv").config();
const port = process.env.PORT || 3000;
const host = process.env.HOST;
const MongoClient = require("mongodb").MongoClient;
const mongodb = require("./database/connect");
const authController = require("./controllers/auth");
const utilities = require("./utilities/");
const cookieParser = require("cookie-parser");
const session = require("express-session");

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);

app.use(express.json()).use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(authController.verifyToken);

app.get("/auth", utilities.handleErrors(authController.getGoogleAuthURL));
app.get("/auth/callback", utilities.handleErrors(authController.handleGoogleCallback));

app.use("/", require("./routes"));

mongodb.initDb((err) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(port);
    console.log(`Connected to Database and listening on ${host}:${port}`);
  }
});
