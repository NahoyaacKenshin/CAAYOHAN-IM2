const db = require("../config/db");
const generateUUID = require("../utils/generateUUID");

const createUserTable = async () => {
  const sql = `
        CREATE TABLE IF NOT EXISTS user(
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL
        )
    `;

  await db.query(sql);
};

const emailIfExists = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await db.query("SELECT * FROM user WHERE email = ?", [
    normalizedEmail,
  ]);

  return user[0];
};

const createUser = async (name, email, password) => {
  const id = generateUUID();
  const user = await db.query(
    "INSERT INTO user (id, name, email, password) VALUES (?,?,?,?)",
    [id, name, email, password]
  );

  return user;
};

module.exports = { createUserTable, emailIfExists, createUser };
