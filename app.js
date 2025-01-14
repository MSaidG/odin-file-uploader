const express = require("express");
const app = express();
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const passport = require("passport");
const { prisma } = require("./db/queries");
const authRouter = require("./routers/auth");
const uploadRouter = require("./routers/upload");
var flash = require("connect-flash");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash());
app.use(express.static("public"));
app.use(
  session({
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
    secret: "a santa at nasa",
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);
app.use(passport.authenticate("session"));

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.use("/", authRouter);
app.use("/upload", uploadRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
