import express, { Router } from "express";
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
  res.send("Server conected!");
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

//54 to 154 for Fateha

//155 to 255 Rodrigo

//256 to 356 Isaiah
// 360 to 460 Iskren
//461 to 560 Corner

//

//====PORT SETUP=====//
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server is listing on http://localhost:${PORT}`);
});
