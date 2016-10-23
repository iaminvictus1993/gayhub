var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var pbkdf2 = require('../pbkdf2');
var temCode;

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

//渲染修改密码页面
router.get('/changePassword', function(req, res, next) {
    res.render('changePassword', {title: '修改密码页面'});
});

var setRandomCode = function(email, randomVal) {
	temCode = {
		email: email,
		temCode: randomVal
	};
};

var getRandomCode = function() {
	return temCode;
};
//注册账号功能
router.post('/register', function(req, res, next) {
    var userName = req.body.userName;
    var email = req.body.email;
	var emailCode = req.body.emailCode;
    var passWord1 = req.body.passWord1;
    var passWord2 = req.body.passWord2;
    //判断两次输入密码是否一致
    if(passWord1 !== passWord2) {
        res.send({"msg": '两次输入密码不一致，请核对'});
        return;
    }
	if((getRandomCode().temCode != emailCode) || getRandomCode().email != email) {
		res.send({"msg": '邮箱验证码不匹配，请核对'});
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
			//"salt": 'dsafdf',
			"email": email,
            "passWord": passWord1.toString()//crypto加密参数需为字符
        }, function(err, data) {
			if(err) {
				res.send(err);
				return;
			}
			if(!data) {
				res.send({msg: 'no data'});
				return;
			}
            res.send({ok: 1, msg: '创建成功'});
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

//发送邮箱确认信息
router.post('/sendEmailCode', function(req, res, next) {
	var randomCode = Math.floor(Math.random()*(999999-100000+1)+100000);
	var html = '您的验证码是<b>【'+randomCode+'】<b>，如非本人操作请忽略。';
	var email = decodeURIComponent(req.body.email);
	//todo 验证邮箱合法性
	//将随机值传给temCode
	setRandomCode(email, randomCode);

	require('../nodemailer')(email, 'gayhub验证码确认信息', html, function(err, data) {
		if(err) {
			res.send(err);
			return;
		}
		if(!data) {
			res.send('data');
			return;
		}
		res.send(data);
	});
});

//用于修改密码密码功能的发送邮箱验证码
router.post('/sendEmailCodeForChangePWD', function(req, res, next) {
	var randomCode = Math.floor(Math.random()*(999999-100000+1)+100000);
	var html = '您的验证码是<b>【'+randomCode+'】<b>，您正在修改密码，如非本人操作请忽略。';
	var userName = decodeURIComponent(req.body.userName);
	//todo 验证邮箱合法性
    var user = global.offerModel.getModel('user');
	user.findOne({"userName": userName}, function(err, data) {
		if(err) {
			res.send(err);
			return;
		}
		if(!data) {
			res.send({msg: 'no data'});
			return;
		}
		data.emailCode = randomCode;
		data.save(function(err, saveData) {
			if(err) {
				res.send(err);
				return;
			}
			if(!saveData) {
				res.send({msg: 'no saveData'});
				return;
			}
			require('../nodemailer')(data.email, 'gayhub验证码确认信息', html, function(err, data) {
				if(err) {
					res.send(err);
					return;
				}
				if(!data) {
					res.send('data');
					return;
				}
				res.send(data);
			});					
		});
	});
});

//修改密码
router.post("/changePassword", function(req, res, next) {
	var userName = req.body.userName;
	var emailCode = req.body.emailCode;
	var passWord1 = req.body.passWord1;
	var passWord2 = req.body.passWord2;
	var html = '密码修改成功，若非本人操作请致电10086，请求客服妹纸帮助。';
	if(passWord1 !== passWord2) {
		res.send("两次输入密码不一致，请核对");
		return;
	}
	var user = global.offerModel.getModel('user');
	user.findOne({"userName": userName}, function(err, data) {
		if(err) {
			res.send(err);
			return;
		}
		if(!data) {
			res.send({msg: 'no data'});
			return;
		}
		//return res.send({"html": emailCode, "data": data.emailCode});
		if(data.emailCode != Number(emailCode)) {
			res.send('验证码错误');
			return;
		}
		data.passWord = passWord1;
		data.save(function(err, saveData) {
			if(err) {
				res.send(err);
				return;
			}
			if(!saveData) {
				res.send({msg: 'no saveData'});
				return;
			}
			require('../nodemailer')(data.email, 'gayhub用户密码修改通知', html, function(err, data) {
				if(err) {
					res.send(err);
					return;
				}
				if(!data) {
					res.send('data');
					return;
				}
				res.send(data);
			});					
		});
	});
});
module.exports = router;
