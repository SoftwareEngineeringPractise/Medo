const express = require("express");
const router = express.Router();



router.get("/", (req, res, next) => {
    let name = req.user.username;

    res.render("main/user", {username:name});
});

module.exports = router;