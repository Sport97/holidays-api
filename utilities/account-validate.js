const { body, validationResult } = require("express-validator");

const validate = {};

validate.signupRules = () => {
  return [
    body("email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    body("password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
      })
      .withMessage(
        "Password must be at least 6 characters and contain at least 1 number, 1 capital letter and 1 special character"
      )
  ];
};

validate.checkSignUpData = async (req, res, next) => {
  const { email } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const simplifiedErrors = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: simplifiedErrors });
  }
  next();
};

validate.loginRules = () => {
  return [
    body("email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    body("password").trim().notEmpty().withMessage("Password required.")
  ];
};

validate.checkLoginData = async (req, res, next) => {
  const { email } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const simplifiedErrors = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: simplifiedErrors });
  }
  next();
};

validate.updateRules = () => {
  return [
    body("email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
  ];
};

validate.checkUpdateData = async (req, res, next) => {
  const { email } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const simplifiedErrors = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: simplifiedErrors });
  }
  next();
};

module.exports = validate;
