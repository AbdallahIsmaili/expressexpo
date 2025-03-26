const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { collection: "Book" },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
