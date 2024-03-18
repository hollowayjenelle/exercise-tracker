const db = require("../database");

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
