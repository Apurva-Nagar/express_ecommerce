const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const path = require("path");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const errorsController = require("./controllers/errors");

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorsController.get404);

app.listen(3000);
