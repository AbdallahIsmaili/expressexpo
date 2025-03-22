require("dotenv").config();
require("./db");
const PORT = 3000,
  express = require("express"),
  jwt = require("jsonwebtoken"),
  bodyParser = require("body-parser"),
  userRouter = require("./Routes/userRouter"),
  //bookRouter = require("./Routes/bookRouter"),
  app = express();

const auth = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(403).json({ message: "the access is forbidden." });
  } else {
    const token = authorization.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, (error, user) => {
      if (error) {
        return res.status(403).json({ message: "the access is forbidden." });
      }
      req.user = user;
      next();
    });
  }
};

app.use(bodyParser.json());

app.use("/user", userRouter);

// app.use("/book", auth, bookRouter);

app.listen(PORT, () => console.log(`Library server is running in port:${PORT}`));
