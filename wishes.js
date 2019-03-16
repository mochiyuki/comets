const mongoose = require("mongoose");

const WishSchema = new mongoose.Schema({
  wish: String,
  sender: String,
  posX: {
    type: Number,
    default: function() {
      var num = Math.floor(Math.random() * 10) + 1;
      num *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
      return num;
    }
  },
  posY: {
    type: Number,
    default: function() {
      var num = Math.floor(Math.random() * 10) + 1;
      num *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
      return num;
    }
  },
  posZ: {
    type: Number,
    default: function() {
      return Math.floor(Math.random() * -10);
    }
  },
  date: {
    type: Date,
    default: Date.now
  },
  expireAt: { type: Date, default: Date.now, index: { expires: "5m" } }
});

const Wish = mongoose.model("Wish", WishSchema);
module.exports = Wish;
