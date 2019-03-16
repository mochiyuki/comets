const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  email: {
    type: "string",
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: "string",
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: "string",
    required: true
  },
  passwordver: {
    type: "string",
    required: true
  }
});

UserSchema.statics.authenticate = (username, password, callback) => {
  User.findOne({ $or: [{ username: username }, { email: username }] }).exec(
    (err, user) => {
      if (err) {
        return callback(err);
      } else if (!user) {
        return callback({ type: "error", message: "user not found" });
      }

      bcrypt.compare(password, user.password, (err, res) => {
        if (err) throw err;

        if (res === true) {
          let tmp = {
            _id: user._id,
            username: user.username,
            email: user.email
          };

          return callback(null, tmp);
        } else {
          return callback({ type: "error", message: "wrong password" });
        }
      });
    }
  );
};

UserSchema.pre("save", function(next) {
  const user = this;
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        next(err);
      }

      user.password = hash;
      delete user.passwordver;

      next();
    });
  });
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
