const express = require("express");
const router = express.Router();

const user_controller = require("../controllers/userController");

/// USER ROUTES

router.get("/", user_controller.user_get_all);

router.post("/", user_controller.user_create);

router.post("/:id/exercises", user_controller.exercise_create);

router.get("/:id/logs", user_controller.get_all_user_logs);

module.exports = router;
