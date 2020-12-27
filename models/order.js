const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  total: { type: Number },
  date: { type: Date },
  address: { type: String },
});

module.exports = mongoose.model("Order", orderSchema);
