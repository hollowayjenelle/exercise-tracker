const sqlite3 = require("sqlite3").verbose();

const DBSOURCE = "db.sqlite";
const createUser =
  "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE)";
const createExercise =
  "CREATE TABLE IF NOT EXISTS exercises (exercise_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, duration INTEGER NOT NULL, description TEXT NOT NULL, date TEXT)";

const db = new sqlite3.Database(DBSOURCE);

console.log("Connected to the SQLite database");
db.serialize(() => {
  db.run(createUser);
  db.run(createExercise);
});

module.exports = db;
