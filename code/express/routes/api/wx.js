const express = require("express");
const marked = require("marked");
const userModel = require("../../models/user");
const userinfoModel = require("../../models/userinfo");
const contentModel = require("../../models/content");
const categoryModel = require("../../models/category");
const favoriteModel = require("../../models/favorite");
const followModel = require("../../models/follow");
const pagination = require("../../modules/api_pagination");
const router = express.Router();
const passport = require("passport");
const ctrlUsers = require("./controllers/users");
const ctrlFiles = require("./controllers/files");
const redis = require("../../models/redis");
const path = require("path");
const fse = require("fs-extra");
const utils = require("../../utils/utils");
const multer = require("multer");
const moment = require("moment");



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







/**
 * 小程序认证和信息修改
 */
router.post('/users/wei_xin/auth',
    ctrlUsers.authWithWeiXinApp
)


// 修改用户名
router.post('/users/me/name',
    passport.authenticate('jwt', { session: false }),
    ctrlUsers.userUpdateName
)

// 修改手机号 请求参数:tel , 返回: 调试信息; 
// TODO 此请求header需要加入Authorization，值为缓存的token
router.post('/users/me/tel',
    passport.authenticate('jwt', { session: false }),
    ctrlUsers.userUpdateTel
)
// 修改邮箱 请求参数:email , 返回: 调试信息; 
// TODO 此请求header需要加入Authorization，值为缓存的token
router.post('/users/me/email',
    passport.authenticate('jwt', { session: false }),
    ctrlUsers.userUpdateEmail
)

// 修改密码 请求参数:password , 返回: 调试信息;
// TODO 此请求header需要加入Authorization，值为缓存的token
router.post(
  "/users/me/password",
  passport.authenticate("jwt", { session: false }),
  ctrlUsers.userUpdatePassword
);


// 修改学校 参数 school 返回: 调试信息;
// TODO 此请求header需要加入Authorization，值为缓存的token
router.post(
  "/users/me/school",
  passport.authenticate("jwt", { session: false }),
  ctrlUsers.userUpdateSchool
);


// 修改院系 参数 department 返回: 调试信息;
// TODO 此请求header需要加入Authorization，值为缓存的token
router.post(
  "/users/me/department",
  passport.authenticate("jwt", { session: false }),
  ctrlUsers.userUpdateDepartment
);


// 用户登录接口 参数：username password 返回: 调试信息;
// TODO 此请求header需要加入Authorization，值为缓存的token
router.post(
  "/users/login",
  function(req, res, next) { 
      passport.authenticate("local.wxlogin", function(err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.tools.setJson(400, 1, info);
      }
        return res.tools.setJson(200, 0, "登录成功", { token: info});
    })(req, res, next);
  }
);


// 用户登出接口 参数：无 返回: 调试信息;
// TODO 此请求header需要加入Authorization，值为缓存的token
router.get(
  "/users/logout",
  passport.authenticate("jwt", { session: false }),
  function(req, res, next) {
    if (req.user) {
      redis.redisClient.del(req.user.weiXin.openId);
      res.tools.setJson(200, 0, "退出成功");
    } else {
      res.tools.setJson(200, 1, "用户没有登录");
    }
  }
);


// 用户注册接口 参数 username password tel email 返回: 调试信息;
// TODO 此请求header需要加入Authorization，值为缓存的token
router.post("/users/register", function(req, res, next) {
  passport.authenticate("local.register", function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.tools.setJson(200, 1, info);
    }
    return res.tools.setJson(200, 0, "用户注册成功");
  })(req, res, next);
});


/**
 * 1. 获取用户简要信息
 */
