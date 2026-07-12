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

app.get("/debug-tables", (req, res) => {
  pool.query("SHOW TABLES", (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(result);
  });
});

app.get("/debug-project-columns", (req, res) => {
  pool.query("DESCRIBE project", (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(result);
  });
});

//default route handler - check server running okay
app.get("/", (req, res) => {
  res.send("Server connected!");
});

//default route handler databse test
app.get("/dbTest", (req, res) => {
  //   res.send("Server conected!");
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

// ****************************This is Iskren's part*************************
app.get("/debug-db", (req, res) => {
  pool.query("SELECT DATABASE() AS db", (err, result) => {
    if (err) return res.send(err);
    res.send(result);
  });
});

// Unified login route for both student and teacher
app.post("/auth/:role/login", (req, res) => {
  const { role } = req.params;
  const { email, password } = req.body;

  if (role !== "student" && role !== "teacher") {
    return res.status(400).json({ errorMessage: "Invalid role" });
  }

  if (!email?.trim() || !password?.trim()) {
    return res
      .status(400)
      .json({ errorMessage: "Please enter email and password" });
  }

  const table = role;

  pool.query(
    `SELECT * FROM ${table} WHERE email = ? AND password = ?`,
    [email, password],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ errorMessage: "Database error" });
      }

      if (result.length === 0) {
        return res
          .status(401)
          .json({ errorMessage: "Invalid email or password" });
      }

      return res.status(200).json({
        message: `${role} logged in successfully`,
        user: result[0],
      });
    },
  );
});

app.get("/projects/:id/instructions", (req, res) => {
  const { id } = req.params;

  pool.query(
    "SELECT instructions FROM project WHERE project_id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Project not found" });
      }

      res.json(result[0]);
    },
  );
});

//====PORT SETUP=====//
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server is listing on http://localhost:${PORT}`);
});
