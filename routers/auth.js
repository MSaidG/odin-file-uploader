const passport = require("passport");
const router = require("express").Router();
const LocalStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
const db = require("../db/queries");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await db.getUserByUsername(username);
    if (!user) {
      return done(null, false, { message: "Incorrect username" });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return done(null, false, { message: "Incorrect password" });
    }
    return done(null, user);
  })
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  const user = await db.getUserById(id);
  done(null, user);
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: true,
  })
);

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", (req, res) => {
  const { username, email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  db.createUser({ username, email, password: hash });
  res.redirect("/login");
});

module.exports = router;