// 参数：为me即当前用户，或者其它用户的id 返回: 调试信息;
// TODO 当此请求id为me时，header需要加入Authorization，值为缓存的token
router.get(
  "/users/:id/info",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    userid = req.params.id; // 用户名
    if (userid === "me") {
      //登陆者信息
      userid = req.user._id;
    } else{
      req
      .checkParams("id", "没有该实验室！")
      .notEmpty()
      .isLength({ min: 24, max:24 });
      var errors = req.validationErrors();
      if (errors) {
        var messages = [];
        errors.forEach(function (error) {
          messages.push(error.msg);
        });
        return res.tools.setJson(400, 2, messages);
      }
    }
    userModel
      .findOne(
        {
          _id: userid
        },
        {
          // 去除保密字段
          _id: 0,
          password: 0,
          salt: 0,
          hash: 0
        }
      )
      .populate(["userInfo"])
      .then(docs => {
        if (!docs) {
          res.tools.setJson(400, 2, "没有该用户！");
        } else {
          res.tools.setJson(200, 0, "返回用户信息" + userid, docs);
        }
      })
      .catch(err => {
        res.tools.setJson(400, 1, err);
      });
  }
);


/**
 * 2. 导师实验室介绍
 */
// 参数 id 为me即当前用户，或者其它用户的id 返回: 调试信息;
 // TODO 当此请求id为me时，header需要加入Authorization，值为缓存的token
router.get(
  "/labs/:id/info",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    userid = req.params.id; // 用户名
    if (userid === "me") {
      //登陆者信息
      userid = req.user._id;
    } else{
      req
      .checkParams("id", "没有该实验室！")
      .notEmpty()
      .isLength({ min: 24, max:24 });
      var errors = req.validationErrors();
      if (errors) {
        var messages = [];
        errors.forEach(function (error) {
          messages.push(error.msg);
        });
        return res.tools.setJson(400, 2, messages);
      }
    }

    userModel
      .findOne(
        {
          _id: userid
        },
        {
          // 去除保密字段
          _id: 0,
          password: 0,
          salt: 0,
          hash: 0
        }
      )
      .populate(['userInfo'])
      .then(docs => {
        if (docs.userInfo.role != "Lab") {
          res.tools.setJson(400, 2, "没有该研究所！");
        } else if (!docs) {
          res.tools.setJson(400, 2, "没有该用户！");
        } else {
              res.tools.setJson(200, 0, "返回研究所信息" + userid, {user:docs});
        }
      })
      .catch(err => {
        res.tools.setJson(400, 1, err);
      });
  }
);

 /**
  * 3. 公告list，参数: 参数为空 或者可选参数authorid或可选参数categoryid> 对于分别返回所有、指定author、指定category的文章
  * 时间降序排列 分页
  */

router.get(
  "/contents",
  function(req, res, next) {
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
      limit: 10,
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
  }
);



// 查看指定id公告接口

router.get("/views", (req, res) => {
  let contentid = req.query.contentid.trim() || "";
  if(contentid == ""){
    return res.tools.setJson(400, 1, "该文章不存在！")
  }
  req
  .checkQuery("contentid", "没有该文章！")
  .notEmpty()
  .isLength({ min: 24, max:24 });
  var errors = req.validationErrors();
  if (errors) {
    var messages = [];
    errors.forEach(function (error) {
      messages.push(error.msg);
    });
    return res.tools.setJson(400, 2, messages);
  }
  contentModel.findById(contentid).populate([
    "category",
    {
      path: "author",
      select: "username isadmin verified _id",
    }
  ]).then((content) => {
    let contentHtml = marked(content.content);
    res.tools.setJson(200, 0, "返回id为" + contentid + "的公告", {
      contentHtml: contentHtml,
      content: content
    });
    content.views++;
    content.save();
  });
});


  /**
   * 4. 获取对id的评价
   */
