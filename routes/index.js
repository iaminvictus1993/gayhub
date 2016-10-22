var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var pbkdf2 = require('../pbkdf2');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

//渲染注册页面
router.get('/register', function(req, res, next) {
    res.render('register', {title: '注册页面'});
});

//渲染登录页面
router.get('/login', function(req, res, next) {
    res.render('login', {title: '登录页面'});
});

//渲染主页面
router.get('/home', function(req, res, next) {
    res.render('home', {title: '主页面'});
});

//注册账号功能
router.post('/register', function(req, res, next) {
    var userName = req.body.userName;
        //email = req.body.email,
    var passWord1 = req.body.passWord1;
    var passWord2 = req.body.passWord2;
    //判断两次输入密码是否一致
    if(passWord1 !== passWord2) {
        res.send({"msg": '两次输入密码不一致，请核对'});
        return;
    }
    var user = global.offerModel.getModel('user');
    //查找数据库中是否已有该用户
    user.findOne({"userName": userName}).exec(function(err, userData) {
        if(err) {
            res.send(err);
            return;
        }
        if(userData) {
            res.send({msg: '用户已存在，请直接登录'});
            return;
        }
        //不存在则创建新用户数据
        user.create({
            "userName": userName,
            "passWord": passWord1.toString()//crypto加密参数需为字符
        }).then(function(data) {
            res.send({msg: '创建成功'});
        }).catch(function(err) {
            res.send(err);
        });
    });
});

//登录账号功能
router.post('/login', function(req, res, next) {
    var userName = req.body.userName;
    var passWord = req.body.passWord;
    var user = global.offerModel.getModel('user');
    //查找数据库中是否已有该用户
    user.findOne({"userName": userName}).exec(function(err, userData) {
        if(err) {
            res.send(err);
            return;
        }
        if(!userData) {
			res.send({msg: '没有该用户'});
			return;
        }
		if(userData) {
			var cryptoPwd = crypto.pbkdf2Sync(passWord,userData.salt,100,8,'sha512').toString('hex');
			cryptoPwd === userData.passWord ? res.redirect('/home') : res.send({msg: '密码错误'});
		}
    });
});

module.exports = router;
