const mongoose = require("mongoose");
const config = require("../config/config");
const emailSchema = require("../schemas/emailvalidations")
const nodemailer = require('nodemailer');


emailSchema.methods.sendEmail = function(username, email) {
    const mailTransport = nodemailer.createTransport({
        host: 'smtp.163.com',
        port: 465,
        secure: true, // 使用SSL方式（安全方式，防止被窃取信息）
        auth: {
            user: 'medosupport@163.com',
            pass: 'zhujinshun123'
        },
    });
    const options = {
        from: '"MEDO TEAM" <medosupport@163.com>',
        to: '"' + username+'"<'+email+'>',
        // cc         : ''  //抄送
        // bcc      : ''    //密送
        subject: 'MEDO邮箱验证',
        text: '邮件验证',
        html: ' Hello,<Br/> \
        Please use the following link to validate your e-mail address<Br/>\
        <a href="' + config.baseurl + '/EmailValidation?v=' + this.code + '">' + config.baseurl + '/EmailValidation?v=' + this.code+'</a><Br/> \
        Best Regards,<Br/> \
        Medo Support Team',
        // attachments:
        //     [
        //         {
        //             filename: 'img1.png',            // 改成你的附件名
        //             path: 'public/imgs/img1.png',  // 改成你的附件路径
        //             cid: '00000001'                 // cid可被邮件使用
        //         },
        //     ]
    };

    mailTransport.sendMail(options, function (err, msg) {
        if (err) {
            return false;
        }
        else {
            return true;
        }
    });
};

emailSchema.methods.validateEmail = function(code) {
    return code == this.code;
};


module.exports = mongoose.model("emailvalidation", emailSchema);
