const mongoose = require("mongoose");

const catogarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  blocked: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("catogary", catogarySchema);
