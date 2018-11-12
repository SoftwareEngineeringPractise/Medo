const express = require("express");
const userModel = require("../models/user");
const contentModel = require("../models/content");
const userspaceModel = require("../models/userspace");
const passport = require("../config/passport");

const router = express.Router();

let responseData;


  // 因为前后端分离开发，需要处理跨域，所以对所有请求均设置响应头
  router.use(function (req, res, next) {
    responseData = {
        // 状态码 0表示返回信息正常，其他值表示信息异常
        code: 0,
        // 返回的消息 返回字符串，便于调试
        message: "",
        // 返回的数据
        data: undefined
    };
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
  });
  // 如果是预请求，就直接终结请求-响应循环
  router.options('*', function (req, res, next) {
    res.end();
  })




// 用户登录接口
  router.post("/login", function(req, res, next) {
    passport.authenticate("local.login", function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        responseData.code = 1;
        responseData.message = info;
        return res.json(responseData);
      }
      req.login(user, loginErr => {
        if (loginErr) {
          return next(loginErr);
        }
        req.session.user = user;
        responseData.message = "登录成功";
        return res.json(responseData);
      });
    })(req, res, next);
  });
  
  
  // 用户登出接口
  router.get("/logout", function(req, res, next) {
    if (req.isAuthenticated()){
        req.logout();
        responseData.code = 0;
        responseData.message = "退出成功";
      }else{
          responseData.code = 2;
          responseData.message = "用户没有登录"
          res.json(responseData);
      }
    res.json(responseData);
  });
  

  // 用户注册接口
  router.post("/register", function(req, res, next) {
    passport.authenticate("local.register", function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        responseData.code = 1
        responseData.message = info;
        return res.json(responseData);
      }
      responseData.code = 0
      responseData.message = "用户注册成功";
      return res.json(responseData);
    })(req, res, next);
  });
  

// 用户信息
router.post("/userinfo", (req, res, next) => {
    if(req.isAuthenticated()){
        userspaceModel.findOne({user: req.user._id}, (err, userspace) => {
            if (userspace) {
                responseData.code = 0;
                responseData.message = "用户信息返回成功！";
                console.log(userspace);
                responseData.data = {
                    username:req.user.username,
                    isadmin:req.user.isadmin,
                    phonenumber:req.user.phonenumber,
                    firstname:req.user.firstname,
                    lastname: req.user.lastname,
                    email: req.user.email,
                    role: req.user.role,
                    gender: userspace.gender,
                    motto: userspace.motto,
                    description: userspace.description,
                    realname: userspace.realname
                };
                return res.json(responseData);
            } else {
                responseData.code = 1;
                responseData.message = "没有该用户！";
                return res.json(responseData);
            }
        });
    } else {
        responseData.code = 2;
        responseData.message = "用户未登录！";
        return res.json(responseData);
    }
});


// 用户信息修改
router.get("/userinfo/edit", (req, res, next) => {
    let username=req.body.username;
    let password = req.body.password
    let phonenumber=req.body.phonenumber;
    let firstname=req.body.firstname;
    let lastname=req.body.lastname;
    let email=req.body.email;
    let role=req.user.role;
    let gender=req.body.gender;
    let motto=req.body.motto;
    let description=req.body.description;
    let realname=req.body.realname;
    if(req.isAuthenticated()){
        userspaceModel.findOne({user: req.user._id}, (err, userspace) => {
            if (userspace) {
                responseData.code = 0;
                responseData.message = "用户信息返回成功！";
                console.log(userspace);
                responseData.data = {
                    username:req.user.username,
                    isadmin:req.user.isadmin,
                    phonenumber:req.user.phonenumber,
                    firstname:req.user.firstname,
                    lastname: req.user.lastname,
                    email: req.user.email,
                    role: req.user.role,
                    gender: userspace.gender,
                    motto: userspace.motto,
                    description: userspace.description,
                    realname: userspace.realname
                };
                return res.json(responseData);
            } else {
                responseData.code = 1;
                responseData.message = "没有该用户！";
                return res.json(responseData);
            }
        });
    } else {
        responseData.code = 2;
        responseData.message = "用户未登录！";
        return res.json(responseData);
    }
});

