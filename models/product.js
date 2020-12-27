const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviews: {
    items: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
  },
  rating: { type: Number, default: 0 },
});

productSchema.methods.addReviewRating = function (
  userId,
  username,
  comment,
  rating
) {
  updatedReviewItems = [...this.reviews.items];

  updatedReviewItems.push({
    userId: userId,
    username: username,
    comment: comment,
  });

  updatedReviews = {
    items: updatedReviewItems,
  };

  this.reviews = updatedReviews;

  if (this.rating === 0) {
    updatedRating = rating;
  } else {
    updatedRating = (this.rating + rating) / 2;
  }
  this.rating = updatedRating;
  return this.save();
};

module.exports = mongoose.model("Product", productSchema);
