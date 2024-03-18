const express = require("express");
const router = express.Router();

const user_controller = require("../controllers/userController");

/// USER ROUTES

router.get("/", user_controller.user_get_all);

module.exports = router;
