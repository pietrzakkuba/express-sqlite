const express = require("express");
const sqlite3 = require("sqlite3");
const bodyParser = require("body-parser");
import { PrismaClient } from "@prisma/client";

const app = express();
app.use(bodyParser.json());
const prisma = new PrismaClient();

const createSampleData = async () => {
  await prisma.user.create({
    data: {
      name: "Bob",
      apiKey: "123456",
    },
  });
  await prisma.user.create({
    data: {
      name: "Jake",
      apiKey: "qwerty",
    },
  });
  await prisma.tweet.create({
    data: {
      content: 'This is my second tweet!',
      authorId: 1
    }
  });
  await prisma.tweet.create({
    data: {
      content: 'Hi, my name is Jake!',
      authorId: 2
    }
  });
  await prisma.tweet.create({
    data: {
      content: 'Hello world!',
      authorId: 1
    }
  });
  await prisma.tweet.create({
    data: {
      content: 'Wonder how long will this platform live!',
      authorId: 2
    }
  });
};

createSampleData();

const database = new sqlite3.Database("./database.sqlite", () => {
  console.log("connected to sqlite database");
  database.serialize(() => {
    database.run(`
      CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(32),
      apiKey VARCHAR(32)
      )`);
    database.run(`
      INSERT INTO users (name, apiKey)
      VALUES ('Bob', '123456'), ('Jake', 'qwerty')`);
    database.run(`
      CREATE TABLE IF NOT EXISTS tweets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      createdAt TIMESTAMP DEFAULT (datetime('now', 'localtime')),
      content TEXT,
      authorId INTEGER)`);
    database.run(`
      INSERT INTO tweets (content, authorId)
      VALUES ('This is my second tweet!', 1), ('Hi, my name is Jake!', 2), ('Hello world!', 1), ('Wonder how long will this platform live!', 2)`);
  });
});

app.get("/tweets", (req, res) => {
  database.all("SELECT * FROM tweets ORDER BY createdAt DESC", (err, rows) => {
    res.json(rows);
  });
});

app.get("/users/:id", (req, res) => {
  database.get(
    "SELECT id, name FROM users WHERE id = ?",
    [Number(req.params.id)],
    (err, row) => {
      if (!row) {
        res.status(404).json({
          status: 404,
          message: "User not found",
        });
      } else res.json(row);
    }
  );
});

app.get("/users/:id/tweets", (req, res) => {
  database.all(
    "SELECT * FROM tweets WHERE authorId = ?",
    [Number(req.params.id)],
    (err, rows) => {
      res.json(rows);
    }
  );
});

app.post("/tweets", (req, res) => {
  database.get(
    "SELECT * FROM users WHERE id = ? AND apiKey = ?",
    [req.body.id, req.header("x-api-key")],
    (err, user) => {
      if (!user) {
        res.status(401).json({
          status: 401,
          message: "Wrong credentials",
        });
      } else {
        database.run(
          `
        INSERT INTO tweets (content, authorId) 
        VALUES (?, ?)`,
          [req.body.content, req.body.id]
        );
        res.json({
          message: "Tweet created",
        });
      }
    }
  );
});

app.delete("/tweets/:id", (req, res) => {
  database.run("DELETE FROM tweets WHERE id = ?", [Number(req.params.id)]);
  res.json({ message: "Tweet deleted" });
});

app.listen(3000, () => console.log("app is running"));
