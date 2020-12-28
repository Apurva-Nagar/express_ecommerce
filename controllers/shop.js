const Product = require("../models/product");
const Order = require("../models/order");

const ITEMS_PER_PAGE = 20;

exports.getIndex = (req, res, next) => {
  const page = req.query.page || 1;
  let totalItems;

  Product.find()
    .count()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        products: products,
        pageTitle: "Shop",
        path: "/",
        hasProducts: products.length > 0,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: Number(page) + 1,
        previousPage: Number(page) - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getListProduct = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        products: products,
        pageTitle: "All Products",
        path: "/products",
        hasProducts: products.length > 0,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  let bought = false;

  if (req.user) {
    Order.find({ "user.user_id": req.user._id })
      .then((orders) => {
        orders.forEach((order) => {
          order.products.forEach((p) => {
            if (productId.toString() === p.product._id.toString()) {
              bought = true;
            }
          });
        });
      })
      .then(() => {
        Product.findById(productId)
          .then((product) => {
            res.render("shop/product-detail", {
              product: product,
              pageTitle: product.title,
              path: "/products",
              bought: bought,
              userId: req.user._id,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    Product.findById(productId)
      .then((product) => {
        res.render("shop/product-detail", {
          product: product,
          pageTitle: product.title,
          path: "/products",
          bought: bought,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        pageTitle: "Your Cart",
        path: "/cart",
        products: products,
        total: user.cart.total,
        addresses: req.user.addresses.items,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    });
};

exports.postCartDeleteItem = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .deleteItemFromCart(productId)
    .then((result) => res.redirect("/cart"))
    .catch((err) => console.log(err));
};

exports.postCartDecreaseItemQty = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .decreaseItemQtyCart(productId)
    .then((result) => res.redirect("/cart"))
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.user_id": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        pageTitle: "Your Order",
        path: "/orders",
        orders: orders,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postOrder = (req, res, next) => {
  const { orderAddress } = req.body;
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          username: req.user.username,
          email: req.user.email,
          user_id: req.user,
        },
        products: products,
        total: user.cart.total,
        date: Date.now(),
        address: orderAddress,
      });
      order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

exports.postAddReviewRating = (req, res, next) => {
  const { productId, productReview, productRating } = req.body;
  const { username, _id } = req.user;

  const productRatingInt = Number(productRating.split("-")[0].trim());

  Product.findOne({ _id: productId })
    .then((product) => {
      product.addReviewRating(_id, username, productReview, productRatingInt);
    })
    .then((result) => {
      res.redirect("back");
    })
    .catch((err) => {
      console.log(err);
    });
};

// exports.getCheckout = (req, res, next) => {
//   res.render("shop/checkout", {
//     pageTitle: "Checkout",
//     path: "/checkout",
//   });
// };
