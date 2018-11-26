const express = require("express");
const userModel = require("../../models/user");
const contentModel = require("../../models/content");
const userspaceModel = require("../../models/userspace");
const pagination = require("../../modules/api_pagination");
// const passport = require("../../config/passport");
const router = express.Router();

const passport = require("passport");
const path = require("path");
const fse = require("fs-extra");
const utils = require("../../utils/utils");
const multer = require("multer");
const moment = require("moment");

const ctrlUsers = require("./controllers/users");
const ctrlFiles = require("./controllers/files");
// const ctrlActivity = require("./controllers/activities");


// 前后端分离开发，需要处理跨域，对所有请求均设置响应头
// router.use(function (req, res, next) {

//     // 设置响应头
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Headers', 'content-type');
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     next();
// });
// // 如果是预请求，就直接终结请求-响应循环
// router.options('*', function (req, res, next) {
//     res.end();
// })



/**
 * 用户认证
 */
// 微信小程序用户登陆／注册
router.post('/users/wei_xin/auth',
    ctrlUsers.authWithWeiXinApp
)
// 修改我的用户名
router.put('/users/me/name',
    passport.authenticate('jwt', { session: false }),
    ctrlUsers.userUpdateName
)
// 修改我的手机号
router.put('/users/me/tel',
    passport.authenticate('jwt', { session: false }),
    ctrlUsers.userUpdateTel
)
// 修改我的电子邮箱
router.put('/users/me/email',
    passport.authenticate('jwt', { session: false }),
    ctrlUsers.userUpdateEmail
)





/**
 * 0. Get 用户简要信息
 */

router.get('/users/:id/info',(req, res, next)=>{
    userid = req.params.id // 用户名
    if(userid === "me"){ //登陆者信息
        userid = req.user._id;
    }
    userModel.findOne(
        {
            _id: userid,
        },
        { // 去除保密字段
            _id:0,
            password:0,
            salt:0,
            hash:0,
        },
        (err, docs) => {
            if(err){
                res.tools.setJson(404, 1, "信息获取失败！");
            }
            else if(!docs){
                res.tools.setJson(404, 2, "没有该用户！");
            }
            else{
                res.tools.setJson(200, 0, "返回用户信息"+userid, docs);
            }

        } );
    }
)


/**
 * 1. 导师实验室介绍
 */



 /**
  * 2. 所有公告list， 时间降序排列 分页
  */



  /**
   * 3. Get 对userid 的评价
   */


/**
 *  4.1 POST userid 的评价
 */



/**
 *  4.2 POST userid 的公告
 */



 /**
  * 公告List userid的公告 降序排列 分页
  */




/**
 * PUT 将contentid加到关注里
 */



/**
 * 加入或取消userid到me关注中
 */


/**
 * 加入或取消contentidid到me收藏中
 */


/**
 *  我关注的人 List 分页
*/


/**
 * 我收藏的文章 List 分页
 */



/**
 * 关注人的动态 List 时间倒序 分页
 */



/**
 * 模糊搜索 按username school List
 */



/**
 * 用户信息修改
 */


/**
 * 活动 routing
 */
// 获取指定的活动
// router.get('/activities/:activityId',
//     passport.authenticate('jwt', { session: false }),
//     ctrlActivity.activityReadOne
// )
// // 获取我创建的活动（最新的2个）
// router.get('/activities/my/start',
//     passport.authenticate('jwt', { session: false }),
//     ctrlActivity.myStartTopActivity
// )
// // 获取我创建的活动列表
// router.get('/activities/my/start/page/:page',
//     passport.authenticate('jwt', { session: false }),
//     ctrlActivity.myStartActivityList
// )
// // 获取我参加的活动（最新的2个）
// router.get('/activities/my/join',
//     passport.authenticate('jwt', { session: false }),
//     ctrlActivity.myJoinTopActivity
// )
// // 获取我参加的活动列表
// router.get('/activities/my/join/page/:page',
//     passport.authenticate('jwt', { session: false }),
//     ctrlActivity.myJoinActivityList
// )
// // 创建新的活动
// router.post('/activities',
//     passport.authenticate('jwt', { session: false }),
//     ctrlActivity.activityCreateOne
// )
// // 参加指定的活动
// router.post('/activities/:activityId/join',
//     passport.authenticate('jwt', { session: false }),
//     ctrlActivity.activityJoin
// )
// // 指定的活动签到
// router.post('/activities/:activityId/check_in',
//     passport.authenticate('jwt', { session: false }),
//     ctrlActivity.activityCheckIn
// )
// // 生成指定活动的二维码（用于签到）
// router.post('/activities/:activityId/qr_code',
//     passport.authenticate('jwt', { session: false }),
//     ctrlActivity.activityQrCodeCreate
// )

/**
 * 活动文件服务 routing
 */
