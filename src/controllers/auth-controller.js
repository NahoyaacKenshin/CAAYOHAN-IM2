const User = require("../models/auth-models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Secret key for JWT
const JWT_SECRET = "your_jwt_secret";

const register = async (req, res) => {
  const { name, email, password } = req.body;
  let errors = [];

  if (!name) errors.push({ message: "name is required" });
  if (!email) errors.push({ message: "email is required" });
  if (!password) errors.push({ message: "password is required" });

  if (errors.length > 0) return res.status(400).json(errors);

  try {
    const emailExists = await User.emailIfExists(email);
    if (emailExists) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.createUser(name, email, hashedPassword);

    res.status(201).json({ message: "User has been created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const user = await User.emailIfExists(email);
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    res.json({ message: "Logged in successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login };
