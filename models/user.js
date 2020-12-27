const Product = require("../models/product");

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpire: Date,
  email: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    required: true,
  },
  profileImage: { type: String },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    total: { type: Number, default: 0.0 },
  },
  wishlist: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });

  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    updatedCartItems[cartProductIndex].quantity += 1;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: 1,
    });
  }

  const updatedPrice = this.cart.total + product.price;
  const updatedCart = {
    items: updatedCartItems,
    total: updatedPrice,
  };

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteItemFromCart = function (productId) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === productId.toString();
  });

  let updatedTotal = 0;
  const qty = this.cart.items[cartProductIndex].quantity;

  const updatedCart = this.cart.items.filter((i) => {
    return i.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCart;

  return Product.findOne({ _id: productId })
    .then((product) => {
      updatedTotal = this.cart.total - product.price * qty;
      this.cart.total = updatedTotal;
      return this.save();
    })
    .catch((err) => {
      console.log(err);
    });
};

userSchema.methods.decreaseItemQtyCart = function (productId) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === productId.toString();
  });

  if (this.cart.items[cartProductIndex].quantity > 1) {
    this.cart.items[cartProductIndex].quantity -= 1;

    return Product.findOne({ _id: productId })
      .then((product) => {
        this.cart.total -= product.price;
        return this.save();
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    let updatedTotal = 0;
    const qty = this.cart.items[cartProductIndex].quantity;

    const updatedCart = this.cart.items.filter((i) => {
      return i.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCart;

    return Product.findOne({ _id: productId })
      .then((product) => {
        updatedTotal = this.cart.total - product.price * qty;
        this.cart.total = updatedTotal;
        return this.save();
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

userSchema.methods.addToWishlist = function (productId) {
  const updatedWishlistItems = [...this.wishlist.items];
  updatedWishlistItems.push({
    productId: productId,
  });

  const updatedWishlist = {
    items: updatedWishlistItems,
  };

  this.wishlist = updatedWishlist;
  return this.save();
};

userSchema.methods.deleteFromWishlist = function (productId) {
  const updatedWishlist = this.wishlist.items.filter((i) => {
    return i.productId.toString() !== productId.toString();
  });
  this.wishlist.items = updatedWishlist;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
