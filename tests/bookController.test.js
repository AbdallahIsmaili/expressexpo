const mongoose = require("mongoose");
const {
  createBook,
  updateBook,
  getBooks,
  deleteBook,
} = require("../Controllers/bookController");
const Book = require("../Models/book");

describe("Book Controller", () => {
  // Configuration de la connexion MongoDB avec options modernes
  const connectOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  };

  beforeAll(async () => {
    try {
      await mongoose.connect(
        "mongodb://localhost:27017/TestLibrary",
        connectOptions
      );
      console.log("✅ Connexion MongoDB établie pour les tests");
    } catch (error) {
      console.error("❌ Erreur de connexion MongoDB:", error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await mongoose.connection.close();
      console.log("✅ Connexion MongoDB fermée après les tests");
    } catch (error) {
      console.error(
        "❌ Erreur lors de la fermeture de la connexion MongoDB:",
        error
      );
    }
  });

  beforeEach(async () => {
    try {
      await Book.deleteMany({});
      console.log("📦 Base de données nettoyée avant le test");
    } catch (error) {
      console.error(
        "❌ Erreur lors du nettoyage de la base de données:",
        error
      );
    }
  });

  test("create book", async () => {
    const req = {
      body: {
        id: 1,
        title: "Test Book",
        author: "Test Author",
        year: 2023,
        genre: "Fiction",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    try {
      await createBook(req, res);
      console.log("📖 Test de création de livre : Succès");

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "le livre est ajouté" });

      // Vérification supplémentaire en base de données
      const bookInDB = await Book.findOne({ id: 1 });
      console.log("🔍 Livre créé en base de données:", bookInDB);
      expect(bookInDB).toBeTruthy();
      expect(bookInDB.title).toBe("Test Book");
    } catch (error) {
      console.error("❌ Erreur lors du test de création de livre:", error);
      throw error;
    }
  }, 10000);

  test("update book", async () => {
    try {
      // Créer un livre avant de le mettre à jour
      await Book.create({
        id: 1,
        title: "Original Book",
        author: "Original Author",
        year: 2022,
        genre: "Fiction",
      });
      console.log("📖 Livre original créé pour le test de mise à jour");

      const req = {
        params: { id: "1" },
        body: {
          title: "Updated Book",
          author: "Updated Author",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await updateBook(req, res);
      console.log("🔄 Test de mise à jour de livre : Succès");

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "le livre est modifie",
      });

      // Vérification du livre mis à jour en base de données
      const updatedBook = await Book.findOne({ id: 1 });
      console.log("🔍 Livre mis à jour:", updatedBook);
      expect(updatedBook.title).toBe("Updated Book");
      expect(updatedBook.author).toBe("Updated Author");
    } catch (error) {
      console.error("❌ Erreur lors du test de mise à jour de livre:", error);
      throw error;
    }
  }, 10000);

  test("get books", async () => {
    try {
      // Ajouter quelques livres pour le test
      await Book.create([
        {
          id: 1,
          title: "Book 1",
          author: "Author 1",
          year: 2022,
          genre: "Fiction",
        },
        {
          id: 2,
          title: "Book 2",
          author: "Author 2",
          year: 2023,
          genre: "Non-Fiction",
        },
      ]);
      console.log("📚 Livres de test créés pour la récupération");

      const req = {
        query: { page: 1, limit: 10 },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getBooks(req, res);
      console.log("📖 Test de récupération de livres : Succès");

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          books: expect.any(Array),
          totalPages: expect.any(Number),
          currentPage: expect.any(Number),
        })
      );

      // Logs supplémentaires pour les détails de la réponse
      const responseData = res.json.mock.calls[0][0];
      console.log("📊 Détails de la réponse de récupération:", {
        nombreLivres: responseData.books.length,
        totalPages: responseData.totalPages,
        pageCourante: responseData.currentPage,
      });
    } catch (error) {
      console.error("❌ Erreur lors du test de récupération de livres:", error);
      throw error;
    }
  }, 10000);

  test("delete book", async () => {
    try {
      // Créer un livre avant de le supprimer
      await Book.create({
        id: 1,
        title: "Book to Delete",
        author: "Test Author",
        year: 2023,
        genre: "Fiction",
      });
      console.log("📖 Livre créé pour le test de suppression");

      const req = {
        params: { id: "1" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await deleteBook(req, res);
      console.log("🗑️ Test de suppression de livre : Succès");

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "le livre est supprimé",
      });

      // Vérification que le livre a été supprimé de la base de données
      const deletedBook = await Book.findOne({ id: 1 });
      console.log("🔍 Livre supprimé (doit être null):", deletedBook);
      expect(deletedBook).toBeNull();
    } catch (error) {
      console.error("❌ Erreur lors du test de suppression de livre:", error);
      throw error;
    }
  }, 10000);
});
