var express = require("express");
var userModel = require("../models/user");
var categoryModel = require("../models/category")
var contentModel = require("../models/content");
var router = express.Router();
var pagination = require("../modules/pagination");

router.use((req, res, next) => {
    if (!req.isAuthenticated()) {
        console.log("Why");
        res.redirect("/");
    } else {
        if (req.user.verified) {
            next();
        } else {
            res.send("<h2>您没有该页面的访问权限！</h2>");
        }
    }
});

/* GET admin page. */
router.get("/", (req, res, next) => {
    res.render("admin/index", {
        userinfo: req.userinfo
    });
});



router.get("/content", (req, res, next) => {
    let where = {};
    if(!req.user.isadmin){
        where = {author:req.user._id};
    }
    pagination({
        limit: 10,
        // 需要操作的数据库模型
        model: contentModel,
        // 需要控制分页的url
        url: "/admin/content",
        // 渲染的模板页面
        ejs: "admin/content",
        // 查询的条件
        where: where,
        // 需要跨集合查询的条件
        populate: ["category", "author"],
        res: res,
        req: req
    });
});

// 博客内容的添加界面
router.get("/content/add", (req, res, next) => {
    // 从数据中读取分类信息
    categoryModel.find({}, (err, categories) => {
        if (!err) {
            res.render("admin/content/add", {
                userinfo: req.userinfo,
                categories: categories
            });
            return;
        } else {
            throw err;
            return;
        }
    });
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
                res.set("refresh", "3;url=/admin/content");
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
                    res.set("refresh", "3;url=/admin/content");
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
            res.set("refresh", "3;url=/admin/content");
            res.render("admin/success", {
                url: "/admin/content",
                userinfo: req.userinfo,
                message: "删除成功！"
            });
        } else {
            // 出错
            // res.set("refresh", "3;url=/admin/content");
            res.render("admin/error", {
                url: "/admin/content",
                userinfo: req.userinfo,
                message: "删除失败！"
            });
        }
    });
});



// 以下内容只能管理员用户才有访问权限

router.use((req, res, next) => {
    if (req.user.isadmin) {
      next();
    } else {
      res.send("<h2>您没有该页面的访问权限！</h2>");
    }
});


// 用户管理首页
router.get("/user", (req, res, next) => {
    pagination({
        limit: 10,
        model: userModel,
        url: "/admin/user",
        ejs: "admin/user",
        where: {}, res: res, req: req
    });
});


// 用户的增加
router.get("/user/add", (req, res, next) => {
    // 渲染分类添加模板
    res.render("admin/user/add", {
        userinfo: req.userinfo
    });
});

router.post("/user/add", (req, res, next) => {
    // 获取用户名，默认为""
    let username = req.body.username || "";
    let password = req.body.password || "";
    let isadmin = req.body.isadmin || false;

    // 如果用户名为空
    if (username === "") {
        // 渲染一个错误提示
        res.render("admin/error", {
            userinfo: req.userinfo,
            url: null,
            message: "用户名不能为空！"
        });
        return;
    }
    // 如果用户名为空
    if (password === "") {
        // 渲染一个错误提示
        res.render("admin/error", {
            userinfo: req.userinfo,
            url: null,
            message: "密码不能为空！"
        });
        return;
    }

    // 从数据库中查询该名称是否已存在
    userModel.findOne({ username: username }, (err, docs) => {
        // 如果数库库中已存在该名称
        if (docs) {
            // 渲染一个错误提示
            res.render("admin/error", {
                userinfo: req.userinfo,
                url: null,
                message: "该用户名名称已被使用！"
            });
            return;
        } else {
            // 不存在则新建一个数据
            userModel.create({ username: username, password: password, isadmin: isadmin }, err => {
                if (!err) {
                    // 渲染一个错误提示
                    res.set("refresh", "3;url=/admin/user");
                    res.render("admin/success", {
                        userinfo: req.userinfo,
                        message: "添加成功！",
                        // 跳转到该路由
                        url: "/admin/user"
                    });
                    return;
                }
            });
        }
    });
});


