const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin");

const isAuth = require("../middleware/is-auth");

const isAdmin = require("../middleware/is-admin");

const { body } = require("express-validator");

router.get("/add-product", isAuth, isAdmin, adminController.getAddProduct);

router.post(
  "/add-product",
  [
    body("title")
      .isString()
      .isLength({ min: 3 })
      .trim()
      .withMessage("Title must be at least 3 characters long."),

    body("img_url").isURL().withMessage("Please enter a valid URL."),

    body("price").isFloat().withMessage("Please enter a valid decimal price."),

    body("description")
      .isLength({ min: 150, max: 2000 })
      .trim()
      .withMessage("Description Length: Min. - 150, Max. - 2000 characters."),
  ],
  isAuth,
  isAdmin,
  adminController.postAddProduct
);

router.get("/product-list", isAuth, isAdmin, adminController.getListProduct);

router.get(
  "/edit-product/:productId",
  isAuth,
  isAdmin,
  adminController.getEditProduct
);

router.post(
  "/edit-product/",
  [
    body("title")
      .isString()
      .isLength({ min: 3 })
      .trim()
      .withMessage("Title must be at least 3 characters long."),

    body("img_url").isURL().withMessage("Please enter a valid URL."),

    body("price").isFloat().withMessage("Please enter a valid decimal price."),

    body("description")
      .isLength({ min: 150, max: 2000 })
      .trim()
      .withMessage("Description Length: Min. - 150, Max. - 2000 characters."),
  ],
  isAuth,
  isAdmin,
  adminController.postEditProduct
);

router.post(
  "/delete-product/",
  isAuth,
  isAdmin,
  adminController.postDeleteProduct
);

module.exports = router;
