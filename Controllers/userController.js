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

module.exports = {
  register,
  login,
};
