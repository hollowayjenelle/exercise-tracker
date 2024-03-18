const db = require("../database");
const { body, validationResult } = require("express-validator");
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
    .optional()
    .isISO8601()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("Date should be in format YYYY-MM-DD"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });
      return;
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
          duration: req.body.duration,
          description: req.body.description,
          date: exerciseDate,
        },
      });
    });
  }),
];
