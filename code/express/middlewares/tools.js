const Tools = require("../modules/tools");

module.exports = function (req, res, next) {
    res.tools = new Tools(req, res);
    next();
}
