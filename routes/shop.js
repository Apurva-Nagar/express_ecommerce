const express = require("express");

const router = express.Router();

const shopController = require("../controllers/shop");

const isAuth = require("../middleware/is-auth");

router.get("/", shopController.getIndex);

router.get("/products", shopController.getListProduct);

router.get("/product/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.post("/cart-delete-item", isAuth, shopController.postCartDeleteItem);

router.post(
  "/cart-decrease-item-qty",
  isAuth,
  shopController.postCartDecreaseItemQty
);

router.get("/orders", isAuth, shopController.getOrders);

router.post("/create-order", isAuth, shopController.postOrder);

router.post("/add-review", isAuth, shopController.postAddReviewRating);

// router.get("/checkout", shopController.getCheckout);

module.exports = router;
