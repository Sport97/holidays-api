const accountController = {};
const dotenv = require("dotenv");
dotenv.config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getDb } = require("../database/connect");
const JWT_SECRET = process.env.JWT_SECRET;

accountController.signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const db = getDb();
    const user = await db.collection("users").findOne({ email });

    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("users").insertOne({ email, password: hashedPassword });

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
    const db = getDb();
    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "10m" });
    req.session.user = user;
    req.session.token = token;

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

accountController.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
};

accountController.getAccount = async (req, res) => {
  try {
    const user = req.user || req.session.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Login first." });
    }

    const accountInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt
    };

    res.json({ message: "Account Information", user: accountInfo });
  } catch (error) {
    console.error("Error in account:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to retrieve account information." });
    }
  }
};

module.exports = accountController;
