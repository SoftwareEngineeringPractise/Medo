const express = require("express");
const marked = require("marked");
const pagination = require("../modules/pagination");
const passport = require("passport");
const followModel = require("../models/follow");
const emailModel = require("../models/emailvalidation");
const userModel = require("../models/user");
const contentModel = require("../models/content");
const categoryModel = require("../models/category");
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
    limit: 10,
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
    if(user.status!=1){
      return res.send({success:false, message:"email is not validated"});
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


router.get("/emailvalidation", function(req, res, next){
  let code = req.query.v;
  emailModel.findOneAndDelete({code:code}, (err, emailval)=>{
    if(err){
      return res.render("main/emailval", { success: false, msg: err});
    }
    if(!emailval){
      return res.render("main/emailval", {success:false, msg: "该链接不存在或已经失效！"});
    }
    let id = emailval.userId;
    userModel.findById(id, (err, user)=>{
      if(err){
        return res.render("main/emailval", { success: false, msg:err});
      }
      user.status = 1;
      user.save();
      res.set("refresh", "5;url=/users/login");
      return res.render("main/emailval", { success: true, msg: "邮箱认证成功！"});
    });
    
  })
  // res.json({code : code});
});



router.get("/user/:user", (req, res) => {
  let userId = req.params.user;
  let code = 0;
  if(req.user){
    if (userId == 'me' || req.user._id == userId) {
        userId = req.user._id;
        code = 1;
    } else{
      followModel.findOne({ userId: req.user._id, followId: userId }, (err, result) => {
        if (result) {
          code = 3;
        } else {
          code = 2;
        }
      });
    }
  } else if(userId == 'me'){
    return res.render("main/error", {message:"用户未登录！"});
  }
    userModel.findById(
      userId,
      {
        // 去除保密字段
        password: 0,
        salt: 0,
        hash: 0
      }
    )
      .populate(["userInfo"])
      .then(docs => {
        if (!docs) {
          res.render("main/error", { message: "没有该用户！" });
        } else {
          res.render("main/user", {
            message: "返回我的信息",
            code: code,
            docs: docs
          });
        }
      })
      .catch(err => {
        res.render("main/error", { message: err });
      });
  }
);

router.get("/useredit/:user", (req, res) => {
  let userId = req.params.user;
  let code = 0;
  if (req.user) {
    if (userId == 'me' || req.user._id == userId) {
      userId = req.user._id;
      code = 1;
    } else {
      followModel.findOne({ userId: req.user._id, followId: userId }, (err, result) => {
        if (result) {
          code = 3;
        } else {
          code = 2;
        }
      });
    }
  } else if (userId == 'me') {
    return res.render("main/error", { message: "用户未登录！" });
  }
  userModel.findById(
    userId,
    {
      // 去除保密字段
      password: 0,
      salt: 0,
      hash: 0
    }
  )
    .populate(["userInfo"])
    .then(docs => {
      if (!docs) {
        res.render("main/error", { message: "没有该用户！" });
      } else {
        res.render("main/useredit", {
          message: "返回我的信息",
          code: code,
          docs: docs
        });
      }
    })
    .catch(err => {
      res.render("main/error", { message: err });
    });
}
);



router.get("/content/:username", (req, res)=>{
  let name = req.params.username;
  userModel.findOne({ username: name }, (err, specificuser) => {
    if (err) {
      res.render("main/error", { message: err });
    }
    if (!specificuser) {
      res.render("main/error", { message: "该用户不存在！" });
    }
    console.log(specificuser);
    pagination({
      limit: 10,
      model: contentModel,
      url: "/",
      ejs: "main/index",
      where: { author: specificuser._id },
      res: res,
      req: req,
      populate: ["category", "author"],
      // 其他数据
      data: {}
    });

  })
})


router.get("/category/:categoryname", function(req, res) {
  let name = req.params.categoryname;
  categoryModel.findOne({ name: name }, (err, category) => {
    if (err) {
      res.render("main/error", { message: err });
    } else if (!category) {
      res.render("main/error", { message: "该分类不存在！" });
    }
    pagination({
      limit: 2,
      model: contentModel,
      url: "/",
      ejs: "main/index",
      where: { category: category._id },
      res: res,
      req: req,
      populate: ["category", "author"],
      // 其他数据
      data: {}
    });
  });
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