require("dotenv").config();
require("./db");

const PORT = 3000;
const express = require("express");
const session = require("express-session");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const userRouter = require("./Routes/userRouter");
const bookRouter = require("./Routes/bookRouter");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();

// Middleware should be before routes
app.use(bodyParser.json());

// ✅ Session middleware - only ONE session setup needed
app.use(
  session({
    secret: process.env.SESSION_SECRET || "my_super_secret_key", // Ensure this is set in .env
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqToCallback: true 
    },
    (req, accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);


const auth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(403).json({ message: "Access forbidden." });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.SECRET_KEY, (error, user) => {
    if (error) {
      return res.status(403).json({ message: "Invalid token." });
    }
    req.user = user;
    next();
  });
};


app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);


app.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/", failureMessage: true },
    (err, user, info) => {
      if (err) {
        console.error("Auth error:", err);
        return res.status(500).json({ error: "Authentication failed" });
      }
      if (!user) {
        console.log("Auth failed:", info);
        return res.redirect("/");
      }
      req.logIn(user, (err) => {
        if (err) return next(err);

        const token = jwt.sign(
          {
            id: req.user.id,
            name: req.user.displayName,
            email: req.user.emails[0].value,
          },
          process.env.SECRET_KEY,
          { expiresIn: "1h" }
        );

        return res.json({ message: "Authentication successful!", token });
      });
    }
  )(req, res, next);
});



app.get("/profile", auth, (req, res) => {
  res.json({
    message: "User profile retrieved successfully!",
    user: req.user,
  });
});

// Routes
app.use("/user", userRouter);
app.use("/books", bookRouter);


app.listen(PORT, () =>
  console.log(`Library server is running on port: ${PORT}`)
);
