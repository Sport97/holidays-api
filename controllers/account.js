const accountController = {};
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongodb = require("../database/connect");
const JWT_SECRET = process.env.JWT_SECRET;
const { ObjectId } = require("mongodb");

accountController.getAccount = async (req, res) => {
  try {
    const user = req.user || req.session.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Login first." });
    }

    const accountInfo = {
      email: user.email
    };

    res.json({ message: "Account Information", user: accountInfo });
  } catch (error) {
    console.error("Error in account:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to retrieve account information." });
    }
  }
};

accountController.signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const db = mongodb.getDb();
    const user = await db.collection("users").findOne({ email });

    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("users").insertOne({ provider: "manual", email, password: hashedPassword });

    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

accountController.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const db = mongodb.getDb();
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    req.session.user = user;
    req.session.token = token;

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

accountController.updateEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const newEmail = req.body.email;
    const loggedInEmail = req.user.email;

    if (!email) {
      return res.status(400).json({ error: "Email is required in the URL." });
    }

    if (email !== loggedInEmail) {
      return res.status(403).json({ error: "Incorrect email." });
    }

    if (!newEmail) {
      return res.status(400).json({ error: "New email is required." });
    }

    const db = mongodb.getDb();
    const user = await db.collection("users").findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.provider !== "manual") {
      return res.status(403).json({ error: "Email can only be updated for manual accounts." });
    }

    const result = await db
      .collection("users")
      .updateOne({ email: email }, { $set: { email: newEmail } });

    if (result.modifiedCount > 0) {
      console.log({ email, message: "Updated account email." });
      return res.status(204).send();
    }

    res.status(200).json({ message: "No changes made." });
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({ error: "Failed to update account." });
  }
};

accountController.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
};

module.exports = accountController;