// 用户编辑
router.get("/user/edit", (req, res, next) => {
    // 获取用户提交过来的id
    let id = req.query.id || "";
    // 根据id从数据库中查询相关数据
    userModel.findOne({ _id: id }, (err, user) => {
        if (user) {
            res.render("admin/user/edit", {
                userinfo: req.userinfo,
                user: user
            });
        } else {
            // 若不存在渲染错误提示面板
            res.render("admin/error", {
                userinfo: req.userinfo,
                url: null,
                message: "该用户不存在！"
            });
        }
    });
});


// 用户编辑的保存
router.post("/user/edit", (req, res, next) => {
    // 获取修改后的id及名称
    let id = req.query.id;
    let username = req.body.username;
    let password = req.body.password;
    let isadmin = req.body.isadmin;

    userModel.findById(id, (err, user) => {
        if (user) {
            if (username === "admin" && req.userinfo.username != "admin") {
                res.render("admin/error", {
                    url: null,
                    userinfo: req.userinfo,
                    message:
                        "不能直接修改超级管理员用户!"
                });
                return;
            }
            // 数据没有变更
            if (username === user.username && password === user.password && eval(isadmin) === user.isadmin) {
                res.render("admin/success", {
                    url: "/admin/user",
                    userinfo: req.user,
                    message: "未修改任何数据！"
                });
                return;
            }
            // 查询用户是否与数据库中的冲突
            userModel.findOne(
                {
                    _id: { $ne: id },
                    username: username
                },
                (err, docs) => {
                    if (docs) {
                        // 数据冲突
                        res.render("admin/error", {
                          userinfo: req.user,
                          url: null,
                          message: "该用户已存在！"
                        });
                        return;
                    } else {
                        // 后端进行简单的验证
                        if (username === "") {
                            // 如果标题为空，渲染错误页面
                            res.render(
                              "admin/error",
                              {
                                url: null,
                                userinfo: req.user,
                                message:
                                  "用户名不能为空!"
                              }
                            );
                            return;
                        } else if (password === "") {
                            // 如果简介为空，渲染错误页面
                            res.render(
                              "admin/error",
                              {
                                url: null,
                                userinfo: req.user,
                                message:
                                  "密码不能为空!"
                              }
                            );
                            return;
                        } else if (username === "admin" && req.user.username != "admin") {
                                 res.render(
                                   "admin/error",
                                   {
                                     url: null,
                                     userinfo:
                                         req.user,
                                     message:
                                       "不能直接修改超级管理员用户!"
                                   }
                                 );
                                 return;
                               } else {
                                 userModel.update(
                                   {
                                     _id: id
                                   },
                                   {
                                     username: username,
                                     password: password,
                                     isadmin: isadmin
                                   },
                                   err => {
                                     if (!err) {
                                       if (
                                         req.user
                                            .username ===
                                         user.username
                                       ) {
                                           req.logout();
                                           res.redirect('/');
                                       }
                                       // 保存成功
                                       res.render(
                                         "admin/success",
                                         {
                                           url:
                                             "/admin/user",
                                           userinfo:
                                             req.userinfo,
                                           message:
                                             "修改成功！"
                                         }
                                       );
                                     } else {
                                       throw err;
                                     }
                                   }
                                 );
                               }
                    }
                }
            );
        } else {
            // 若不存在
            res.render("admin/error", {
                userinfo: req.user,
                url: null,
                message: "该用户不存在！"
            });
            return;
        }
    });
});


// 内容的删除
router.get("/user/delete", (req, res, next) => {
    // 获取id
    let id = req.query.id;
    // 根据id删除数据
    userModel.remove({
        _id: id
    }, (err) => {
        if (!err) {
            // 删除成功
            res.set("refresh", "3;url=/admin/user");
            res.render("admin/success", {
                url: "/admin/user",
                userinfo: req.userinfo,
                message: "删除成功！"
            });
        } else {
            // 出错
            res.render("admin/error", {
                url: "/admin/user",
                userinfo: req.userinfo,
                message: "删除失败！"
            });
        }
    });
});


// 管理分类
router.get("/category", (req, res, next) => {
    pagination({
        limit: 10,
        model: categoryModel,
        url: "/admin/category",
        ejs: "admin/category",
        where: {},
        res: res,
        req: req
    });
});

