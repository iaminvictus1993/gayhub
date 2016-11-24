var express = require('express');
var router = express.Router();
var crypto = require('crypto');

router.get('/agg', function(req, res, next) {
    var log = global.offerModel.getModel('log');
    var aggregate = log.aggregate();
    if(req.query.limit) {
        aggregate.limit(req.query.limit);
    }
    aggregate.match({}).group({
        _id: "$userId",
        logsCount: {
            $sum: 1
        }
    }).project({
        _id: 1, //
        userId: "$logsCount", //分组条件，须设值为“_id”
        logsCount: 1
    }).then(function(data) {
        res.send(data);        
    });
});

router.get('/getSession', function(req, res, next) {
	res.send(req.session);
});

router.get('/plus', function(req, res, next) {
    delete req.session.count;
	res.end();
});

router.get('/', function(req, res, next) {
    res.render('login', {title: 'Hello! Gay Hub'});
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
    res.render('login', {title: 'Hello! Gay Hub'});
});

//渲染发布信息页面
router.get('/log', function(req, res, next) {
	if(!req.session.user) {
		res.send("<h1>用户未登录</h1><br/><a href='./login'>前往登录</a>");
		return;
	}
	var log = global.offerModel.getModel('log');
	log.find({
		userId: req.session.user._id
	}).exec(function(err, docs) {
		if(err) {
			res.send(err);
			return;
		}
		if(!docs || docs.length === 0) {
			res.render('log', {
				title: '新建日志',
				logSource: []
			});	
			return;
		}
		var newArr = [];
		docs.forEach(function(item) {
			item.title = decodeURIComponent(item.title);
			item.content = decodeURIComponent(item.content);
			newArr.push(item);
		});
		res.render('log', {
			title: '新建日志',
			logSource: newArr
		});		
	});

});

//渲染日志列表页面
router.get('/logList', function(req, res, next) {
	if(!req.session.user) {
		// res.send("<h1>用户未登录</h1><br/><a href='./home'>前往登录</a>");
        res.render('autoBack');
		return;
	}    
	var currentPage = req.query.page;
	var skipNum = currentPage !== 1 ? (currentPage-1)*8 : 0;
	var log = global.offerModel.getModel('log');
    //增加模糊搜索，支持title content
    var search = encodeURIComponent(req.query.search);//汉字，数据库中的值是经过编码处理的
    var condition = {};
    condition.$and = [];
    condition.$and.push({userId: req.session.user._id});
    if((search != "undefined") && (search != "")) {
        var orcond = [];
        orcond.push({"title": {$regex: search}});
        orcond.push({"content": {$regex: search}});
        condition.$and.push({$or: orcond});
    }
	log.find(condition).exec(function(err, totaldocs) {
		if(err) {
			res.send(err);
			return;
		}
        //若没有搜索数据，则返回空数据页面
        if(search && (!totaldocs || totaldocs.length === 0)) {
			res.render('logList', {
				title: '日志列表',
				logSource: [],
				totalSource: []
			});	
            return;
        }
		if(!totaldocs || totaldocs.length === 0) {
			res.send("<h1>暂未日志数据1</h1><br/><a href='./log'>前往发表日志</a>");
			return;
		}
		log.find(condition).skip(skipNum).limit(8).sort("-time").exec(function(err, docs) {
			if(err) {
				res.send(err);
				return;
			}
			if(!docs || docs.length === 0) {
				res.send("<h1>暂未日志数据</h1><br/><a href='./log'>前往发表日志</a>");
				return;
			}
			var newArr = [];
			docs.forEach(function(item) {
				item.title = decodeURIComponent(item.title);
				item.content = decodeURIComponent(item.content);
				newArr.push(item);
			});
			res.render('logList', {
				title: '日志列表',
				logSource: newArr,
				totalSource: totaldocs
			});		
		});		
	});
});

//渲染主页面
router.get('/home', function(req, res, next) {
	// if(!req.session.user) {
		// res.send("<h1>用户未登录</h1><br/><a href='./login'>前往登录</a>");
		// return;
	// }
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
            var sessionName = req.session.user?'切换账号':'请登录';
			res.render('home', {title: '主页面', source:docs, name: sessionName});
		});


});

