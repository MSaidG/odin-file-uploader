const bcrypt = require("bcryptjs");
const db = require("../db/queries");
const LocalStrategy = require("passport-local");
const passport = require("passport");
const { body, validationResult } = require("express-validator");

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

const emailErr = "Must be a valid email address";
const validateUser = [
  body("email")
    .trim()
    .isEmail()
    .withMessage(emailErr)
    .custom(async (value) => {
      const user = await db.getUserByEmail(value);
      if (user.id) {
        throw new Error("Email already in use");
      }
    }),

  body("username")
    .trim()
    .escape()
    .custom(async (value) => {
      const user = await db.getUserByUsername(value);
      if (user.id) {
        throw new Error("Username already in use");
      }
    }),

  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 chars long")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lower case letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an upper case letter")
    .matches(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage("Password must contain a special character"),

  body("confirm-passwor").custom((value, { req }) => {
    return value === req.body.password;
  }),
];

const signupPost = [
  validateUser,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("signup", {
        errors: errors.array(),
        username: req.body.username,
        email: req.body.email,
      });
    } else {
      let { username, email, password } = req.body;
      bcrypt.hash(password, 10, async (err, hash) => {
        if (err) {
          console.log(err);
          return next(err);
        }
        password = hash;

        await db
          .createUser({ username, email, password })
          .then((res) => {
            console.log(res);
            res.redirect("/");
          })
          .catch((err) => {
            return next(err);
          })
          .finally(() => prisma.$disconnect());
      });
    }
  },
];

module.exports = {
  signupPost,
  passport,
};
