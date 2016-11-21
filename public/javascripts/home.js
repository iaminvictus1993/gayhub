function openNew(){
    //获取页面高度宽度
    var sHeight = document.documentElement.scrollHeight;
    var sWidth = document.documentElement.scrollWidth;
    //可视区域的高度和宽度
    var wHeight = document.documentElement.clientHeight;
    var wWidth = document.documentElement.clientWidth;//一般与页面相等
    
    var oMask = document.createElement("div");
        oMask.id = "mask";
        oMask.style.height = sHeight + "px";
        oMask.style.width = sWidth + "px";
        document.body.appendChild(oMask);
    var oLogin = document.createElement("div");
        oLogin.id = "login";
        document.body.appendChild(oLogin); 
        oLogin.innerHTML = '<div class="loginCon"><form action="./login" method="post" class="container1">'+
        '<input class="inputArea" type="text" placeholder="请输入账号"   name="userName"/>&nbsp&nbsp&nbsp'+
        '<input class="inputArea" type="password" placeholder="请输入密码"  name="passWord"/>&nbsp'+
        '<input class="login" type="submit" value="登录" />'+
        '<input class="login" id="register" type="submit" value="注册" />'+
        '<input class="login" id="changePassword" type="submit" value="忘记密码" />'+
        '<br/> '+
        '</form><div id="close"></div></div>';
    //获取login的宽度和高度
    var dHeight = oLogin.offsetHeight;
    var dWidth = oLogin.offsetWidth;
        oLogin.style.left = (wWidth-dWidth)/2 + "px";
        oLogin.style.top = (wHeight-dHeight)/2 + "px";
    var oClose = document.getElementById("close");
        oMask.onclick=oClose.onclick = function() {
            document.body.removeChild(oMask);
            document.body.removeChild(oLogin);
        }
    //给注册或则修改密码添加点击事件
    var reg = document.getElementById("register");
    var cpd = document.getElementById("changePassword");
    reg.onclick = function(event){
        event.preventDefault();
        event.stopPropagation();
        window.open("./register", "_self");return false;
    }
    cpd.onclick = function(event){
        event.preventDefault();
        event.stopPropagation();
        window.open("./changePassword", "_self");return false;
    }	
};
window.onload = function() {
    var oBtn = document.getElementById("btnLogin");
        oBtn.onclick = openNew;
    //增加轮播图功能
    var mainCon = document.getElementById('mainCon');
    var list = document.getElementById('list');
    var buttons = document.getElementById('buttons').getElementsByTagName('span');
    var prev = document.getElementById('prev');
    var next = document.getElementById('next');
    var index = 1;
    var animated = false;//优化动画性能
    var timer;
    //点亮小圆点
    function showButton() {
        Array.prototype.forEach.call(buttons, function(item) {
            if(item.className == "on") {
                item.className = "";
                return;
            }
        });
        buttons[index - 1].className = "on";
    }
    function animate(offset) {
        animated = true;
        var newLeft = parseInt(list.style.left) + offset;
        var time = 300;//位移总的时间
        var interval = 10;//位移时间间隔
        var speed = offset/(time/interval);//每次位移量
        
        function go() {
            var con1 = speed < 0 && parseInt(list.style.left) > newLeft;
            var con2 = speed > 0 && parseInt(list.style.left) < newLeft;
                if(con1 || con2) {
                list.style.left = parseInt(list.style.left) + speed + 'px';
                setTimeout(go, interval);
            } else {
                list.style.left = newLeft + 'px';
                //判断是否在辅助图上，归位
                if(newLeft > -600) {
                    list.style.left = -3000 +'px';
                }
                if(newLeft < -3000) {
                    list.style.left = -600 +'px';
                }    
                animated = false;                        
            }
        }
        go();
    }     
    next.onclick = function() {
        if(animated) {
            return;
        }
        if(index == 5) {
            index = 1;
        }else{
            index += 1;               
        }
        animate(-600);               
        showButton();
    };
    prev.onclick = function() {
        if(animated) {
            return;
        }
        if(index == 1) {
            index = 5;
        }else{
            index -= 1;               
        }
        animate(600);               
        showButton();
    }; 
    Array.prototype.forEach.call(buttons, function(item) {
        item.onclick = function() {
            if(animated) {
                return;
            }                    
            //显示正确，不必执行下面代码，优化性能
            if(this.className == "on") {
                return;
            }
            //自定义属性getAttribute
            var myIndex = parseInt(this.getAttribute('index'));
            animate(-600*(myIndex-index));//与上次图片的差值
            index = myIndex;//index更新数值
            showButton();
        }
    });
    //自动播放
    function play(){
        timer = setInterval(function(){
            next.onclick();
        },3000);
    }
    function stop() {
        clearInterval(timer);            
    }
    //删除定时器
    mainCon.onmouseover = stop;
    mainCon.onmouseout = play;
    play();
    //把mainCon动态居中
    var mOffset = mainCon.offsetWidth;
    mainCon.style.left = (document.documentElement.clientWidth - mOffset)/2 + 'px';
}