const sqlite3 = require("sqlite3").verbose();

const DBSOURCE = "db.sqlite";
const createUser =
  "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE)";
const createExercise =
  "CREATE TABLE exercises (exercise_id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, duration INTEGER NOT NULL, description TEXT NOT NULL, date TEXT DEFAULT DATE('now'))";

const insertUser = "INSERT INTO users (username) VALUES (?)";
const insertExercise =
  "INSERT INTO exercises (user_id, duration, description, date) VALUES (?,?,?,?)";

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database");
    db.run(createUser, (err) => {
      if (err) {
        //console.error(err);
      } else {
        db.run(insertUser, ["testUser"]);
      }
    });
    db.run(createExercise, (err) => {
      if (err) {
        //console.log(error);
      } else {
        db.run(insertExercise, [1, 60, "Burpees", "2024-03-18"]);
      }
    });
  }
});

module.exports = db;
