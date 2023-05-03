const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  catogary: {
    type: String,
    required: true,
  },

  image: {
    type: Array,
    required: true,
  },
  Quantity: {
    type: Number,
    default: 0,
  },

  blocked: {
    type: Number,
    default: 0,
  },
  prize: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("product", productSchema);