// 评论获取  参数 需要获取评论的用户id
router.get(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    let userId = req.params.id || "";
    if(userId === "me"){
      userId = req.user._id;
    } else {
      req
      .checkParams("id", "没有该用户！")
      .notEmpty()
      .isLength({ min: 24, max:24 });
      var errors = req.validationErrors();
      if (errors) {
        var messages = [];
        errors.forEach(function (error) {
          messages.push(error.msg);
        });
        return res.tools.setJson(400, 2, messages);
      }
    }
    userModel.findById(userId, (err, docs) => {
      if (!err) {
        if(docs){
          res.tools.setJson(200, 0, "用户评论" + userId, docs.comment);
        } else{
          return res.tools.setJson(400, 1, "该用户不存在！");
        }
      } else {
        res, tools.setJson(500, 1, err);
        return;
      }
    });
  }
);




/**
 *  5.1 POST userid 的评价
 */

// 评论提交 参数 需要评论的用户id
// TODO 此请求id的header需要加入Authorization，值为缓存的token
router.post(
  "/comment/:id/post",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (!req.user) {
      res.tools.setJson(400, 1, "用户没有登录, 不能提交评论！");
    }
    req
    .checkParams("id", "没有该用户！")
    .notEmpty()
    .isLength({ min: 24, max:24 });
    var errors = req.validationErrors();
    if (errors) {
      var messages = [];
      errors.forEach(function (error) {
        messages.push(error.msg);
      });
      return res.tools.setJson(400, 2, messages);
    }

    let userId = req.params.id || "";
    let comment = req.body.comment.trim() || "";
    if(comment == ""){
      return res.tools.setJson(400, 1, "评论不能为空！")
    }
    // 构建评论结构
    let commentData = {
      username: req.user.username,
      postTime: new Date(),
      content: comment
    };
    userModel.findById(userId, (err, user) => {
      if (!err) {
        user.comment.push(commentData);
        user.save();
        res.tools.setJson(200, 0, "评论提交成功");
        return;
      } else {
        res, tools.setJson(400, 1, err);
        return;
      }
    });
  }
);


/**
 *  5.2 POST userid 的公告
 */

// 内容添加的保存 内容的title category description content
// TODO 此请求id的header需要加入Authorization，值为缓存的token
router.post(
  "/content/post",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    if (!req.user) {
      return res.tools.setJson(400, 1, "用户没有登录, 不能提交文章！");
    }
      req
      .checkBody("category", "分类错误, 没有该分类")
      .notEmpty()
      .isLength({ min: 24, max:24 });
      var errors = req.validationErrors();
    // TODO title 字数限制
    // TODO description 字数限制
    let title = req.body.title.trim() || "";
    let category = req.body.category.trim() || "";
    let description = req.body.description.trim() || "";
    let content = req.body.content.trim() || "";
    // 后端进行简单的验证
    if (title == "") {
      // 如果标题为空，渲染错误页面
      res.tools.setJson(400, 1, "标题不能为空");
      return;
    } else if (category == "") {
      // 如果简介为空，渲染错误页面
      res.tools.setJson(400, 1, "分类不能为空");
      return;
    } else if (errors) {
      var messages = [];
      errors.forEach(function (error) {
        messages.push(error.msg);
      });
      return res.tools.setJson(400, 2, messages);
    }
    else if (description == "") {
      // 如果简介为空，渲染错误页面
      res.tools.setJson(400, 1, "简介不能为空");
      return;
    } else if (content == "") {
      res.tools.setJson(400, 1, "正文不能为空");
      return;
    } else {
      categoryModel.findById(category, (err, cate)=>{
        if(!cate){
          return res.tools.setJson(400, 1, "该分类不存在");
        }
      })
      // 一切正常，存入数据库
      contentModel.create(
        {
          title: title,
          category: category,
          author: req.user._id.toString(),
          description: description,
          content: content
        },
        err => {
          if (!err) {
            // 保存成功
            res.tools.setJson(200, 0, "提交成功！");
          } else {
            throw err;
          }
        }
      );
    }
  }
);




// 类别查询
router.post("/categories", (req, res, next) => {
  categoryModel.find({}, (err, categories) => {
    if (!err) {
      return res.tools.setJson(200, 0, "分类", categories);
    } else {
      throw err;
    }
  });
});

