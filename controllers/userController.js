const db = require("../database");
const { body, validationResult, param } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.user_get_all = (req, res, next) => {
  const sql = "select * from users";
  const params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(404).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      "status-code": 200,
      data: rows,
    });
  });
};

exports.user_create = [
  body("username")
    .trim()
    .isLength({ min: 1 })
    .notEmpty()
    .escape()
    .withMessage("Username must be specified")
    .isAlphanumeric()
    .withMessage("Username has non-alphanumeric character"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });
      return;
    }

    const sql = "INSERT INTO users (username) VALUES (?)";
    const params = [req.body.username];
    db.run(sql, params, function (err, result) {
      if (err) {
        res.status(400).json({ error: "Username already exists" });
        return;
      }
      res.json({
        message: "success",
        data: {
          id: this.lastID,
          username: req.body.username,
        },
      });
    });
  }),
];

const validateUser = (id, callback) => {
  const sql = "SELECT COUNT(*) AS count FROM users WHERE id = ?";
  db.get(sql, [id], (err, row) => {
    if (err) {
      console.log(err.message);
      return callback(err, null);
    }

    const userExists = row.count > 0;
    callback(null, userExists);
  });
};

const isDateValid = (date) => {
  return new Date(date) !== "Invalid Date";
};

exports.exercise_create = [
  body("duration")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Exercise duration is required")
    .isNumeric()
    .withMessage("Exercise duration should be a number"),
  body("description")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Exercise description is required"),
  body("date")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date should be in format YYYY-MM-DD")
    .custom((date) => isDateValid(date))
    .withMessage("Invalid Date"),
  param("id").exists().withMessage("ID Parameter does not exists"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });
      return;
    }

    validateUser(req.params.id, (err, userExists) => {
      if (err) {
        return res.status(500).send({ error: "Internal Server Error" });
      }

      if (!userExists) {
        return res.status(404).send({ error: "User not found" });
      }

      const sql =
        "INSERT INTO exercises (user_id, duration, description, date) VALUES (?, ?,?,?)";
      const exerciseDate =
        req.body.date || new Date().toLocaleDateString("en-CA");
      const params = [
        req.params.id,
        req.body.duration,
        req.body.description,
        exerciseDate,
      ];

      db.run(sql, params, function (err, result) {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        }
        res.json({
          message: "success",
          data: {
            userId: Number(req.params.id),
            exercise_id: this.lastID,
            duration: Number(req.body.duration),
            description: req.body.description,
            date: exerciseDate,
          },
        });
      });
    });
  }),
];

exports.get_all_user_logs = (req, res, next) => {
  const hasQueryParams = Object.keys(req.query).length !== 0;

  const sql =
    "SELECT exercise_id, description, duration, date FROM exercises WHERE user_id = ? ORDER BY date ASC";
  const params = hasQueryParams ? [req.params.id] : [req.params.id];
  db.all(sql, params, function (err, rows) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }

    let exercises = hasQueryParams
      ? rows.filter((exercise) => {
          let to =
            "to" in req.query
              ? req.query.to
              : new Date().toLocaleDateString("en-CA");
          return exercise.date >= req.query.from && exercise.date <= to;
        })
      : rows;

    let limit = "limit" in req.query ? req.query.limit : exercises.length;
    let exerciseCount = exercises.length;
    exercises = exercises.splice(0, limit);

    res.json({
      message: "success",
      data: {
        logs: exercises,
        count: exerciseCount,
      },
    });
  });
};
