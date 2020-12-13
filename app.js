const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const path = require("path");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const errorsController = require("./controllers/errors");

const mongoConnect = require("./utils/database").mongoConnect;

const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.fetchById("5fd4b8e751ad0f2d2c7fedc3")
    .then((user) => {
      const { name, email, cart, _id } = user;
      req.user = new User(name, email, cart, _id);
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(errorsController.get404);

mongoConnect(() => {
  console.log("---------Server Started---------\n");
  app.listen(3000);
});
