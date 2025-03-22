const router = require("express").Router(),
  { register, login } = require("../Controllers/userController");

router.post("/register", register);
router.post("/login", login);

module.exports = router;
