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

const Joi = require("joi");

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
  const userSchema = Joi.object().keys({
    username: Joi.string()
      .min(3)
      .required(),
    email: Joi.string()
      .email({ minDomainAtoms: 2 })
      .required(),
    password: Joi.string()
      .regex(/^[a-zA-Z0-9]{3,30}$/)
      .required(),
    passwordver: Joi.any()
      .valid(Joi.ref("password"))
      .required()
      .options({ language: { any: { allowOnly: "must match password" } } })
  });

  const results = Joi.validate(req.body, userSchema);
  //console.log(results);

  if (results.error) {
    res.status(400).send({ error: results.error.details[0].message });
    return;
  } else {
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

app.get("/users/logout", function(req, res, next) {
  if (req.session) {
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        return res.json({ loggedOut: true });
      }
    });
  }
});

var chatHistory = [];
var counter = [];

io.on("connection", (socket, user) => {
  var user = socket.request.session.user;

  socket.on("test", async function(data) {
    console.log(data);

    try {
      const wishes = await Wish.find({});
      //console.log(wishes);
      socket.emit("history", wishes);

      const myWishes = await Wish.find({ sender: user });
      //console.log(myWishes);
      socket.emit("myWishesList", myWishes);
    } catch (err) {
      console.log("error");
    }
  });
  /*
  setInterval(function() {
    socket.emit("refresh", "hi client");
  }, 60000);
*/
  socket.on("sendWish", (wish, callback) => {
    const newWish = new Wish({ wish: wish, sender: user });

    newWish.save(function(err) {
      if (err) {
        return callback(err);
      }

      io.emit("updatewishes", newWish);
      socket.emit("myNewestWish", newWish);
      setTimeout(function() {
        io.emit("refresh", newWish);
      }, 40000);
    });
  });

  socket.on("joinRoom", function(room) {
    socket.join(room);
    socket.room = room;
    console.log("you joined " + room);

    var historyRoom = chatHistory.filter(function(room) {
      return room.room === socket.room;
    });

    var historyLikes = counter.filter(function(room) {
      return room.room === socket.room;
    });

    //console.log(historyRoom);
    console.log(historyLikes);
    socket.emit("chatHistory", historyRoom);
    socket.emit("likesHistory", historyLikes);
  });

  socket.on("leaveRoom", function() {
    console.log("you're about to leave " + socket.room);
    socket.leave(socket.room);
    console.log("left room");
  });

  socket.on("sendMessage", function(data) {
    io.sockets["in"](socket.room).emit("receiveMessage", {
      user: user,
      message: data
    });
    //console.log(user);
    chatHistory.push({ room: socket.room, user: user, chat: data });
    //console.log(chatHistory);
  });

  socket.on("clicked", function(data) {
    console.log(data.count);
    counter.push({ room: socket.room, likes: data.count });
  });

  socket.on("disconnect", () => {
    console.log(user + " disconnected");
  });
});

http.listen(5000, function() {
  console.log("listening on *:5000");
});
