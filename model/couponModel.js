const mongoose = require("mongoose");
const couponschema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  discountAmount: {
    type: Number,
  },
  maxcartamount: {
    type: Number,
  },
  user: {
    type: Array,
    ref: "user",
    default: [],
  },
  maxcount: {
    type: Number,
  },
  status: {
    type: Boolean,
    default: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
});
module.exports = mongoose.model("coupon", couponschema);
