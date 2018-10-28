const express = require("express");
const userModel = require("../models/user");
const categoryModel = require("../models/category");
const contentModel = require("../models/content");
const marked = require("marked");
const pagination = require("../modules/pagination");

const router = express.Router();

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

// 定义一个变量用来存放传递给模板的其他信息
let other = {};
// 分类查询条件
let where = {};


// 处理通用数据
router.use("/", (req, res, next) => {
  if (req.query.categoryId) {
    // 如果前端传有数据过来
    other.categoryId = req.query.categoryId;
    where.category = req.query.categoryId;
  } else {
    // 没有则置空，以方便模板引擎判断渲染不同的面板
    where = {};
    other.categoryId = null;
  }
  // 从数据库中查询出分类信息
  categoryModel.find({}, (err, categories) => {
    if (!err) {
      // 如果不出错
      other.categories = categories;
    } else {
      throw err;
    }
  });
  // 继续向下一个中间件走
  next();
});

// 首页路由配置
router.get("/", (req, res) => {

  // 调用分页渲染模块渲染内容
  pagination({
    // 每页显示的条数
    limit: 10,
    // 需要操作的数据库模型
    model: contentModel,
    // 需要控制分页的url
    url: "/",
    // 渲染的模板页面
    ejs: "main/index",
    // 查询的条件
    where: where,
    // 给模板绑定参数的名称
    res: res,
    req: req,
    populate: ["category", "author"],
    // 其他数据
    other: other
  });
});



router.get("/users/login", (req, res) => {
  console.log(other);
  res.render("users/login", { other: other });
});

router.get("/test", (req, res)=>{
        res.render("main/test", {
          userinfo: req.user,
          other: other
        });
});
router.get("/users/register", (req, res) => {
  console.log(other);
  res.render("users/register", { other: other });
});



// 内容页面
router.get("/views", (req, res) => {
  // 获取文章id
  let contentId = req.query.contentId;
  // 根据id从数据库中查询文章内容
  contentModel.findById(contentId).populate(["category", "author"]).then((content) => {
    // 使用marked渲染内容成html
    let contentHtml = marked(content.content);
    // 渲染内容模板
    res.render("main/views", {
      userinfo: req.user || {},
      other: other,
      contentHtml: contentHtml,
      content: content,
    });
    // 阅读量增加
    content.views++;
    content.save();
  });
});

// 将其暴露给外部使用
module.exports = router;