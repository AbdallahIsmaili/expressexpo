require("dotenv").config();
const User = require("../Models/user"),
  bcrypt = require("bcrypt"),
  jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { id, name, email, password, role } = req.body,
      hashedPassword = await bcrypt.hash(password, 10),
      user = await new User({
        id,
        name,
        email,
        password: hashedPassword,
        role,
      });
    await user.save();
    res.status(200).json({ message: "You are registred" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body,
      user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "The login you entered is incorrect. Please try again.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "The password you entered is incorrect. Please try again.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: email,
        name: user.name,
        role: user.role,
      },
      process.env.SECRET_KEY
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const user = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Accès non autorisé' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findOne({ id: decoded.id });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  user
};
