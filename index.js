import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import csurf from "csurf";
import path from "path";

dotenv.config();
const app = express();

//Express
app.set("view engine", "ejs");
const viewsPath = path.resolve("./views"); 
app.set("views", viewsPath);
app.use(express.urlencoded({ extended: false }));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 30, 
      secure: false,
    },
  })
);

//
app.use(csurf());

//view home page
app.get("/", (req, res) => {
  const name = req.session.user || "Guest";
  res.render("home", { name, csrfToken: req.csrfToken() });
});

//Save user name in session
app.post("/choose-name", (req, res) => {
  const name = req.body.name?.trim();
  if (!name) {
    return res.send(`<p>الرجاء إدخال اسم صالح.</p><a href="/">رجوع</a>`);
  }
  req.session.user = name;
  res.redirect("/");
});

//Destroy
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// CSRF
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).send("رمز الأمان (CSRF) غير صالح.");
  }
  res.status(500).send("حدث خطأ في الخادم.");
});

//Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
