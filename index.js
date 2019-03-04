var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

const iosession = require("express-socket.io-session");

const express = require("express");
const expressSession = require("express-session");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(expressSession);

const cors = require("cors");

const User = require("./users");

const Wish = require("./wishes");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017", {
  useCreateIndex: true,
  useNewUrlParser: true,
  dbName: "cometsdb"
});
const db = mongoose.connection;
db.on("error", () => {
  console.log("MongoDB error");
});
db.on("open", () => {
  console.log("Connected to MongoDB server");
});

var session = expressSession({
  secret: "secretsessionkey",
  resave: true,
  saveUninitialized: true,
  expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000),
  cookie: {
    secure: false,
    maxAge: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000)
  },
  store: new MongoStore({
    mongooseConnection: db
  })
});

io.use(function(socket, next) {
  session(socket.request, socket.request.res, next);
});

app.use(session);

app.get("/", (req, res, next) => {
  res.render("index");
});

app.get("/users/check-login", (req, res, next) => {
  return res.send({ logged: !!req.session.userId });
});

app.post("/users/register", (req, res, next) => {
  if (
    req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordver
  ) {
    if (req.body.password === req.body.passwordver) {
      User.create(req.body, (err, user) => {
        if (err) {
          return next(err);
        } else {
          req.session.userId = user._id;
          req.session.user = user.username;
          res.json({ success: true });
        }
      });
    }
  }
});

app.post("/users/login", (req, res, next) => {
  User.authenticate(req.body.username, req.body.password, (err, user) => {
    if (err || !user) {
      return res.status(401).json(err);
    } else {
      req.session.userId = user._id;
      req.session.user = user.username;
      res.json({
        username: user.username,
        type: "success"
      });
    }
  });
});

var wishes = [];

io.on("connection", async (socket, user) => {
  var user = socket.request.session.user;
  //socket.join = "StarrySky";
  //socket.room = "StarrySky";
  //console.log("you have joined " + socket.room);
  try {
    const wishes = await Wish.find({});
    console.log(wishes);

    setInterval(function() {
      socket.emit("history", wishes);
    }, 10000);
  } catch (err) {
    console.error(err);
  }

  socket.on("sendWish", (wish, callback) => {
    const newWish = new Wish({ wish: wish, sender: user });

    newWish.save(function(err) {
      if (err) {
        return callback(err);
      }

      io.emit("updatewishes", {
        wish: newWish,
        posX: Math.floor(Math.random() * 5),
        posY: Math.floor(Math.random() * 5)
      });
    });
  });
  //wishes.push(wish);

  socket.on("joinRoom", function(room) {
    //socket.leave("StarrySky");
    socket.join(room);
    socket.room = room;
    console.log("you joined " + room);
  });

  socket.on("leaveRoom", function() {
    console.log("you're about to leave " + socket.room);
    socket.leave(socket.room);
    console.log("left room");
    //socket.room = "StarrySky";
    //console.log("you're back to the" + socket.room);
  });

  socket.on("sendMessage", function(data) {
    io.sockets["in"](socket.room).emit("receiveMessage", {
      user: user,
      message: data
    });
    console.log(user);
  });
});

http.listen(5000, function() {
  console.log("listening on *:5000");
});