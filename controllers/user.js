const Product = require("../models/product");

exports.getProfile = (req, res, next) => {
  res.render("user/profile", {
    pageTitle: "Your Profile",
    path: "/user/profile",
    name: req.user.username,
    email: req.user.email,
    profileImage: req.user.profileImage,
    errorMessage: "",
  });
};

exports.getWishlist = (req, res, next) => {
  req.user
    .populate("wishlist.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.wishlist.items;
      res.render("user/wishlist", {
        pageTitle: "Your Wishlist",
        path: "/user/wishlist",
        errorMessage: req.flash("error"),
        wishlist: products,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postWishlistAddProduct = (req, res, next) => {
  const { productId } = req.body;
  const wishlist = req.user.wishlist.items;
  for (let item = 0; item < wishlist.length; item++) {
    if (productId.toString() === wishlist[item].productId.toString()) {
      req.flash("error", "Item already in wishlist.");
      return res.redirect("/wishlist");
    }
  }

  req.user.addToWishlist(productId);
  return res.redirect("/wishlist");
};

exports.postWishlistDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  req.user.deleteFromWishlist(productId);
  return res.redirect("/wishlist");
};

exports.postWishlistToCart = (req, res, next) => {
  const { productId } = req.body;
  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      return req.user.deleteFromWishlist(productId);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};
