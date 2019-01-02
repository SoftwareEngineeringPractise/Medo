const express = require("express");
const userModel = require("../../models/user");
const contentModel = require("../../models/content");
const categoryModel = require("../../models/category");
const userInfoModel = require("../../models/userinfo");
const favoriteModel = require("../../models/favorite");
const followModel = require("../../models/follow");
const pagination = require("../../modules/api_pagination");
const passport = require("../../config/passport");
// const ctrlUsers = require("./controllers/users");
const ctrlFiles = require("./controllers/files");
const marked = require("marked");
const router = express.Router();
const path = require("path");
const fse = require("fs-extra");
const utils = require("../../utils/utils");
const multer = require("multer");
const moment = require("moment");
// 文件上传与删除
const storageActivity = multer.diskStorage({
    destination: function (req, file, cb) {
        let year = moment().get('year')
        let month = moment().get('month') + 1
        let day = moment().get('date')
        let filePath = path.resolve(__dirname, `../../public/imgs/files/${year}/${month}/${day}`)

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

  // 前后端分离开发，需要处理跨域，对所有请求均设置响应头
  router.use(function (req, res, next) {
    // 设置响应头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
  });
  // 如果是预请求，就直接终结请求-响应循环
  router.options('*', function (req, res, next) {
    res.end();
  })



// 类别查询
router.post("/categories", (req, res, next) => {
    categoryModel.find({}, (err, categories) => {
        if (!err) {
            return res.tools.setJson(200, 0, "分类", {categories :categories});
        } else {
            throw err;
        }
    });
});

router.post("/advancedsearch", function (req, res) {
    let where = {};
    let role = req.body.role|| "";
    let school = req.body.school || "";
    let province = req.body.province|| "";
    let department = req.body.department|| "";
    if(role != "") {
        where['role'] = role;
    }
    if(province != "") {
        where['province'] = province;
    }
    if(school != "") {
        where['school'] = school;
    }   
    if(department != "") {
        where['department'] = department;
    }
    userInfoModel
      .find( where)
      .populate({path:"userId", select:"username _id"})
      .then(docs => {
        if (!docs) {
          res.tools.setJson(200, 1, "没有用户信息返回！");
        } else {
            console.log(docs);
          res.tools.setJson(200, 0, "复杂检索用户信息返回成功！", docs);
        }
      })
      .catch(err => {
        res.tools.setJson(400, 1, err);
      });
  });
  

// 实验室信息
router.post("/labinfo", (req, res, next) => {
    let school = req.body.school || "";
    let province = req.body.province|| "";
    let department = req.body.department|| "";
    let where = {role:'Lab'};
    if(province != "") {
        where['province'] = province;
    }
    if(school != "") {
        where['school'] = school;
    }   
    if(department != "") {
        where['department'] = department;
    }
    userInfoModel
      .find( where, { // 去除保密字段
           password: 0, salt: 0, hash: 0 })
      .populate({path:"userId", select:"username _id"})
      .then(docs => {
        if (!docs) {
          res.tools.setJson(200, 1, "没有实验室返回！");
        } else {
          res.tools.setJson(200, 0, "实验室信息返回成功！", docs);
        }
      })
      .catch(err => {
        res.tools.setJson(404, 1, err);
      });
}
);

// 评论
router.get("/comment", (req, res) => {
    let contentId = req.query.contentId || "";
    contentModel.findById(contentId, (err, content) => {
        if (!err) {
            res.tools.setJson(200, 0, "内容id为" + contentId + "的用户评论", content.comment);
            return;
        } else {
            throw err;
            return;
        }
    });
});


/**
 * 以下接口 login required
 */
router.use((req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.tools.setJson(200, 1, "您没有登陆！");
    }
});

// 用户信息
router.post("/userinfo", (req, res, next) => {
        userModel
          .findOne({ _id: req.user._id }, { // 去除保密字段
              _id: 0, password: 0, salt: 0, hash: 0 })
          .populate(["userInfo"])
          .then(docs => {
            if (!docs) {
              res.tools.setJson(200, 1, "没有该用户！");
            } else {
              res.tools.setJson(200, 0, "用户信息返回成功！", docs);
            }
          })
          .catch(err => {
            res.tools.setJson(404, 1, err);
          });
    }
);


router.put(
    "/follow/:id",
    (req, res, next) => {
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
            NewfollowModel.save(function (err, result) {
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


router.delete("/follow/:id", (req, res, next) => {
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
    followModel.findOneAndDelete(
      { userId: req.user._id, followId: userId },
      function(err, result) {
        if (err) {
          res.tools.setJson(404, 1, err);
          return;
        }
        res.tools.setJson(200, 0, "用户取消关注成功！");
        return;
      }
    );
  });
});


router.put(
    "/favorite/:id",
    (req, res, next) => {
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
            NewfavoriteModel.save(function (err, result) {
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


router.delete("/favorite/:id", (req, res, next) => {
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
});



router.post(
    "/:id/follows",
    (req, res, next) => {
        let id = req.params.id;
        followModel
          .find({ userId: id })
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



router.post("/:id/favorites", (req, res, next) => {
    let id = req.params.id;
  favoriteModel
    .find({ userId: id })
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
});



router.post("/:id/updatings", (req, res, next) => {
    let id = req.params.id;
  followModel
    .find({ userId: id })
    .populate(["userId", "followId"])
    .sort({ _id: -1 })
    .then(docs => {
      if (!docs) {
        res.tools.setJson(200, 0, "没有记录！", []);
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
            res.tools.setJson(200,0,"评论提交成功");
            return;
        } else {
            throw err;
            return;
        }
    });
});



router.post('/file/upload/:op',
    uploadActivity.single('file'),
    ctrlFiles.fileCreate 
)
router.delete('/file/*?',
    ctrlFiles.fileDeleteOne
)


module.exports = router;