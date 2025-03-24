const router = require("express").Router(),
  { register, login ,user} = require("../Controllers/userController");

router.post("/register", register);
router.post("/login", login);
router.get('/me', user);

module.exports = router;
