const rateLimit = require("express-rate-limit");
const {
  createBook,
  updateBook,
  deleteBook,
  getBooks,
} = require("../Controllers/bookController");

const router = require("express").Router();

const limiter = rateLimit({
  windowMs: 30 * 1000, 
  max: 5,
  headers: true,
  keyGenerator: (req) => req.ip,
  handler: (req, res, next, options) => {
    const now = Date.now();
    const resetTime = req.rateLimit.resetTime; 
    const retryAfter = Math.ceil((resetTime - now) / 1000);

    res.setHeader("Retry-After", retryAfter);
    res.setHeader("X-RateLimit-Reset", resetTime);

    res.status(options.statusCode).json({
      message: `Trop de requêtes. Veuillez réessayer dans ${retryAfter} secondes.`,
      retryAfter: retryAfter,
      resetTime: new Date(resetTime).toISOString(),
    });
  },
});

// Middleware de caching navigateur pour GET /books
const browserCacheMiddleware = (req, res, next) => {
  res.set("Cache-Control", "public, max-age=300, must-revalidate");

  next();
};

// Middleware pour supprimer le cache pour les méthodes qui modifient les données
const noCacheMiddleware = (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
};

// Routes avec cache navigateur
router.post("/create", limiter, noCacheMiddleware, createBook);
router.put("/update/:id", limiter, noCacheMiddleware, updateBook);
router.get("/", limiter, browserCacheMiddleware, getBooks);
router.delete("/delete/:id", limiter, noCacheMiddleware, deleteBook);

module.exports = router;
