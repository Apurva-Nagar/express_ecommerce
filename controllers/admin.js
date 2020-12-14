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
  const product = new Product({
    title: title,
    image: img_url,
    description: description,
    price: price,
    user_id: req.user,
  });

  product
    .save()
    .then((result) => {
      res.redirect("/admin/product-list");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getListProduct = (req, res, next) => {
  Product.find()
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
  Product.findById(productId)
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

  Product.findById(productId)
    .then((product) => {
      product.title = title;
      product.image = img_url;
      product.description = description;
      product.price = price;
      return product.save();
    })
    .then((result) => {
      res.redirect("/admin/product-list");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.findByIdAndRemove(productId)
    .then(() => {
      res.redirect("/admin/product-list");
    })
    .catch((err) => {
      console.log(err);
    });
};
