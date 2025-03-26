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


const getBooksByCursor = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor ? parseInt(req.query.cursor) : null;

    let query = {};
    if (cursor) {
      query = { published_year: { $gt: cursor } };
    }

    const books = await Book.find(query)
      .sort({ published_year: 1 }) // Sort by publication year
      .limit(limit + 1); // Get one extra to check for next page

    const hasNextPage = books.length > limit;
    if (hasNextPage) {
      books.pop(); // Remove the extra item
    }

    const nextCursor = hasNextPage
      ? books[books.length - 1].published_year
      : null;

    res.json({
      data: books,
      pagination: {
        nextCursor,
        hasNextPage,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getBooksByOffset = async (req, res) => {
  try {
    let { limit = 10, offset = 0 } = req.query;

    limit = parseInt(limit);
    offset = parseInt(offset);

    const books = await Book.find().skip(offset).limit(limit);

    const totalBooks = await Book.countDocuments();

    res.status(200).json({
      books,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
      currentOffset: offset,
    });
  } catch (error) {
    console.error("Error in offset pagination:", error);
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

module.exports = {
  createBook,
  updateBook,
  getBooks,
  deleteBook,
  getBooksByCursor,
  getBooksByOffset,
};
