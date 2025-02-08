const express = require("express");
const router = new express.Router();
const holidaysController = require("../controllers/holidays");

router.get("/holidays", holidaysController.getHolidays);
router.get("/holidays/:id", holidaysController.getHolidayByID);

router.post("/holidays", holidaysController.createHoliday);

router.put("/holidays/:id", holidaysController.updateHoliday);

router.delete("/holidays/:id", holidaysController.deleteHoliday);

module.exports = router;
