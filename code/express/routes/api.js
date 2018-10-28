const express = require("express");
const userModel = require("../models/user");
const contentModel = require("../models/content");

const router = express.Router();

let responseData;


// 返回状态
router.use((req, res, next) => {
    responseData = {
        // 状态码
        code: 0,
        // 返回的消息
        message: ""
    };
    next();
});

router.post("/userinfo", (req, res, next) => {

    if(req.isAuthenticated()){
        userModel.findById(req.user.id, (err, user) => {
            if (user) {
                responseData.code = 0;
                responseData.message = "没有该用户";
                responseData.userinfo = {username:req.user.username,isadmin:req.user.isadmin};
                return res.json(responseData);
            } else {
                responseData.code = 1;
                responseData.message = "没有该用户";
                return res.json(responseData);
            }
        });
    } else {
        responseData.code = 2;
        responseData.message = "用户未登录！";
        return res.json(responseData);
    }
});


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


router.get("/comment", (req, res) => {
    //  获取提交的信息
    let contentId = req.query.contentId || "";

    // 根据id查询文章信息
    contentModel.findById(contentId, (err, content) => {
        if (!err) {
            // 向客户端发送当前评论
            res.json(content.comment);
            return;
        } else {
            throw err;
            return;
        }
    });
});



router.post("/comment/post", (req, res) => {
    //  获取提交的信息
    let contentId = req.body.contentId;
    let comment = req.body.comment;

    console.log(comment);
    // 构建评论结构
    let commentData = {
        username: req.userInfo.username,
        postTime: new Date(),
        content: comment
    }

    // 根据文章id将文章查询出来
    contentModel.findById(contentId, (err, content) => {
        if (!err) {
            // 如果文章存在则将评论推入
            content.comment.push(commentData);
            // 保存
            content.save();
            // 向客户端发送当前评论
            res.json(content);
            return;
        } else {
            throw err;
            return;
        }
    });
});


module.exports = router;