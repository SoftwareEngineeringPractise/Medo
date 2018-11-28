const express = require("express");
const userModel = require("../../models/user");
const contentModel = require("../../models/content");
const userspaceModel = require("../../models/userspace");
const categoryModel = require("../../models/category");
const favoriteModel = require("../../models/favorite");
const followModel = require("../../models/follow");
const pagination = require("../../modules/api_pagination");
// const passport = require("../../config/passport");
const router = express.Router();
const passport = require("passport");
const ctrlUsers = require("./controllers/users");
const redis = require("../../models/redis");
// const path = require("path");
// const fse = require("fs-extra");
// const utils = require("../../utils/utils");
// const multer = require("multer");
// const moment = require("moment");








/**
 * 0. 小程序认证和信息修改
 */
// 微信小程序认证 请求参数:code,username 返回: token; 
//TODO  每次认证前端将token更新缓存到本地,并且针对每个login required的请求的header添加一个字段 
// 字段的键为Authorization，值为缓存的token
router.post('/users/wei_xin/auth',
    ctrlUsers.authWithWeiXinApp
)


// 修改用户名 请求参数:name , 返回: 调试信息; 
// TODO 此请求header需要加入Authorization，值为缓存的token
router.put('/users/me/name',
    passport.authenticate('jwt', { session: false }),
    ctrlUsers.userUpdateName
)

// 修改手机号 请求参数:tel , 返回: 调试信息; 
// TODO 此请求header需要加入Authorization，值为缓存的token
router.put('/users/me/tel',
    passport.authenticate('jwt', { session: false }),
    ctrlUsers.userUpdateTel
)
// 修改邮箱 请求参数:email , 返回: 调试信息; 
// TODO 此请求header需要加入Authorization，值为缓存的token
router.put('/users/me/email',
    passport.authenticate('jwt', { session: false }),
    ctrlUsers.userUpdateEmail
)

// 修改密码 请求参数:password , 返回: 调试信息;
// TODO 此请求header需要加入Authorization，值为缓存的token
router.put(
  "/users/me/password",
  passport.authenticate("jwt", { session: false }),
  ctrlUsers.userUpdatePassword
);


// 修改学校 参数 school 返回: 调试信息;
// TODO 此请求header需要加入Authorization，值为缓存的token
router.put(
  "/users/me/school",
  passport.authenticate("jwt", { session: false }),
  ctrlUsers.userUpdateSchool
);


