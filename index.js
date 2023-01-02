const express = require("express");
const sqlite3 = require("sqlite3");
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json())

const database = new sqlite3.Database("./database.sqlite", () => {
  console.log('database connected');
});

app.use((req, res, next) => {
  const authNeeded = ['POST', 'DELETE'].includes(req.method) && req.path.includes('/tweets');
  if (authNeeded) {
    database.get('SELECT * FROM users WHERE id = ? AND apiKey = ?', [req.body.id, req.header('x-api-key')], (err, user) => {
      if (!user) {
        res.status(401).json({
          status: 401,
          message: 'Wrong credentials'
        });
      } else {
        res.locals.user = user;
        next();
      }
    });
  } else next();
})

app.get("/tweets", (req, res) => {
  database.all("SELECT * FROM tweets ORDER BY createdAt DESC", (err, rows) => {
    res.json(rows);
  });
});

app.get("/users/:id", (req, res) => {
  database.get(
    "SELECT id, name FROM users WHERE id = ?",
    [req.params.id],
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
    [req.params.id],
    (err, rows) => {
      res.json(rows);
    }
  );
});

app.post("/tweets", (req, res) => {
  database.run(`
        INSERT INTO tweets (content, authorId) 
        VALUES (?, ?)`,
    [req.body.content, req.body.id]
  )
  res.json({
    message: 'Tweet created'
  })
});

app.delete("/tweets/:id", (req, res) => {
  database.run('DELETE FROM tweets WHERE id = ? AND authorId = ?', [req.params.id, res.locals.user.id])
  res.json({message: 'Tweet deleted'});
});

app.listen(3000, () => console.log("app is running"));
