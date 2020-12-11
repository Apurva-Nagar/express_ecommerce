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
  const product = new Product(null, title, img_url, description, price);
  product.save();
  res.redirect("/");
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const productId = req.params.productId;
  Product.fetchById(productId, (product) => {
    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const { title, img_url, description, price, productId } = req.body;

  const updatedProduct = new Product(
    productId,
    title,
    img_url,
    description,
    price
  );
  updatedProduct.save();
  res.redirect("/products");
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.deleteProduct(productId);
  res.redirect("/admin/product-list");
};

exports.getListProduct = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("admin/product-list", {
      products: products,
      pageTitle: "Admin Products",
      path: "/admin/product-list/",
      hasProducts: products.length > 0,
    });
  });
};
