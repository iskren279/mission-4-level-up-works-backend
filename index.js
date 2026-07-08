import express from "express";
import mysql from "mysql2";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

//create the connection pool

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
});

//default route handler - check server running okay
app.get("/", (req, res) => {
  res.send("Server connect http://localhost:5173/ected!");
});

//default route handler database test
app.get("/dbTest", (req, res) => {
  //   res.send("Server connected!");
  pool.query("SELECT * FROM student", (err, result) => {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    res.send(result);
  });
});

app.get("/dbPing", (req, res) => {
  pool.query("SELECT 1", (err, result) => {
    if (err) {
      console.error("Database connection failed:", err);
      return res.status(500).send("Database connection failed!");
    }
    res.send("Database Ping Successful: reachable and connected!");
  });
});

//54 to 154 for Fateha

//155 to 255 Rodrigo
// Unified signup route for both student and teacher
app.post("/auth/:role/signup", (req, res) => {
  const { role } = req.params; // student or teacher
  const { name, email, password } = req.body;

  // Validation to check if either student or teacher only to avoid SQL injection
  if (role !== "student" && role !== "teacher") {
    return res.status(400).json({ errorMessage: "Invalid role" });
  }

  // Validation to check all required fields are present and not empty
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    return res.status(400).json({ errorMessage: "Please fill in all fields" });
  }

  const table = role; // student or teacher table

  // Parameterized query to check if email already exists and avoid SQL injection
  pool.execute(`SELECT * FROM ${table} WHERE email = ?`, [email], (err, result) => {

    // Validation to check if there is an error in the database
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ errorMessage: "Database error" });
    }

    // Validation to check if email already exists in the database
    if (result.length > 0) {
      return res.status(400).json({ errorMessage: "Email already exists" });
    }

    // Query to insert new user to the database
    const mysql = `INSERT INTO ${table} (name, email, password) VALUES (?, ?, ?)`;
    pool.execute(mysql, [name, email, password], (err2) => {

      // Validation to check if there is an error in the database
      if (err2) {
        console.error("Insert error:", err2);
        return res.status(500).json({ errorMessage: "Error saving user" });
      }

      return res.status(201).json({ message: `${role} created successfully` });
    });
  });
});

// Unified login route for both student and teacher
app.post("/auth/:role/login", (req, res) => {

  // Dynamic route parameter extraction to get the role from the request params
  const { role } = req.params; // student or teacher
  const { email, password } = req.body;

  // Validation to check if either student or teacher to login
  if (role !== "student" && role !== "teacher") {
    return res.status(400).json({ errorMessage: "Invalid role" });
  }

  // Validation to check required fields are present and not empty
  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ errorMessage: "Please enter email and password" });
  }

  const table = role; // student or teacher table

  // Query to check if email and password exists in the database
  pool.execute(
    `SELECT * FROM ${table} WHERE email = ? AND password = ?`,
    [email, password],
    (err, result) => {

      // Validation to check if there is an error in the database
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ errorMessage: "Database error" });
      }

      // Validation to check if email and password exists in the database
      if (result.length === 0) {
        return res.status(401).json({ errorMessage: "Invalid email or password" });
      }


      // Return success message and user data if email and password exists in the database
      return res.status(200).json({
        message: `${role} logged in successfully`,
        user: result[0]
      });
    }
  );
});



//256 to 356 Isaiah
// 360 to 460 Iskren
//461 to 560 Corner

//

//====PORT SETUP=====//
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server is listing on http://localhost:${PORT}`);
});
