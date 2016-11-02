var express = require('express');
var router = express.Router();
var crypto = require('crypto');

router.get('/getSession', function(req, res, next) {
	res.send(req.session);
});

router.get('/plus', function(req, res, next) {
    delete req.session.count;
	res.end();
});
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
	
});

//渲染注册页面
router.get('/register', function(req, res, next) {
    res.render('register', {title: '注册页面'});
});

//渲染注册页面
router.get('/register2', function(req, res, next) {
    res.render('register2');
});

//渲染登录页面
router.get('/login', function(req, res, next) {
    res.render('login', {title: 'Hi~~! Gay Hub'});
});

//渲染发布信息页面
router.get('/log', function(req, res, next) {
    res.render('log', {title: '新建日志'});
});

//渲染主页面
router.get('/home', function(req, res, next) {
	if(!req.session.user) {
		res.send({msg: '用户未登录'});
		return;
	}
	var user = global.offerModel.getModel('user');
	//找出新注册用户（必须有头像），前三位
	user.find({"logoPath": {$exists: true}})
		.sort("-createAt")
		//.limit(3)
		.exec(function(err, docs) {
			if(err) {
				res.send(err);
				return;
			}
			if(!docs || docs.length === 0) {
                res.render('home', {title: '主页面', source:docs});
                return;
			}
			// return res.send(decodeURIComponent(docs[0].logoPath).slice(20));
			res.render('home', {title: '主页面', source:docs});
		});


});

//渲染修改密码页面
router.get('/changePassword', function(req, res, next) {
    res.render('changePassword', {title: '修改密码页面'});
});

//渲染我的信息页面
router.get('/myInfo', function(req, res, next) {
    res.render('myInfo', {title: '我的信息页面'});
});

//退出，清楚用户session
router.get('/exit', function(req, res, next) {
	delete req.session.user;
	res.send(req.session);
});

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
	if(req.session.bindEmailCode != emailCode) {
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
            res.redirect("/login");
        });
    });
});

//登录账号功能
router.post('/login', function(req, res, next) {
    var userName = req.body.userName;
    var passWord = req.body.passWord;
    var user = global.offerModel.getModel('user');
    //查找数据库中是否已有该用户
    user.findOne({"userName": userName}, function(err, userData) {
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
			if(cryptoPwd === userData.passWord) {
				req.session.user = userData;
				res.redirect('/home');
			}else{
				res.send({msg: '密码错误'});
			}
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
	// setRandomCode(email, randomCode);
	req.session.bindEmailCode = randomCode;
	setTimeout(function() {
		delete req.session.bindEmailCode;
	},1000*10);	
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
		req.session.emailCodeForCPD = randomCode;
		//设定修改密码邮箱验证码有效时间，但是TMD不是时间不准，就是完全失效。
		setTimeout(function() {
			if(!req.session.emailCodeForCPD) {
				console.log('not exist');
			}else{
				console.log(typeof req.session);
				delete req.session.emailCodeForCPD;
				console.dir(req.session);
			}
		},1000*10);
		require('../nodemailer')(data.email, 'gayhub验证码确认信息', html, function(err, sendData) {
			if(err) {
				res.send(err);
				return;
			}
			if(!sendData) {
				res.send('sendData');
				return;
			}
			res.send(sendData);
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
	if(req.session.emailCodeForCPD != Number(emailCode)) {
		res.send('验证码错误');
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
		user.findOneAndUpdate({
			"userName": userName
		}, {
			"passWord": crypto.pbkdf2Sync(passWord1, data.salt, 100, 8, 'sha512').toString('hex')
		},{
			new: true,
			upsert: true
		}, function(err, updateData) {
			if(err) {
				res.send(err);
				return;
			}
			if(!updateData) {
				res.send({msg: 'no updateData'});
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

router.get("./abc",function(req,res,next){
    res.send("get");
});

//处理发布日志
router.post("./publishLog", function(req, res, next) {
    return res.send("dsfsdfds");
    var title = encodeURIComponent(req.body.title);
    var content = encodeURIComponent(req.body.content);
    //todo 敏感内容过滤
    var log = global.offerModel.getModel('log');
    log.create({
        "title": title,
        "content": content,
        "author": req.session.user.name,
        "time": Date.now()
    }, function(err, data) {
        if(err) {
            res.send(err);
            return;
        }
        if(!data) {
            res.send({msg: "no data"});
            return;
        }
        res.end(data);
    });
});

var multer = require('multer');
var path = require('path');
var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './public/uploads');
    },
    filename: function(req, file, callback) {
        callback(null, file.originalname);
    }
});
var uploads = multer({
    storage: storage
});

//处理提交的个人信息
router.post("/submitMyInfo",uploads.single('logo'), function(req, res, next) {
	if(!req.session.user) {
		res.send({msg: '用户未登录'});
		return;
	}
    //把这些信息更新到相应user数据中
    var updateInfo = {};
    //处理路径,用以后面<img>的src
    updateInfo.logoPath = encodeURIComponent(path.normalize('http://localhost:3000/'+req.file.path.slice(7)));
	//return res.send(encodeURIComponent(updateInfo.logoPath));
    updateInfo.name = req.body.name;
    updateInfo.age = req.body.age;
    updateInfo.sex = req.body.sex;
    updateInfo.sexFor = req.body.sexFor;
    var user = global.offerModel.getModel('user');
    user.findOneAndUpdate({
        "userName": req.session.user.userName
    }, updateInfo, {
        new: true,
        upsert: true
    },function(err, data) {
        if(err) {
            res.send(err);
            return;
        }
        if(!data) {
            res.send({msg: 'no data'});
            return;
        }
        res.send(data);
    });
});

module.exports = router;