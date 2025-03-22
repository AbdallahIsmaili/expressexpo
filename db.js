const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const main = async () =>
  await mongoose.connect("mongodb://127.0.0.1:27017/Library", {
    useNewUrlParser: true,
  });

main()
  .then(() => console.log("There is now a connection to the database"))
  .catch((error) => console.error(error));

module.exports = main;
