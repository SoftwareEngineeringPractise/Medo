const mongoose = require('mongoose')
const userModel = require('../../../models/user')
const fs = require('fs')

const File = mongoose.model('file')

module.exports.fileCreate = function (req, res) {
  if (req.file) {
    let name = ''
    if (req.body.fileName !== undefined) {
      name = req.body.fileName
    }
    let path = req.file.path;
    let op = req.params.op;
    // 所有文件都保存在public目录下面
    path = path.replace(/\\/g, "/");
    let url = path.substring(path.indexOf('public')-1);
    let where = {};
    if (op == 'avatar') {
      where.avatarUrl = url;
    } else if (op == 'bg') {
      where.bgUrl = url;
    }
    userModel.findByIdAndUpdate(req.user._id,
      {$set: where},
      {new: true},
      (err, myuser)=>{
      if(err){
        return res.tools.setJson(400, 1, err);
      }
      if (!myuser){
        return res.tools.setJson(400, 1, "登陆状态失效！");
      }
    })
    File.create({
      name: name,
      size: req.file.size,
      type: req.file.mimetype,
      path: path,
      url: url
    }, function (err, newfile) {
      if (err) {
        return res.tools.setJson(400, 1, err)
      } else {
        return res.tools.setJson(201, 0, 'success', {
          file: newfile
        })
      }
    })
  }
}

module.exports.fileDeleteOne = function (req, res) {
  if (!req.params[0]) {
    return res.tools.setJson(404, 1, '没有找到需要删除的文件')
  }
  File.findOneAndRemove({'url': req.params[0]})
    .exec(function (err, file) {
      if (err) {
        return res.tools.setJson(400, 1, err)
      } else {
        fs.unlink(file.path, function () {
          return res.tools.setJson(204, 0, '删除成功')
        })
      }
    })
}
