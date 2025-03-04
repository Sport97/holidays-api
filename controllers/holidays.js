const mongodb = require("../database/connect");
const holidaysController = {};
const { ObjectId } = require("mongodb");

holidaysController.getHolidays = async (req, res) => {
  try {
    const db = mongodb.getDb();
    const result = await db.collection("holidays").find().toArray();

    const filteredResult = result.map(({ createdBy, ...holiday }) => holiday);

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(filteredResult);
  } catch (error) {
    console.error("Error fetching holidays:", error);
    res.status(500).json({ error: "Failed to fetch holidays" });
  }
};

holidaysController.getHolidayByID = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const db = mongodb.getDb();
    const result = await db.collection("holidays").findOne({ _id: new ObjectId(id) });
    if (!result) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    const { createdBy, ...holiday } = result;

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(holiday);
  } catch (error) {
    console.error("Error fetching holiday by ID:", error);
    res.status(500).json({ error: "Failed to fetch holiday" });
  }
};

holidaysController.createHoliday = async (req, res) => {
  try {
    const holidayInfo = {
      name: req.body.name,
      date: req.body.date,
      country: req.body.country,
      type: req.body.type,
      description: req.body.description,
      isPublicHoliday: req.body.isPublicHoliday,
      traditions: Array.isArray(req.body.traditions) ? req.body.traditions : [req.body.traditions],
      createdBy: req.user.email
    };

    const db = mongodb.getDb();
    const result = await db.collection("holidays").insertOne(holidayInfo);

    if (result.acknowledged) {
      res.status(201).json({
        ...holidayInfo,
        _id: result.insertedId,
        message: "New holiday created successfully."
      });
      console.log({ result, message: "New holiday created successfully." });
    }
  } catch (error) {
    console.error("Error making new holiday:", error);
    res.status(500).json({ error: "Failed to create holiday." });
  }
};

holidaysController.updateHoliday = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const db = mongodb.getDb();
    const holiday = await db.collection("holidays").findOne({ _id: new ObjectId(id) });

    if (!holiday) {
      return res.status(404).json({ error: "Holiday not found." });
    }

    if (holiday.createdBy !== req.user.email) {
      return res.status(403).json({ error: "You can only update holidays you created." });
    }

    const holidayInfo = {
      name: req.body.name,
      date: req.body.date,
      country: req.body.country,
      type: req.body.type,
      description: req.body.description,
      isPublicHoliday: req.body.isPublicHoliday,
      traditions: Array.isArray(req.body.traditions) ? req.body.traditions : [req.body.traditions],
      createdBy: holiday.createdBy
    };
    const result = await db
      .collection("holidays")
      .replaceOne({ _id: new ObjectId(id) }, holidayInfo);

    if (result.modifiedCount > 0) {
      res.status(204).send();
      console.log({ upsertedId: id, message: "Updated holiday information." });
    }
  } catch (error) {
    console.error("Error updating holiday:", error);
    res.status(500).json({ error: "Failed to update holiday." });
  }
};

holidaysController.deleteHoliday = async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const db = mongodb.getDb();
    const holiday = await db.collection("holidays").findOne({ _id: new ObjectId(id) });

    if (!holiday) {
      return res.status(404).json({ error: "Holiday not found." });
    }

    if (holiday.createdBy !== req.user.email) {
      return res.status(403).json({ error: "You can only delete holidays you created." });
    }

    const result = await db.collection("holidays").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount > 0) {
      res.status(200).json({ ...result, deletedId: id, message: "Holiday removed." });
      console.log({ result, deletedId: id, message: "Holiday removed." });
    }
  } catch (error) {
    console.error("Error deleting holiday:", error);
    res.status(500).json({ error: "Failed to delete holiday." });
  }
};

module.exports = holidaysController;