//渲染查看他人日志页面
router.get('/viewLog', function(req, res, next) {
	if(!req.session.user) {
		res.send("<h1>用户未登录</h1><br/><a href='./home'>前往登录</a>");
		return;
	}    
	try{
		var currentPage = req.query.page;
		var skipNum = currentPage !== 1 ? (currentPage-1)*8 : 0;
		// return res.send(skipNum);
	}catch(err) {
				console.log(err);
	}
	var log = global.offerModel.getModel('log');
	log.find({
		userId: req.query.id
	}).exec(function(err, totaldocs) {
		if(err) {
			res.send(err);
			return;
		}
		if(!totaldocs || totaldocs.length === 0) {
			res.send("<h1>暂未日志数据</h1><br/><a href='./home'>返回主页</a>");
			return;
		}
		log.find({
			userId: req.query.id
		}).skip(skipNum).limit(8).sort("-time").exec(function(err, docs) {
			if(err) {
				res.send(err);
				return;
			}
			if(!docs || docs.length === 0) {
				res.send("<h1>暂未日志数据</h1><br/><a href='./home'>返回主页</a>");
				return;
			}
			var newArr = [];
			docs.forEach(function(item) {
				item.title = decodeURIComponent(item.title);
				item.content = decodeURIComponent(item.content);
				newArr.push(item);
			});
			res.render('viewLog', {
				title: '日志列表',
				logSource: newArr,
				totalSource: totaldocs,
				originalUrl: "."+req.originalUrl.slice(0,36)
			});		
		});		
	});
});

//渲染修改密码页面
router.get('/changePassword', function(req, res, next) {
    res.render('changePassword', {title: '修改密码页面'});
});

//渲染我的信息页面
router.get('/myInfo', function(req, res, next) {
    if(!req.session.user) {
        res.send("<h1>用户未登录</h1><br/><a href='./login'>前往登录</a>");
        return;
    }
    var user = global.offerModel.getModel('user');
    user.findOne({"userName": req.session.user.userName},function(err, data) {
        if(err) {
            res.send(err);
            return;
        }
        if(!data) {
            res.send({msg: "no data"});
            return;
        }
        res.render('myInfo', {title: '我的信息页面', currentUser: data, logoPath: decodeURIComponent(data.logoPath)});
    });
});

//退出，清楚用户session
router.get('/exit', function(req, res, next) {
	delete req.session.user;
	res.redirect('/login');
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
            res.send("<h1>用户已存在登录，请直接登录</h1><br/><a href='./login'>前往登录</a>");
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
            res.status(200).redirect("/login");
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
            req.flash('error', "没有该用户，请注册！");
            res.redirect('/login');            
			//res.send("<h1>没有该用户，请注册</h1><br/><a href='./register'>前往注册</a>");
			return;
        }
		if(userData) {
			var cryptoPwd = crypto.pbkdf2Sync(passWord,userData.salt,100,8,'sha512').toString('hex');
			if(cryptoPwd === userData.passWord) {
				req.session.user = userData;
				res.redirect('/home');
			}else{
                req.flash('error', "密码错误！");
                res.redirect('/login');
				//res.send("<h1>密码错误，若忘记密码请修改密码</h1><br/><a href='./changePassword'>前往修改密码</a>");
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

//处理发布日志
router.post("/publishLog", function(req, res, next) {
    var title = encodeURIComponent(req.body.title);
    var content = encodeURIComponent(req.body.content);
    //todo 敏感内容过滤
    var log = global.offerModel.getModel('log');
    log.create({
        "userId": req.session.user._id,
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
        //将log与对应用户相互关联起来
        var user = global.offerModel.getModel('user');
        user.findByIdAndUpdate(req.session.user._id, {$set:{
            "logId": data._id
        }}, {
            new: true,
            upsert: true
        })
        .exec(function(err, userData) {
            if(err) {
                res.send(err);
                return;
            }
            if(!userData) {
                res.send({msg: "no userData"});
                return;
            }
            req.flash("info", "发出成功");
            res.redirect("/log");
        });
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
		res.send("<h1>用户未登录</h1><br/><a href='./login'>前往登录</a>");
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
        res.redirect("/home");
    });
});

//提供socket群聊
router.get("/chatTogether", function(req, res, next) {
	if(!req.session.user) {
		res.send("<h1>用户未登录</h1><br/><a href='./login'>前往登录</a>");
		return;
	}
    res.render("socket", {name: req.session.user.name});
});
module.exports = router;