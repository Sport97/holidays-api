const env = require("dotenv").config();
const Util = {};

Util.handleErrors = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
