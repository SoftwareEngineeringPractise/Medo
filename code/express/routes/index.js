const express = require("express");
const contentModel = require("../models/content");
const marked = require("marked");
const pagination = require("../modules/pagination");
const passport = require("passport");
const router = express.Router();


// Markdown Support
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: false,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});


router.get("/", (req, res) => {
  pagination({
    limit: 2,
    model: contentModel,
    url: "/",
    ejs: "main/index",
    where: {},
    res: res,
    req: req,
    populate: ["category", "author"],
    // 其他数据
    data: {},
  });
});



// user log in
router.get("/users/login", (req, res) => {
  res.render("users/login", { referer: req.headers.referer });
});

router.get("/test", (req, res)=>{
        res.render("main/test");
});


// user register
router.get("/users/register", (req, res) => {
  res.render("users/register");
});

router.post("/users/login", function (req, res, next) {
  passport.authenticate("local.login", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send({ success: false, message: "authentication failed" });
    }
    req.login(user, loginErr => {
      if (loginErr) {
        return next(loginErr);
      }
      if (req.body.referer && (req.body.referer !== undefined && req.body.referer.slice(-6) !== "/login")) {
        res.redirect(req.body.referer);
      } else {
        res.redirect("/");
      }
    });
  })(req, res, next);
});


router.get("/users/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

router.post("/users/register", function(req, res, next) {
  passport.authenticate("local.register", function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send(info);
    }
    return res.redirect("/users/login");
  })(req, res, next);
});





router.get("/views", (req, res) => {
  let contentid = req.query.contentId;
  contentModel.findById(contentid).populate(["category", "author"]).then((content) => {
    let contentHtml = marked(content.content);
    res.render("main/views", {
      contentHtml: contentHtml,
      content: content,
      userinfo:req.user || {},
    });
    content.views++;
    content.save();
  });
});

// 将其暴露给外部使用
module.exports = router;