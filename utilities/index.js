const env = require("dotenv").config();
const Util = {};
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

Util.handleErrors = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

Util.verifyAccess = (req, res, next) => {
  if (req.session && req.session.token) {
    jwt.verify(req.session.token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized access" });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: "Unauthorized access" });
  }
};

module.exports = Util;
