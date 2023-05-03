const mongoose = require("mongoose");
const walletschema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: false,
  },
  walletbalance: {
    type: Number,
    default: 0,
    min: 0,
  },
});
module.exports = mongoose.model("wallet", walletschema);
