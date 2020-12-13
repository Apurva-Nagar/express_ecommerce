const mongodb = require("mongodb");
const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, img_url, description, price } = req.body;
  const product = new Product(
    title,
    img_url,
    description,
    price,
    null,
    req.user._id
  );

  product
    .save()
    .then((result) => {
      // console.log(result)
      console.log("Created Product.");
      res.redirect("/admin/product-list");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getListProduct = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("admin/product-list", {
        products: products,
        pageTitle: "Admin Products",
        path: "/admin/product-list/",
        hasProducts: products.length > 0,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const productId = req.params.productId;
  Product.fetchById(productId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const { title, img_url, description, price, productId } = req.body;

  const updatedProduct = new Product(
    title,
    img_url,
    description,
    price,
    new mongodb.ObjectId(productId)
  );

  updatedProduct
    .save()
    .then((result) => {
      console.log("Updated Product.");
      res.redirect("/admin/product-list");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.deleteProduct(productId)
    .then(() => {
      console.log("Deleted Product.");
      res.redirect("/admin/product-list");
    })
    .catch((err) => {
      console.log(err);
    });
};
