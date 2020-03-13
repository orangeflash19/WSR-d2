const express = require("express");
const exphbs = require("express-handlebars");
const dotenv = require("dotenv");
dotenv.config();
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const bodyParser = require("body-parser");
const passport = require("passport");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

if (!process.env.KEY && !process.env.IV) {
  console.error("FATAL ERROR: encryption key and iv not defined");
  process.exit(1);
}

const port = process.env.PORT || 3000;

//map global promise - get rid of warning
mongoose.Promise = global.Promise;
//connect to mongoose database
mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Mongodb Connected......"))
  .catch(err => console.log(err));

mongoose.set("useCreateIndex", true);

//handlebars Middleware
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//method override Middleware
app.use(methodOverride("_method"));

//express session Middleware
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

// passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//flash Middleware
app.use(flash());

//global Variables
app.use(function(req, res, next) {
  var ad;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  //res.locals.user = req.user || null;
  res.locals.admin = null;
  res.locals.witness = null;
  if (req.user) {
    if (req.user.username) {
      res.locals.admin = req.user.username;
    }

    if (req.user.email) {
      res.locals.witness = req.user.email;
    }
  }

  next();
});

// Load Routes
const witness = require("./routes/witness");
const admin = require("./routes/admin");
//
// Use Routes
app.use("/witness", witness);
app.use("/admin", admin);

// Passport config file
require("./config/passport")(passport);

// Static Folder
app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", express.static(path.join(__dirname, "public")));
app.use("/witness", express.static(path.join(__dirname, "public")));

// MODULE 1 part:
// Videocall part:
let clients = 0;
io.on("connection", function(socket) {
  socket.on("NewClient", function() {
    if (clients < 2) {
      if (clients == 1) {
        this.emit("CreatePeer");
      }
    } else {
      this.emit("SessionActive");
    }
    clients++;
  });

  socket.on("Offer", SendOffer);
  socket.on("Answer", SendAnswer);
  socket.on("disconnect", Disconnect);
});

function Disconnect() {
  if (clients > 0) {
    clients--;
    this.emit("RemovePeer");
  }
}

function SendOffer(offer) {
  this.broadcast.emit("BackOffer", offer);
}

function SendAnswer(data) {
  this.broadcast.emit("BackAnswer", data);
}

// videocall part end

//Index or homepage route
app.get("/", (req, res) => {
  const title = "WSR";
  res.render("index", {
    title: title
  });
});

//about route
app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/videoscreen", (req, res) => {
  res.render("videoscreen");
});

// Logout user route
app.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "you are now logged out");
  res.redirect("/");
});

// load Witness model
require("./models/Witness");
const Witness = mongoose.model("witnesses");

// Delete witness account
app.delete("/admin/witness-list/:email", (req, res) => {
  Witness.deleteOne({ email: req.params.email }).then(() => {
    req.flash("success_msg", "witness Deleted");
    res.redirect("/admin/witness-list");
  });
});

//starts the server
http.listen(port, () => {
  console.log(`server started on port ${port}`);
});
