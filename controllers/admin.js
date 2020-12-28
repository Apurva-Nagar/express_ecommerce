const Product = require("../models/product");
const Category = require("../models/category");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

exports.getAddProduct = (req, res, next) => {
  Category.find()
    .then((categories) => {
      res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        hasError: false,
        errorMessage: "",
        categories: categories,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddProduct = (req, res, next) => {
  const { title, img_url, description, price, productCategory } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        image: img_url,
        description: description,
        price: price,
      },
      errorMessage: errors.array()[0].msg,
    });
  }

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
      if (productCategory != "NULL") {
        const id = mongoose.Types.ObjectId(productCategory);
        Category.findOne({ _id: id })
          .then((category) => {
            category.products.items.push({
              productId: product._id,
            });
            category.save();
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        const id = mongoose.Types.ObjectId("5fe9afbcee0f47324c1b371f");
        Category.findOne({ _id: id })
          .then((category) => {
            category.products.items.push({
              productId: product._id,
            });
            category.save();
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .then(() => {
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
      Category.find()
        .then((categories) => {
          res.render("admin/edit-product", {
            pageTitle: "Edit Product",
            path: "/admin/edit-product",
            editing: editMode,
            product: product,
            hasError: false,
            errorMessage: "",
            categories: categories,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const { title, img_url, description, price, productId } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: title,
        image: img_url,
        description: description,
        price: price,
        _id: productId,
      },
      errorMessage: errors.array()[0].msg,
    });
  }

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

exports.getCategories = (req, res, next) => {
  Category.find()
    .then((categories) => {
      res.render("admin/categories", {
        pageTitle: "Categories",
        path: "/categories",
        categories: categories,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getAddCategory = (req, res, next) => {
  res.render("admin/add-category", {
    pageTitle: "Categories",
    path: "/admin/add-category",
  });
};

exports.postAddCategory = (req, res, next) => {
  const { category } = req.body;

  const productCategory = new Category({
    name: category,
  });
  productCategory.save();
  res.redirect("/admin/categories");
};