const storageActivity = multer.diskStorage({
    destination: function (req, file, cb) {
        let year = moment().get('year')
        let month = moment().get('month') + 1
        let day = moment().get('date')
        let filePath = path.resolve(__dirname, `../../../public/image/activities/${year}/${month}/${day}`)

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
// todo:需要加入权限验证才能进行上传／删除文件

router.post('/file/activity',
    uploadActivity.single('image'),
    ctrlFiles.fileCreate
)
router.delete('/file/*?',
    ctrlFiles.fileDeleteOne
)




// 公告接口
router.get("/contents", function (req, res, next) {
    let where = {};
    let author = req.query.authorid;
    let category = req.query.categoryid;
    if (author) {
        where.author = author;
    }
    if (category) {
        where.category = category;
    }
    pagination({
        limit: 2,
        model: contentModel,
        where: where,
        res: res,
        req: req,
        populate: [
            "category",
            {
                path: "author",
                select: "username isadmin verified _id role",
                options: { limit: 5 }
            }
        ],
        params: {}
    });
});


// 查看指定id公告接口

router.get("/views", (req, res) => {
    let contentid = req.query.contentid;
    contentModel.findById(contentid).populate([
        "category",
        {
            path: "author",
            select: "username isadmin verified _id role",
        }
    ]).then((content) => {
        let contentHtml = marked(content.content);
        responseData.message = "返回id为" + contentid + "的公告"
        responseData.data = { contentHtml: contentHtml, content: content };
        res.json(responseData);
        content.views++;
        content.save();
    });
});


// 用户登录接口
router.post("/login", function (req, res, next) {
    passport.authenticate("local.login", function (err, user, info) {
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
router.get("/logout", function (req, res, next) {
    if (req.isAuthenticated()) {
        req.logout();
        responseData.code = 0;
        responseData.message = "退出成功";
    } else {
        responseData.code = 2;
        responseData.message = "用户没有登录"
        res.json(responseData);
    }
    res.json(responseData);
});


// 用户注册接口
router.post("/register", function (req, res, next) {
    passport.authenticate("local.register", function (err, user, info) {
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
    if (req.isAuthenticated()) {
        userspaceModel.findOne({ user: req.user._id }, (err, userspace) => {
            if (userspace) {
                responseData.code = 0;
                responseData.message = "用户信息返回成功！";
                let userinfo = {
                    username: req.user.username, isadmin: req.user.isadmin, phonenumber: req.user.phonenumber, firstname: req.user.firstname,
                    lastname: req.user.lastname, email: req.user.email, role: req.user.role
                };
                responseData.data = { info: userinfo, detail: userspace };
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


// 用户基本信息修改,不需要后台管理员审核
router.post("/userinfo/edit", (req, res, next) => {
    if (req.isAuthenticated()) {
        let username = req.body.username || req.user.username;
        let password = req.body.password || req.user.password;
        let phonenumber = req.body.phonenumber || req.user.phonenumber;
        let firstname = req.body.firstname || req.user.firstname;
        let lastname = req.body.lastname || req.user.lastname;
        let email = req.body.email || req.user.email;
        userspaceModel.findOne({ user: req.user._id }).populate(["user"]).then(userspace => {
            if (userspace) {
                if (username === "admin" && req.user.username != "admin") {
                    responseData.code = 2;
                    responseData.message = "不能直接修改超级管理员用户!";
                    res.json(responseData);
                    return;
                }
                // let likes = req.body.likes || userspace.likes;
                let gender = req.body.gender || userspace.gender;
                let motto = req.body.motto || userspace.motta;
                let description = req.body.description || userspace.description;
                let realname = req.body.realname || userspace.realname;
                // 数据没有变更
                if (username === userspace.user.username && password === userspace.user.password && phonenumber === userspace.user.phonenumber && firstname === userspace.user.firstname && lastname === userspace.user.lastname && email === userspace.user.email && gender === userspace.gender && motto === userspace.motto && description === userspace.description && realname === userspace.realname) {
                    responseData.code = 2;
                    responseData.message = "未修改任何数据！";
                    res.json(responseData);
                    return;
                }
                // 查询用户是否与数据库中的冲突
                userModel.findOne(
                    {
                        _id: { $ne: userspace.user },
                        username: username
                    },
                    (err, docs) => {
                        if (docs) {
                            // 数据冲突
                            responseData.code = 2;
                            responseData.message = "该用户已存在！";
                            res.json(responseData);
                            return;
                        } else {
                            // 后端进行简单的验证
                            if (username === "") {
                                // 如果标题为空，渲染错误页面
                                responseData.code = 2;
                                responseData.message = "用户名不能为空!";
                                res.json(responseData);
                                return;
                            } else if (password === "") {
                                // 如果简介为空，渲染错误页面
                                responseData.code = 2;
                                responseData.message = "密码不能为空!";
                                res.json(responseData);
                                return;
                            } else if (
                                username === "admin" &&
                                req.user.username != "admin"
                            ) {
                                responseData.code = 2;
                                responseData.message =
                                    "不能直接修改超级管理员用户!";
                                res.json(responseData);
                                return;
                            } else {
                                userModel.update(
                                    {
                                        _id: userspace.user
                                    },
                                    {
                                        username: username,
                                        password: password,
                                        email: email,
                                        phonenumber: phonenumber,
                                        firstname: firstname,
                                        lastname: lastname,
                                    },
                                    err => {
                                        if (!err) {
                                            if (
                                                req.user.username !=
                                                userspace.user.username
                                            ) {
                                                req.logout();
                                                responseData.message =
                                                    "修改用户核心信息，退出登录";
                                            }
                                            userspaceModel.update(
                                                {
                                                    user: userspace.user
                                                },
                                                {
                                                    gender: gender,
                                                    motto: motto,
                                                    description: description,
                                                    realname: realname
                                                },
                                                err => {
                                                    if (!err) {
                                                        responseData.code = 0;
                                                        responseData.message = "用户信息修改完成";
                                                        res.json(responseData);
                                                    } else {
                                                        throw err;
                                                    }
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
                responseData.code = 2;
                responseData.message = "该用户不存在！";
                res.json(responseData);
                return;
            }
        });
    } else {
        responseData.code = 2;
        responseData.message = "用户未登录！";
        return res.json(responseData);
    }
});


// 用户关键信息修改, 需要后台管理员审核
router.post("/verifiedinfo/edit", (req, res, next) => {
    if (req.isAuthenticated()) {
        // let s'chon'e = req.body.username || req.user.username;
        // let password = req.body.password || req.user.password;
        // let phonenumber = req.body.phonenumber || req.user.phonenumber;
        // let firstname = req.body.firstname || req.user.firstname;
        // let lastname = req.body.lastname || req.user.lastname;
        // let email = req.body.email || req.user.email;
        userspaceModel.findOne({ user: req.user._id }).populate(["user"]).then(userspace => {
            if (userspace) {
                if (username === "admin" && req.user.username != "admin") {
                    responseData.code = 2;
                    responseData.message = "不能直接修改超级管理员用户!";
                    res.json(responseData);
                    return;
                }
                let role = req.user.role || userspace.role;
                let school = req.body.school || userspace.school;
                let department = req.body.department || userspace.department;
                let institute = req.body.institute || userspace.institute;
                // 数据没有变更
                if (username === userspace.user.username && password === userspace.user.password && phonenumber === userspace.user.phonenumber && firstname === userspace.user.firstname && lastname === userspace.user.lastname && email === userspace.user.email && gender === userspace.gender && motto === userspace.motto && description === userspace.description && realname === userspace.realname) {
                    responseData.code = 2;
                    responseData.message = "未修改任何数据！";
                    res.json(responseData);
                    return;
                }
                // 查询用户是否与数据库中的冲突
                userModel.findOne(
                    {
                        _id: { $ne: userspace.user },
                        username: username
                    },
                    (err, docs) => {
                        if (docs) {
                            // 数据冲突
                            responseData.code = 2;
                            responseData.message = "该用户已存在！";
                            res.json(responseData);
                            return;
                        } else {
                            // 后端进行简单的验证
                            if (username === "") {
                                // 如果标题为空，渲染错误页面
                                responseData.code = 2;
                                responseData.message = "用户名不能为空!";
                                res.json(responseData);
                                return;
                            } else if (password === "") {
                                // 如果简介为空，渲染错误页面
                                responseData.code = 2;
                                responseData.message = "密码不能为空!";
                                res.json(responseData);
                                return;
                            } else if (
                                username === "admin" &&
                                req.user.username != "admin"
                            ) {
                                responseData.code = 2;
                                responseData.message =
                                    "不能直接修改超级管理员用户!";
                                res.json(responseData);
                                return;
                            } else {
                                userModel.update(
                                    {
                                        _id: userspace.user
                                    },
                                    {
                                        username: username,
                                        password: password,
                                        email: email,
                                        phonenumber: phonenumber,
                                        firstname: firstname,
                                        lastname: lastname
                                    },
                                    err => {
                                        if (!err) {
                                            if (
                                                req.user.username !=
                                                userspace.user.username
                                            ) {
                                                req.logout();
                                                responseData.message =
                                                    "修改用户核心信息，退出登录";
                                            }
                                            userspaceModel.update(
                                                {
                                                    user: userspace.user
                                                },
                                                {
                                                    gender: gender,
                                                    motto: motto,
                                                    description: description,
                                                    realname: realname
                                                },
                                                err => {
                                                    if (!err) {
                                                        responseData.code = 0;
                                                        responseData.message = "用户信息修改完成";
                                                        res.json(responseData);
                                                    } else {
                                                        throw err;
                                                    }
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
                responseData.code = 2;
                responseData.message = "该用户不存在！";
                res.json(responseData);
                return;
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





// 类别查询
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
            responseData.code = 0;
            responseData.message = "内容id为" + contentId + "的用户评论";
            responseData.data = content.comment;
            res.json(responseData);
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
            responseData.code = 0;
            responseData.message = "评论提交成功";
            res.json(responseData);
            return;
        } else {
            throw err;
            return;
        }
    });
});


module.exports = router;