/**
 * 6 加入或取消userid到me关注中
 */
 
// 加入关注 参数 加入关注的人的id
 // TODO 此请求id的header需要加入Authorization，值为缓存的token
router.post(
  "/follow/:id/add",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    if (!req.user) {
      res.tools.setJson(400, 1, "用户未登录！");
      return;
    }
    userId = req.params.id || "";
    if(req.user._id == userId){
      return res.tools.setJson(400, 1, "关注失败,关注人不能是登录用户！")
    }
    req
    .checkParams("id", "没有用户！")
    .notEmpty()
    .isLength({ min: 24, max:24 });
    var errors = req.validationErrors();
    if (errors) {
      var messages = [];
      errors.forEach(function (error) {
        messages.push(error.msg);
      });
      return res.tools.setJson(400, 2, messages);
    }
    userModel.findById({ _id: userId }, (err, user) => {
      if (!user) {
        res.tools.setJson(400, 2, "没有该用户！");
        return;
      }
      if (err) {
        res.tools.setJson(500, 1, err);
        return;
      }
      NewfollowModel = new followModel();
      NewfollowModel.userId = req.user._id;
      NewfollowModel.followId = userId;
      NewfollowModel.addTime = new Date();
      NewfollowModel.save(function(err, result) {
        if (err) {
          res.tools.setJson(400, 1, err);
          return;
        }
        res.tools.setJson(200, 0, "用户关注成功！");
        return;
      });
    });
  }
);

// 取消关注 参数取消关注的用户id
// TODO 此请求id的header需要加入Authorization，值为缓存的token
router.post("/follow/:id/delete", passport.authenticate("jwt", { session: false }),(req, res, next) => {
    if (!req.user) {
        res.tools.setJson(400, 1, "用户未登录！");
        return;
    }
    req
    .checkParams("id", "没有该用户！")
    .notEmpty()
    .isLength({ min: 24, max:24 });
    var errors = req.validationErrors();
    if (errors) {
      var messages = [];
      errors.forEach(function (error) {
        messages.push(error.msg);
      });
      return res.tools.setJson(400, 2, messages);
    }
    userId = req.params.id || "";
    userModel.findById({ _id: userId }, (err, user) => {
        if (!user) {
            res.tools.setJson(400, 2, "没有该用户！");
            return;
        }
        if (err) {
            res.tools.setJson(500, 1, err);
            return;
        }
        followModel.findOneAndDelete({ userId: req.user._id, followId: userId }, function (err, result) {
            if (err) {
                res.tools.setJson(400, 1, err)
                return;
            }
            res.tools.setJson(200, 0, "用户取消关注成功！")
            return;
        });

    })

})

/**
 * 7. 加入或取消contentidid到me收藏中
 */

 // 加入收藏 参数 收藏的文章id
 // TODO 此请求id的header需要加入Authorization，值为缓存的token
router.post(
  "/favorite/:id/add",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    if (!req.user) {
      res.tools.setJson(400, 1, "用户未登录！");
      return;
    }
    req
    .checkParams("id", "没有该文章！")
    .notEmpty()
    .isLength({ min: 24, max:24 });
    var errors = req.validationErrors();
    if (errors) {
      var messages = [];
      errors.forEach(function (error) {
        messages.push(error.msg);
      });
      return res.tools.setJson(400, 2, messages);
    }
    contentId = req.params.id || "";
    contentModel.findById({ _id: contentId }, (err, content) => {
      if (!content) {
        res.tools.setJson(400, 2, "没有该文章！");
        return;
      }
      if (err) {
        res.tools.setJson(500, 1, err);
        return;
      }
      NewfavoriteModel = new favoriteModel();
      NewfavoriteModel.userId = req.user._id;
      NewfavoriteModel.contentId = contentId;
      NewfavoriteModel.addTime = new Date();
      NewfavoriteModel.save(function(err, result) {
        if (err) {
          res.tools.setJson(400, 1, err);
          return;
        }
        res.tools.setJson(200, 0, "文章收藏成功！");
        return;
      });
    });
  }
);


 // 取消收藏 参数 收藏的文章id
 // TODO 此请求id的header需要加入Authorization，值为缓存的token
