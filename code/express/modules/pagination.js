const pagination = object => {
  let page = object.req.query.page || 1;
  let limit = object.limit || 10;
  let pages = 0;
  let populate = object.populate || [];
  let data = object.data || {};
  object.model.countDocuments(object.where).then(count => {
    pages = Math.ceil(count / limit);
    page = Math.min(page, pages);
    page = Math.max(page, 1);
    let skip = (page - 1) * limit;


    
    object.model
      .find(object.where)
      .sort({ '_id': -1 })
      .populate(populate)
      .skip(skip)
      .limit(limit)
      .then(docs => {
        object.res.render(object.ejs, {
          docs: docs,
          page: page,
          pages: pages,
          limit: limit,
          url: object.url,
          count: count,
          data: data,
        });
      });
  });
};

module.exports = pagination;
