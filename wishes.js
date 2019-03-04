const mongoose = require("mongoose");

const WishSchema = new mongoose.Schema({
  wish: String,
  sender: String,
  date: {
    type: Date,
    default: Date.now
  }
  //expire: { type: Date, default: Date.now, expires: 60 }
});

const Wish = mongoose.model("Wish", WishSchema);
module.exports = Wish;