router.post(
  "/favorite/:id/delete",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    if (!req.user) {
      res.tools.setJson(400, 1, "用户未登录！");
      return;
    }
    req
    .checkParams("id", "没有该文章！")
    .notEmpty()
    .isLength({ min: 24, max:24 });
    var errors = req.validationErrors();
    if (errors) {
      var messages = [];
      errors.forEach(function (error) {
        messages.push(error.msg);
      });
      return res.tools.setJson(400, 2, messages);
    }
    contentId = req.params.id || "";
    contentModel.findById({ _id: contentId }, (err, content) => {
      if (!content) {
        res.tools.setJson(400, 2, "没有该文章！");
        return;
      }
      if (err) {
        res.tools.setJson(500, 1, err);
        return;
      }
      favoriteModel.findOneAndDelete(
        { userId: req.user._id, contentId: contentId },
        function(err, result) {
          if (err) {
            res.tools.setJson(400, 1, err);
            return;
          }
          res.tools.setJson(200, 0, "文章取消收藏成功！");
          return;
        }
      );
    });
  }
);


/**
 *  8. 我关注的人 List 分页
*/
// 我关注的人 参数 无
// TODO 此请求id的header需要加入Authorization，值为缓存的token
router.get(
  "/me/follows",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    followModel
      .find({ userId: req.user._id })
      .populate(["userId", "followId"])
      .then(docs => {
        if (!docs) {
          res.tools.setJson(400, 1, "没有记录！");
          return;
        }
        res.tools.setJson(200, 0, "关注用户返回成功！", docs);
      })
      .catch(err => {
        res.tools.setJson(500, 2, err);
        return;
      });
  }
);

/**
 * 9. 我收藏的文章 List 分页
 */

// 我收藏的文章 参数 无
// TODO 此请求id的header需要加入Authorization，值为缓存的token
router.get(
  "/me/favorites",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    favoriteModel
      .find({ userId: req.user._id })
      .populate(["userId", "contentId"])
      .then(docs => {
        if (!docs) {
          res.tools.setJson(400, 1, "没有记录！");
          return;
        }
        res.tools.setJson(200, 0, "收藏内容返回成功！", docs);
      })
      .catch(err => {
        if (err) {
          res.tools.setJson(500, 2, err);
          return;
        }
      });
  }
);

/**
 * 10. 关注人的动态 List 时间倒序 分页
 */
// 我关注的人的动态 参数 无
// TODO 此请求id的header需要加入Authorization，值为缓存的token
router.get(
  "/me/updatings",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    if (!req.user) {
      res.tools.setJson(400, 1, "用户未登录！");
    }
    followModel
      .find({ userId: req.user._id })
      .populate(["userId", "followId"])
      .sort({ _id: -1 })
      .then(docs => {
        if (!docs) {
          res.tools.setJson(400, 1, "没有记录！");
          return;
        }
        let count = docs.length;
        let data = [];
        docs.forEach(item => {
          contentModel.find({ author: item.followId }, (err, content) => {
            content.forEach(item1 => {
              data.push(item1);
            });
            count = count - 1;
            if (count == 0) {
              res.tools.setJson(200, 0, "关注动态返回成功！", data);
            }
          });
        });
      })
      .catch(err => {
        if (err) {
          res.tools.setJson(500, 2, err);
          return;
        }
      });
  }
);

/**
 * 11. 模糊搜索 按username school List
 */

 // 按用户名搜索 参数 q 返回 用户名包含字符串q的所有userspace
