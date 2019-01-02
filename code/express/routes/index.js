const express = require("express");
const marked = require("marked");
const pagination = require("../modules/pagination");
const passport = require("passport");
const followModel = require("../models/follow");
const verificationModel = require("../models/verification");
const File = require("../models/file");
const emailModel = require("../models/emailvalidation");
const userModel = require("../models/user");
const contentModel = require("../models/content");
const categoryModel = require("../models/category");
const router = express.Router();
const path = require("path");
const fse = require("fs-extra");
const utils = require("../utils/utils");
const multer = require("multer");
const moment = require("moment");
// 文件上传与删除


const storageActivity = multer.diskStorage({
  destination: function (req, file, cb) {
    let year = moment().get('year')
    let month = moment().get('month') + 1
    let day = moment().get('date')
    let filePath = path.resolve(__dirname, `../public/imgs/files/${year}/${month}/${day}`)

    fse.ensureDir(filePath, function () {
      cb(null, filePath)
    })
  },
  filename: function (req, file, cb) {
    let name = utils.randomWord(false, 12)
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
      name = name + '.jpg'
    } else if (file.mimetype === 'image/png') {
      name = name + '.png'
    }
    cb(null, name)
  }
})
const uploadActivity = multer({ storage: storageActivity })

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

router.get("/verification", (req, res) => {
  if (req.user) {
    userModel
      .findById(req.user, {
        // 去除保密字段
        password: 0,
        salt: 0,
        hash: 0
      })
      .populate(["userInfo"])
      .then(docs => {
        if (!docs) {
          res.render("main/error", { message: "没有该用户！" });
        } else {
          res.render("main/verification", {
            message: "返回我的信息",
            code: 1,
            docs: docs
          });
        }
      })
      .catch(err => {
        res.render("main/error", { message: err });
      });
  } else {
    return res.render("main/error", { message: "用户未登录！" });
  }
});

router.post("/verification", uploadActivity.single("file"), function (req, res) {
  if (req.file) {
    let name = ''
    if (req.body.fileName !== undefined) {
      name = req.body.fileName
    }
    let path = req.file.path;
    // 所有文件都保存在public目录下面
    path = path.replace(/\\/g, "/");
    let url = path.substring(path.indexOf('public') - 1);
    const newverification = new verificationModel(); 
    File.create(
      {
        name: name,
        size: req.file.size,
        type: req.file.mimetype,
        path: path,
        url: url
      },
      function(err, newfile) {
        if (err) {
          return res.tools.setJson(400, 1, err);
        } else {
          newverification.verifyUrl = url;
          newverification.userId = req.user._id;
          newverification.province = req.body.province;
          newverification.school = req.body.school;
          newverification.department = req.body.department;
          newverification.institute = req.body.institute;
          newverification.role = req.body.role;
          newverification.description = req.body.description;
          newverification.save();
          res.set("refresh", "3;url=/user/me");
          return res.render("main/redirect", {
            success: true,
            msg: "认证信息提交成功！",
            target: "个人信息界面",
            targeturl: "/user/me"
          });
        }
      }
    );
  }
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
      console.log(user)
      return res.send({success:false, message:"email is not validated"});
    }
    req.login(user, loginErr => {
      if (loginErr) {
        return next(loginErr);
      }
      if (req.body.referer && (req.body.referer !== undefined && req.body.referer.slice(-6) !== "/login" && req.body.referer.indexOf("EmailValidation")==req.body.referer.length)) {
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
      return res.render("main/redirect", { success: false, msg: err});
    }
    if(!emailval){
      return res.render("main/redirect", {success:false, msg: "该链接不存在或已经失效！"});
    }
    let id = emailval.userId;
    userModel.findById(id, (err, user)=>{
      if(err){
        return res.render("main/redirect", { success: false, msg:err});
      }
      user.status = 1;
      user.save();
      res.set("refresh", "3;url=/users/login");
      return res.render("main/redirect", {
        success: true,
        msg: "邮箱认证成功！",
        target: "登录界面",
        targeturl: "/users/login"
      });
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


router.get("/settings", (req, res)=>{
  res.send("Null");
})

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


// 按用户名搜索 参数 q 返回 用户名包含字符串q的所有userspace
router.get('/advancedsearch', (req, res, next)=>{ 
    if (req.user) {
      userModel
        .findById(req.user, {
          // 去除保密字段
          password: 0,
          salt: 0,
          hash: 0
        })
        .populate(["userInfo"])
        .then(docs => {
          if (!docs) {
            res.render("main/error", { message: "没有该用户！" });
          } else {
            res.render("main/result", {
              message: "返回我的信息",
              code: 1,
              docs: docs
            });
          }
        })
        .catch(err => {
          res.render("main/error", { message: err });
        });
    } else {
      return res.render("main/result");
    }
  });


// 按用户名搜索 参数 q 返回 用户名包含字符串q的所有userspace
router.get('/search', (req, res, next)=>{ 
  let query = req.query.q || "";
  let where = { username: { $regex: query, $options: "i" } }
  pagination({
    limit: 10,
    model: userModel,
    url: "/",
    ejs: "main/result",
    where: where,
    res: res,
    req: req,
    populate: ["userInfo"],
    // 其他数据
    data: {},
  });
})

// 按学校搜索 参数 q 返回 学校包含字符串q的所有userspace
router.get('/search/school/:q', (req, res, next) => {
  let query = req.params.q || "";
  userinfoModel.find({ school: { $regex: query, $options: "i" } }, function (
    err,
    docs
  ) {
    if (err) {
      res.tools.setJson(400, 1, err);
    }
    if (docs) {
      res.tools.setJson(200, 0, "返回学校搜索结果成功", docs);
    }
  });
})

// 按院系搜索 参数 q  返回 院系包含字符串q的所有userspace
router.get('/search/department/:q', (req, res, next) => {
  let query = req.params.q || "";
  userinfoModel.find(
    { department: { $regex: query, $options: "i" } },
    function(err, docs) {
      if (err) {
        res.tools.setJson(400, 1, err);
      }
      if (docs) {
        res.tools.setJson(200, 0, "返回院系搜索结果成功", docs);
      }
    }
  );
})


// 将其暴露给外部使用
module.exports = router;