// 内容添加的保存
router.post("/content/add", (req, res, next) => {
    let title = req.body.title;
    let category = req.body.category;
    let description = req.body.description;
    let content = req.body.content;
    // 后端进行简单的验证
    if (title === "") {
        // 如果标题为空，渲染错误页面
        res.render("admin/error", {
            url: null,
            userinfo: req.userinfo,
            message: "标题不能为空"
        });
        return;
    } else if (description === "") {
        // 如果简介为空，渲染错误页面
        res.render("admin/error", {
            url: null,
            userinfo: req.userinfo,
            message: "简介不能为空"
        });
        return;
    } else if (content === "") {
        // 如果正文为空，渲染错误页面
        res.render("admin/error", {
            url: null,
            userinfo: req.userinfo,
            message: "正文不能为空"
        });
        return;
    } else {
        // 一切正常，存入数据库
        contentModel.create({
            title: title,
            category: category,
            author: req.user._id.toString(),
            description: description,
            content: content
        }, (err) => {
            if (!err) {
                // 保存成功
                res.render("admin/success", {
                    url: "/admin/content",
                    userinfo: req.userinfo,
                    message: "提交成功！"
                });
            } else {
                throw err;
            }
        });
    }
});


// 内容修改的界面
router.get("/content/edit", (req, res, next) => {
    // 获取需要修改内容的id
    let id = req.query.id;
    // 从数据库中查询
    contentModel.findById(id, (err, content) => {
        if (content) {
            // 如果数据存在，从数据库中查询出所有分类
            categoryModel.find({}, (err, categories) => {
                if (!err) {
                    // 渲染修改模板视图
                    res.render("admin/content/edit", {
                        userinfo: req.userinfo,
                        categories: categories,
                        content: content
                    });
                } else {
                    throw err;
                }
            });
        } else {
            // 如果该内容不存在
            res.render("admin/error", {
                url: null,
                userinfo: req.userinfo,
                message: "该内容不存在！"
            });
        }
    });
});

// 内容的修改保存
router.post("/content/edit", (req, res, next) => {
    // 获取数据
    let title = req.body.title;
    let category = req.body.category;
    let description = req.body.description;
    let content = req.body.content;
    let id = req.query.id;

    // 后端进行简单的验证
    if (title === "") {
        // 如果标题为空，渲染错误页面
        res.render("admin/error", {
            url: null,
            userinfo: req.user,
            message: "标题不能为空!"
        });
        return;
    } else if (description === "") {
        // 如果简介为空，渲染错误页面
        res.render("admin/error", {
          url: null,
          userinfo: req.user,
          message: "简介不能为空!"
        });
        return;
    } else if (content === "") {
        // 如果正文为空，渲染错误页面
        res.render("admin/error", {
          url: null,
            userinfo: req.user,
          message: "正文不能为空!"
        });
        return;
    } else {
        // 一切正常，更新数据库
        contentModel.update({
            _id: id
        }, {
                title: title,
                category: category,
                description: description,
                content: content
            }, (err) => {
                if (!err) {
                    // 保存成功
                    res.render("admin/success", {
                      url: "/admin/content",
                      userinfo: req.user,
                      message: "修改成功！"
                    });
                } else {
                    throw err;
                }
            });
    }
});


// 内容的删除
router.get("/content/delete", (req, res, next) => {
    // 获取id
    let id = req.query.id;
    // 根据id删除数据
    contentModel.remove({
        _id: id
    }, (err) => {
        if (!err) {
            // 删除成功
            res.render("admin/success", {
                url: "/admin/content",
                userinfo: req.userinfo,
                message: "删除成功！"
            });
        } else {
            // 出错
            res.render("admin/error", {
                url: "/admin/content",
                userinfo: req.userinfo,
                message: "删除失败！"
            });
        }
    });
});





// 管理员类别查询
router.post("/categories", (req, res, next) => {
    categoryModel.find({}, (err, categories) => {
        if (!err) {
            responseData.code = 0;
            responseData.message = "分类";
            responseData.categories = categories;
            return res.json(responseData);
        } else {
            throw err;
        }
    });
});


// 评论
router.get("/comment", (req, res) => {
    let contentId = req.query.contentId || "";
    contentModel.findById(contentId, (err, content) => {
        if (!err) {
            res.json(content.comment);
            return;
        } else {
            throw err;
            return;
        }
    });
});



router.post("/comment/post", (req, res) => {
    let contentId = req.body.contentId;
    let comment = req.body.comment;
    // 构建评论结构
    let commentData = {
        username: req.user.username,
        postTime: new Date(),
        content: comment
    }

    contentModel.findById(contentId, (err, content) => {
        if (!err) {
            content.comment.push(commentData);
            content.save();
            res.json(content);
            return;
        } else {
            throw err;
            return;
        }
    });
});


module.exports = router;