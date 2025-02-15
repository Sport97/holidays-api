const { body, validationResult } = require("express-validator");
const { getCode } = require("country-list");

const validate = {};

validate.holidayRules = () => {
  return [
    body("name").trim().escape().notEmpty().withMessage("Name is required."),

    body("date")
      .trim()
      .notEmpty()
      .isDate()
      .withMessage("A valid date is required. Accepted format: YYYY-MM-DD."),

    body("country")
      .trim()
      .escape()
      .notEmpty()
      .custom((value) => {
        const lowerValue = value.trim().toLowerCase();
        if (lowerValue === "united states" || lowerValue === "global" || getCode(value)) {
          return true;
        }
        throw new Error("Invalid country. Use a valid full country name or Global.");
      }),

    body("type")
      .trim()
      .escape()
      .notEmpty()
      .withMessage(
        "Type is required. Examples: Cultural, National, Public, Personal, Religious, etc."
      ),

    body("description").trim().escape().notEmpty().withMessage("Description is required."),

    body("isPublicHoliday")
      .notEmpty()
      .isBoolean()
      .toBoolean()
      .withMessage("Invalid isPublicHoliday. Only true or false are allowed."),

    body("traditions")
      .notEmpty()
      .customSanitizer((value) => (Array.isArray(value) ? value : [value]))
      .custom((value) => {
        if (Array.isArray(value) && value.length >= 2) {
          return true;
        }
        throw new Error(
          "At least two traditions are required. Example: ['Tradition1', 'Tradition2']."
        );
      })
  ];
};

validate.checkHolidayData = async (req, res, next) => {
  holidayInfo = {
    name: req.body.name,
    date: req.body.date,
    country: req.body.country,
    type: req.body.type,
    description: req.body.description,
    isPublicHoliday: req.body.isPublicHoliday,
    traditions: Array.isArray(req.body.traditions) ? req.body.traditions : [req.body.traditions]
  };

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const simplifiedErrors = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: simplifiedErrors });
  }
  next();
};

module.exports = validate;