// 修改院系 参数 department 返回: 调试信息;
// TODO 此请求header需要加入Authorization，值为缓存的token
router.put(
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
      .populate(["userspace"])
      .then(docs => {
        if (!docs) {
          res.tools.setJson(404, 2, "没有该用户！");
        } else {
          res.tools.setJson(200, 0, "返回用户信息" + userid, docs);
        }
      })
      .catch(err => {
        res.tools.setJson(404, 1, err);
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
      .populate()
      .then(docs => {
        if (docs.role != "Lab") {
          res.tools.setJson(404, 2, "没有该研究所！");
        } else if (!docs) {
          res.tools.setJson(404, 2, "没有该用户！");
        } else {
          userspaceModel.findOne({user:userid}, (err, userspace)=>{
            if(err){
              res.tools.setJson(400, 1, err);
            }
            if(userspace){
              res.tools.setJson(200, 0, "返回研究所信息" + userid, {user:docs, userspace:userspace});
            }
          })
        }
      })
      .catch(err => {
        res.tools.setJson(404, 1, err);
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


  /**
   * 4. 获取对id的评价
   */
// 评论获取  参数 需要获取评论的用户id
router.get(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let userId = req.params.id || "";
    if(userId === "me"){
      userId = req.user._id;
    }
    userModel.findById(userId, (err, docs) => {
      if (!err) {
        res.tools.setJson(200, 0, "用户评论" + userId, docs.comment);
        return;
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
      res.tools.setJson(404, 1, "用户没有登录, 不能提交评论！");
    }
    let userId = req.params.id || "";
    let comment = req.body.comment;
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
        res, tools.setJson(404, 1, err);
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
      res.tools.setJson(404, 1, "用户没有登录, 不能提交文章！");
    }
    let title = req.body.title;
    let category = req.body.category;
    let description = req.body.description;
    let content = req.body.content;
    // 后端进行简单的验证
    if (title === "") {
      // 如果标题为空，渲染错误页面
      res.tools.setJson(404, 1, "标题不能为空");
      return;
    } else if (description === "") {
      // 如果简介为空，渲染错误页面
      res.tools.setJson(404, 1, "简介不能为空");
      return;
    } else if (content === "") {
      res.tools.setJson(404, 1, "正文不能为空");
      return;
    } else {
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
            res.tools.setJson(200, 1, "提交成功！");
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
      res.tools.setJson(404, 1, "用户未登录！");
      return;
    }
    userId = req.params.id || "";
    userModel.findById({ _id: userId }, (err, user) => {
      if (!user) {
        res.tools.setJson(404, 2, "没有该用户！");
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
          res.tools.setJson(404, 1, err);
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
        res.tools.setJson(404, 1, "用户未登录！");
        return;
    }
    userId = req.params.id || "";
    userModel.findById({ _id: userId }, (err, user) => {
        if (!user) {
            res.tools.setJson(404, 2, "没有该用户！");
            return;
        }
        if (err) {
            res.tools.setJson(500, 1, err);
            return;
        }
        followModel.findOneAndDelete({ userId: req.user._id, followId: userId }, function (err, result) {
            if (err) {
                res.tools.setJson(404, 1, err)
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
      res.tools.setJson(404, 1, "用户未登录！");
      return;
    }
    contentId = req.params.id || "";
    contentModel.findById({ _id: contentId }, (err, content) => {
      if (!content) {
        res.tools.setJson(404, 2, "没有该用户！");
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
          res.tools.setJson(404, 1, err);
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
      res.tools.setJson(404, 1, "用户未登录！");
      return;
    }
    contentId = req.params.id || "";
    contentModel.findById({ _id: contentId }, (err, content) => {
      if (!content) {
        res.tools.setJson(404, 2, "没有该用户！");
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
            res.tools.setJson(404, 1, err);
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
          res.tools.setJson(404, 1, "没有记录！");
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
          res.tools.setJson(404, 1, "没有记录！");
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
      res.tools.setJson(404, 1, "用户未登录！");
    }
    followModel
      .find({ userId: req.user._id })
      .populate(["userId", "followId"])
      .sort({ _id: -1 })
      .then(docs => {
        if (!docs) {
          res.tools.setJson(404, 1, "没有记录！");
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
      res.tools.setJson(404, 1, err);
    }
    if (docs) {
      res.tools.setJson(200, 0, "success",docs);
    }
  });
})

// 按学校搜索 参数 q 返回 学校包含字符串q的所有userspace
router.get('/search/school/:q', (req, res, next) => {
  let query = req.params.q || "";
  userspaceModel.find({ school: { $regex: query, $options: "i" } }, function (
    err,
    docs
  ) {
    if (err) {
      res.tools.setJson(404, 1, err);
    }
    if (docs) {
      res.tools.setJson(200, 0, docs);
    }
  });
})

// 按院系搜索 参数 q  返回 院系包含字符串q的所有userspace
router.get('/search/department/:q', (req, res, next) => {
  let query = req.params.q || "";
  userspaceModel.find(
    { department: { $regex: query, $options: "i" } },
    function(err, docs) {
      if (err) {
        res.tools.setJson(404, 1, err);
      }
      if (docs) {
        res.tools.setJson(200, 0, docs);
      }
    }
  );
})



/**
 * 活动文件服务
 */
// const storageActivity = multer.diskStorage({
//     destination: function (req, file, cb) {
//         let year = moment().get('year')
//         let month = moment().get('month') + 1
//         let day = moment().get('date')
//         let filePath = path.resolve(__dirname, `../../../public/image/activities/${year}/${month}/${day}`)

//         fse.ensureDir(filePath, function () {
//             cb(null, filePath)
//         })
//     },
//     filename: function (req, file, cb) {
//         let name = utils.randomWord(false, 12)
//         if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
//             name = name + '.jpg'
//         } else if (file.mimetype === 'image/png') {
//             name = name + '.png'
//         }
//         cb(null, name)
//     }
// })
// const uploadActivity = multer({ storage: storageActivity })
// // todo:需要加入权限验证才能进行上传／删除文件

// router.post('/file/activity',
//     uploadActivity.single('image'),
//     ctrlFiles.fileCreate
// )
// router.delete('/file/*?',
//     ctrlFiles.fileDeleteOne
// )

module.exports = router;