const {
  createBook,
  updateBook,
  deleteBook,
  getBooks,
} = require("../Controllers/bookController");

const router = require("express").Router();

router.post("/create", createBook);
router.put("/update/:id", updateBook);
router.get("/", getBooks);
router.delete("/delete/:id", deleteBook);

module.exports = router;
