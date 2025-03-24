const Book = require("../Models/book");
const mongoose = require("mongoose");

const createBook = async (req, res) => {
  try {
    const { id, title, author, year, genre, description } = req.body;

    if (!title || !author || !year || !genre) {
      return res
        .status(400)
        .json({ message: "Tous les champs sont obligatoires." });
    }

    const newBook = new Book({
      id,
      title,
      author,
      year,
      genre,
      description,
    });
    await newBook.save();
    res.status(200).json({ message: "le livre est ajouté" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, author, year, genre, description } = req.body;
    const book = await Book.findOne({ id: parseInt(id) });
    if (!book) {
      return res.status(404).json({ message: "le livre n'existe pas" });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.year = year || book.year;
    book.genre = genre || book.genre;
    book.description = description || book.description;
    await book.save();
    res.status(200).json({ message: "le livre est modifie" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//function to get all books with pagination
const getBooks = async (req, res) => {
  try {
    console.log("Requête reçue avec query params :", req.query);

    const { page = 1, limit = 10 } = req.query;
    const books = await Book.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalBooks = await Book.countDocuments();

    res.status(200).json({
      books,
      totalPages: Math.ceil(totalBooks / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Erreur dans getBooks :", error);
    res.status(500).json({ message: error.message });
  }
};


const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findOneAndDelete({ id: parseInt(id) });
    if (!book) {
      return res.status(404).json({ message: "le livre n'existe pas" });
    }
    res.status(200).json({ message: "le livre est supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBook, updateBook, getBooks, deleteBook };
