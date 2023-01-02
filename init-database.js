const sqlite3 = require("sqlite3");

const database = new sqlite3.Database("./database.sqlite", () => {
  console.log("connected to sqlite database");
  database.serialize(() => {
    database.run(`
      CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(32),
      apiKey VARCHAR(32)
      )`
    );
    database.run(`
      INSERT INTO users (name, apiKey)
      VALUES ('Bob', '123456'), ('Jake', 'qwerty')`
    );
    database.run(`
      CREATE TABLE IF NOT EXISTS tweets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      createdAt TIMESTAMP DEFAULT (datetime('now', 'localtime')),
      content TEXT,
      authorId INTEGER)`
    );
    database.run(`
      INSERT INTO tweets (content, authorId)
      VALUES ('This is my second tweet!', 1), ('Hi, my name is Jake!', 2), ('Hello world!', 1), ('Wonder how long will this platform live!', 2)`
    );
    console.log('database initialized');
  });
});