router.get('/search/username/:q', (req, res, next)=>{ 
  let query = req.params.q || "";
  userModel.find({ username: { $regex: query, $options: "i" } }, {
    // 去除保密字段
    _id: 0,
    password: 0,
    salt: 0,
    hash: 0
  }, function(
    err,
    docs
  ) {
    if (err) {
      res.tools.setJson(400, 1, err);
    }
    if (docs) {
      res.tools.setJson(200, 0, "success",docs);
    }
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

// 加入关注 参数 加入关注的人的id
 // TODO 此请求id的header需要加入Authorization，值为缓存的token
 router.post(
  "/follows/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    if (!req.user) {
      res.tools.setJson(400, 1, "用户未登录！");
      return;
    }
    userId = req.params.id || "";
    if(req.user._id == userId){
      return res.tools.setJson(400, 1, "关注人不能是登录用户！")
    }
    req
    .checkParams("id", "没有该用户！")
    .notEmpty()
    .isLength({ min: 24, max:24 });
    var errors = req.validationErrors();
    if (errors) {
      var messages = [];
      errors.forEach(function (error) {
        messages.push(error.msg);
      });
      return res.tools.setJson(400, 2, messages);
    }
    userModel.findById({ _id: userId }, (err, user) => {
      if (!user) {
        res.tools.setJson(400, 2, "没有该用户！");
        return;
      }
      if (err) {
        res.tools.setJson(500, 1, err);
        return;
      }
      followModel.findOne({userId:req.user._id, followId:userId},function(err, result) {
        if (err) {
          res.tools.setJson(400, 1, err);
          return;
        }
        if(result){
          return res.tools.setJson(200, 0, "查询用户是否关注id"+userId, {follow:true});
        } else{
          return res.tools.setJson(200, 0, "查询用户是否关注id"+userId, {follow:false});
        }

      });
    });
  }
);
 // 取消收藏 参数 收藏的文章id
 // TODO 此请求id的header需要加入Authorization，值为缓存的token
 router.post(
  "/favorites/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    if (!req.user) {
      res.tools.setJson(400, 1, "用户未登录！");
      return;
    }
    req
    .checkParams("id", "没有该文章！")
    .notEmpty()
    .isLength({ min: 24, max:24 });
    var errors = req.validationErrors();
    if (errors) {
      var messages = [];
      errors.forEach(function (error) {
        messages.push(error.msg);
      });
      return res.tools.setJson(400, 2, messages);
    }
    contentId = req.params.id || "";
    contentModel.findById({ _id: contentId }, (err, content) => {
      if (!content) {
        res.tools.setJson(400, 2, "没有该文章！");
        return;
      }
      if (err) {
        res.tools.setJson(500, 1, err);
        return;
      }
      favoriteModel.findOne(
        { userId: req.user._id, contentId: contentId },
        function(err, result) {
          if (err) {
            res.tools.setJson(400, 1, err);
            return;
          }
          if(result){
            return res.tools.setJson(200, 0, "查询用户是否收藏文章id"+contentId, {follow:true});
          } else{
            return res.tools.setJson(200, 0, "查询用户是否收藏文章id"+contentId, {follow:false});
          }
        }
      );
    });
  }
);

/**
 * 活动文件服务
 */
const storageActivity = multer.diskStorage({
    destination: function (req, file, cb) {
        let year = moment().get('year')
        let month = moment().get('month') + 1
        let day = moment().get('date')
        let filePath = path.resolve(__dirname, `../../public/imgs/activities/${year}/${month}/${day}`)

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
// // todo:需要加入权限验证才能进行上传／删除文件


router.use((req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.tools.setJson(200, 1, "您没有登陆！");
  }
});

router.post('/file/upload/:op',
  uploadActivity.single('file'),
    ctrlFiles.fileCreate
)
router.delete('/file/*?',
    ctrlFiles.fileDeleteOne
)

module.exports = router;