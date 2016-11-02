var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var pbkdf2 = require('../pbkdf2');
//var ObjectId = Schema.types.ObjectId;
module.exports = {
    user:{
        userName: {
            type: String,
            required: true
        },
        passWord: {
            type: String,
            required: true,
			set: pbkdf2.encrypt//引入pbkdf2Sync加密方法
        },
        email: {
            type: String,
            required: true
        },
        salt: {
            type: String,
			// set:pbkdf2.returnSalt
			default:pbkdf2.returnSalt()
        },
		emailCode:{
			type: Number
		},
        name: String,    //昵称
        age: Number,
        sex: Number,  //0男 1女 2其它
        sexFor: Number, //0男 1女 2通吃
        logoPath: String,
		createAt: {type: Date, default: Date.now()}
    },
    log:{
        title: String,   //标题
        author: String,  //作者
        content: String,
        picture: String,
        time: Date,
        praise: {type: Number, default: 0},  //点赞数量
        collect: {type: Number, default: 0} //收藏数量
    }
};