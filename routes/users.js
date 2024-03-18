const express = require("express");
const router = express.Router();

const user_controller = require("../controllers/userController");

/// USER ROUTES

router.get("/", user_controller.user_get_all);

router.post("/", user_controller.user_create);

module.exports = router;
