# gayhub
practice project for node mongodb redis mongoose express ejs.
user data stored in mongodb. session stored in redis. use ejs display front-end

### 所用技术
有node,mongodb,redis,mongoose,express,ejs,git.
master分支前端页面用原js生编写，mobile分支前端页面所用前端框架jquerymobile

### 实现功能
+ 登录、注册、修改密码（加密，绑定邮箱，验证码登录）
+ 日志的发布、查看、点赞
+ 基于websocket实现群聊
+ 个人信息保存、修改（支持上传图片）

### 操作顺序
+ git clone  https://github.com/rianran1993/gayhub.git
+ npm install
+ (git checkout mobile/master)
+ start local mongodb & redis
+ npm start
+ visit localhost:30000
