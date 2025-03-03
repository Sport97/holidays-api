const express = require("express");
const router = new express.Router();
const holidaysController = require("../controllers/holidays");
const utilities = require("../utilities/");
const validate = require("../utilities/validate");

router.get(
  "/holidays",
  utilities.verifyAccess,
  utilities.handleErrors(holidaysController.getHolidays)
);
router.get(
  "/holidays/:id",
  utilities.verifyAccess,
  utilities.handleErrors(holidaysController.getHolidayByID)
);

router.post(
  "/holidays",
  utilities.verifyAccess,
  validate.holidayRules(),
  validate.checkHolidayData,
  utilities.handleErrors(holidaysController.createHoliday)
);

router.put(
  "/holidays/:id",
  utilities.verifyAccess,
  validate.holidayRules(),
  validate.checkHolidayData,
  utilities.handleErrors(holidaysController.updateHoliday)
);

router.delete(
  "/holidays/:id",
  utilities.verifyAccess,
  utilities.handleErrors(holidaysController.deleteHoliday)
);

module.exports = router;
