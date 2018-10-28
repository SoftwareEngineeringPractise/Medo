/*
    自定义分页渲染模块
        需要传递一个对象进来，该对象的属性包括：
        pagination = {
        // 每页显示的条数
        limit: 10,
        // 需要操作的数据库模型
        model: userModel,
        // 需要控制分页的url
        url: "/admin/user",
        // 渲染的模板页面
        ejs: "admin/user",
        res: res,
        req: req,
        // 查询的条件
        where: {},
        // 联合查询的条件
        populate: []
        // 名称
        docs
    }
*/

const pagination = object => {
  /*
        实现分页
            limit(Number): 限制获取的数据条数
            skip(Numer): 跳过数据的条数
        每页显示2条
    */
  // 当前页数,使用get获取前端传递的当前页数
  let page = object.req.query.page || 1;
  // 每页显示数据条数默认为10
  let limit = object.limit || 10;
  // 总页数
  let pages = 0;
  // 跨集合查询的条件
  let populate = object.populate || [];
  let other = object.other || {};
  // 查询该文档的数据条数
  object.model.countDocuments(object.where).then(count => {
    // 根据总条数计算总页数
    pages = Math.ceil(count / limit);
    // 限制当前页数，避免溢出
    // page不能超过pages
    page = Math.min(page, pages);
    // page不能小于1
    page = Math.max(page, 1);
    // 跳过数据的条数
    let skip = (page - 1) * limit;
    // 分页查询出数据
    object.model
      .find(object.where)
      .populate(populate)
      .skip(skip)
      .limit(limit)
      .then(docs => {
        object.res.render(object.ejs, {
          userinfo: object.req.userinfo,
          docs: docs,
          page: page,
          pages: pages,
          limit: limit,
          url: object.url,
          count: count,
          other: other,
        });
      });
  });
};

// 暴露给外部使用
module.exports = pagination;
