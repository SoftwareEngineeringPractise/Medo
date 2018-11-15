const pagination = object => {
    let page = object.req.query.page || 1;
    let limit = object.limit || 10;
    let pages = 0;
    let populate = object.populate || [];
    let params = object.params || {};
    let responseData = {
        code:0,
        message:"分页结果" + page,
        data:undefined
    }
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
                responseData.data = { docs: docs, page: page, pages: pages, 
                    limit: limit, count: count, params: params };
                object.res.json(responseData);
            });
    });
};

module.exports = pagination;