// 添加分类
router.get("/category/add", (req, res, next) => {
    // 渲染分类添加模板
    res.render("admin/category/add", { userinfo: req.userinfo });
});

router.post("/category/add", (req, res, next) => {
    // 获取分类名称，默认为""
    let name = req.body.name || "";

    // 如果名称为空
    if (name === "") {
        // 渲染一个错误提示
        res.render("admin/error", {
            userinfo: req.userinfo,
            url: null,
            message: "分类名称不能为空！"
        });
        return;
    }
    // 从数据库中查询该名称是否已存在
    categoryModel.findOne({ name: name }, (err, docs) => {
        // 如果数库库中已存在该名称
        if (docs) {
            // 渲染一个错误提示
            res.render("admin/error", {
                userinfo: req.userinfo,
                url: null,
                message: "该分类名称已存在！"
            });
            return;
        } else {
            // 不存在则新建一个数据
            categoryModel.create({
                name: name
            }, (err) => {
                if (!err) {
                    // 渲染一个错误提示
                    res.set("refresh", "3;url=/admin/category");
                    res.render("admin/success", {
                        userinfo: req.userinfo,
                        message: "添加成功！",
                        // 跳转到该路由
                        url: "/admin/category"
                    });
                    return;
                }
            });
        }
    });
});


// 分类的修改界面
router.get("/category/edit", (req, res, next) => {
    // 获取用户提交过来的id
    let id = req.query.id || "";
    // 根据id从数据库中查询相关数据
    categoryModel.findOne({ _id: id }, (err, category) => {
        if (category) {
            // 如何数据存在则渲染修改界面
            res.render("admin/category/edit", {
                userinfo: req.userinfo,
                category: category
            });
        } else {
            // 若不存在渲染错误提示面板
            res.render("admin/error", {
                userinfo: req.userinfo,
                url: null,
                message: "该分类不存在！"
            });
        }
    });
});


// 分类修改的保存
router.post("/category/edit", (req, res, next) => {
    // 获取修改后的id及名称
    let id = req.query.id;
    let name = req.body.name;

    // 根据id从数据库中查询相关数据
    categoryModel.findById(id, (err, category) => {
        if (category) {
            // 若数据存在
            // 简单验证---如果数据没修改
            if (name === category.name) {
                res.render("admin/success", {
                    url: "/admin/category",
                    userinfo: req.userinfo,
                    message: "修改成功！"
                });
                return;
            }
            // 查询用户修改的分类是否与数据库中的冲突
            categoryModel.findOne({
                _id: { $ne: id },
                name: name
            }, (err, docs) => {
                if (docs) {
                    // 数据冲突
                    res.render("admin/error", {
                        userinfo: req.userinfo,
                        url: null,
                        message: "该分类已存在！"
                    });
                    return;
                } else {
                    // 更新数据
                    categoryModel.update({ _id: id }, { $set: { name: name } }, (err) => {
                        if (!err) {
                            // 不出错
                            res.set("refresh", "3;url=/admin/category");
                            res.render("admin/success", {
                                userinfo: req.userinfo,
                                url: "/admin/category",
                                message: "修改成功！"
                            });
                            return;
                        } else {
                            // 出错
                            res.render("admin/error", {
                                userinfo: req.userinfo,
                                url: null,
                                message: "修改失败！"
                            });
                            return;
                        }
                    });
                }
            });
        } else {
            // 若不存在
            res.render("admin/error", {
                userinfo: req.userinfo,
                url: null,
                message: "该分类不存在！"
            });
            return;
        }
    });
});

// 分类的删除
router.get("/category/delete", (req, res, next) => {
    // 获取需要删除的分类id
    let id = req.query.id || "";
    // 从数据库中删除数据
    categoryModel.remove({ _id: id }, (err) => {
        if (!err) {
            // 删除成功
            res.set("refresh", "3;url=/admin/category");
            res.render("admin/success", {
                url: "/admin/category",
                userinfo: req.userinfo,
                message: "删除成功！"
            });
        } else {
            // 删除失败
            res.render("admin/error", {
                url: null,
                userinfo: req.userinfo,
                message: "删除失败！"
            });
        }
    });
});



module.exports = router;
