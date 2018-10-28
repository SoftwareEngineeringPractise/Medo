const express = require("express");
const userModel = require("../models/user");
const contentModel = require("../models/content");

const router = express.Router();



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


/* GET admin page. */
router.get("/", (req, res, next) => {
    let name = req.user.username;

    res.render("main/user", {username:name});
    // res.render("users/home", {
    //     userinfo: req.userinfo
    // });
});

module.exports = router;