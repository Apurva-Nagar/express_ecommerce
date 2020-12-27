const express = require("express");

const router = express.Router();

const userController = require("../controllers/user");

const isAuth = require("../middleware/is-auth");

router.get("/profile", isAuth, userController.getProfile);

router.get("/wishlist", isAuth, userController.getWishlist);

router.post("/add-to-wishlist", isAuth, userController.postWishlistAddProduct);

router.post(
  "/delete-from-wishlist",
  isAuth,
  userController.postWishlistDeleteProduct
);

router.post("/cart-wishlist", isAuth, userController.postWishlistToCart);

module.exports = router;
