const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { register, login, user } = require("../Controllers/userController");
const User = require("../Models/user");

require("dotenv").config();

describe("Contrôleur Utilisateur", () => {
  const optionsConnexion = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  };

  beforeAll(async () => {
    try {
      await mongoose.connect(
        "mongodb://localhost:27017/TestLibrary",
        optionsConnexion
      );
      console.log("✅ Connexion à MongoDB établie");
    } catch (error) {
      console.error("❌ Échec de la connexion MongoDB :", error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await mongoose.connection.close();
      console.log("✅ Déconnexion de MongoDB réussie");
    } catch (error) {
      console.error("❌ Erreur lors de la déconnexion :", error);
    }
  });

  beforeEach(async () => {
    try {
      await User.deleteMany({});
      console.log("🧹 Nettoyage de la base de données");
    } catch (error) {
      console.error("❌ Échec du nettoyage :", error);
    }
  });

  test("Inscription utilisateur valide", async () => {
    const requete = {
      body: {
        id: 1,
        name: "Jean Dupont",
        email: "jean@exemple.com",
        password: "secret123",
        role: "user",
      },
    };

    const reponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await register(requete, reponse);

    console.log("📝 Utilisateur inscrit avec succès");
    expect(reponse.status).toHaveBeenCalledWith(200);
    expect(reponse.json).toHaveBeenCalledWith({ message: "You are registred" });
  }, 10000);

  test("Connexion utilisateur valide", async () => {
    await User.create({
      id: 1,

      name: "Jean Dupont",
      email: "jean@exemple.com",
      password: await bcrypt.hash("secret123", 10),
    });

    const requete = {
      body: {
        email: "jean@exemple.com",
        password: "secret123",
      },
    };

    const reponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await login(requete, reponse);

    console.log("🔑 Connexion réussie");
    expect(reponse.status).toHaveBeenCalledWith(200);
    expect(reponse.json.mock.calls[0][0].token).toBeDefined();
  }, 10000);

  test("Échec de connexion avec mauvais mot de passe", async () => {
    await User.create({
      id: 2,
      name: "Jean Dupont",
      email: "jean@exemple.com",
      password: await bcrypt.hash("secret123", 10),
    });

    const requete = {
      body: {
        email: "jean@exemple.com",
        password: "mauvais_mdp",
      },
    };

    const reponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await login(requete, reponse);

    console.log("🚫 Tentative de connexion échouée");
    expect(reponse.status).toHaveBeenCalledWith(401);
    expect(reponse.json).toHaveBeenCalledWith({
      message: "The password you entered is incorrect. Please try again.",
    });
  }, 10000);

  describe("Tests de la route /me", () => {
    const genererToken = (utilisateur) => {
      return jwt.sign(
        {
          id: utilisateur.id,
          email: utilisateur.email,
          name: utilisateur.name,
        },
        process.env.SECRET_KEY
      );
    };

    test("Récupération du profil avec token valide", async () => {
      const utilisateurTest = await User.create({
        id: 3,
        name: "Marie Curie",
        email: "marie@exemple.com",
        password: await bcrypt.hash("radium", 10),
      });

      const requete = {
        headers: {
          authorization: `Bearer ${genererToken(utilisateurTest)}`,
        },
      };

      const reponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await user(requete, reponse);

      console.log("👤 Profil utilisateur récupéré");
      expect(reponse.status).toHaveBeenCalledWith(200);
      expect(reponse.json).toHaveBeenCalledWith({
        id: utilisateurTest.id,
        name: "Marie Curie",
        email: "marie@exemple.com",
        role: "user",
      });
    });

    test("Accès non autorisé sans token", async () => {
      const requete = { headers: {} };
      const reponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await user(requete, reponse);

      console.log("🔒 Accès refusé - Token manquant");
      expect(reponse.status).toHaveBeenCalledWith(401);
      expect(reponse.json).toHaveBeenCalledWith({
        message: "Accès non autorisé",
      });
    });

    test("Échec avec token invalide", async () => {
      const requete = {
        headers: {
          authorization: "Bearer token_invalide_123",
        },
      };

      const reponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await user(requete, reponse);

      console.log("⚠️ Token invalide détecté");
      expect(reponse.status).toHaveBeenCalledWith(401);
      expect(reponse.json).toHaveBeenCalledWith({
        message: "Token invalide",
      });
    });

    test("Échec avec token expiré", async () => {
      const tokenExpire = jwt.sign(
        {
          id: 3,
          email: "expire@exemple.com",
          exp: Math.floor(Date.now() / 1000) - 60,
        },
        process.env.SECRET_KEY
      );

      const requete = {
        headers: {
          authorization: `Bearer ${tokenExpire}`,
        },
      };

      const reponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await user(requete, reponse);

      console.log("⌛ Token expiré détecté");
      expect(reponse.status).toHaveBeenCalledWith(401);
      expect(reponse.json).toHaveBeenCalledWith({
        message: "Token expiré",
      });
    });
  });
});
