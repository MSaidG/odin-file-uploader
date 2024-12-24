const router = require("express").Router();
const controller = require("../controllers/authController");

router.get("/login", (req, res) => {
  res.render("login", { message: req.session.messages });
  req.session.messages = null;
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
  controller.passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureMessage: true,
  })
);

router.get("/signup", (req, res) => {
  res.render("signup", { user: req.user });
});

router.post("/signup", controller.signupPost);

module.exports = router;
