const rateLimit = require("express-rate-limit");
const Redis = require("ioredis");
const {
  createBook,
  updateBook,
  deleteBook,
  getBooks,
} = require("../Controllers/bookController");

const router = require("express").Router();

const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
  reconnectOnError: (err) => {
    console.error("Erreur de connexion à Redis :", err);
    return true;
  },
});

// Middleware de limitation : max 5 requêtes toutes les 10 secondes par IP
const limiter = rateLimit({
  windowMs: 10 * 1000, 
  max: 5, 
  message: "Trop de requêtes, veuillez réessayer plus tard.",
  headers: true, 
  keyGenerator: (req) => req.ip,
  handler: (req, res, next, options) => {
    res.setHeader('Retry-After', new Date(Date.now() + 10 * 1000).toUTCString());
    res.status(options.statusCode).json({ 
      message: "Trop de requêtes, veuillez réessayer plus tard."
    });
  }
});

// Middleware de caching pour GET /books
const cacheMiddleware = async (req, res, next) => {
  const cacheKey = `books:${req.query.page || 1}`;
  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData)); // Réponse depuis le cache
    }
    next(); // Passer au contrôleur si pas en cache
  } catch (error) {
    console.error("Erreur Redis :", error);
    next(); // Continuer même si Redis échoue
  }
};

router.post("/create", limiter, createBook);
router.put("/update/:id", limiter, updateBook);
router.get("/", limiter, cacheMiddleware, getBooks);
router.delete("/delete/:id", limiter, deleteBook);

module.exports = router;
