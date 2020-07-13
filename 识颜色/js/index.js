//获取定时器函数,返回包含start和stop函数的对象
function getTimer(duration, thisObj, startHandle, stopHandle){
    var timer = null;
    if(thisObj && startHandle){
        startHandle = startHandle.bind(thisObj);    //绑定this
    }
    if(thisObj && stopHandle){
        stopHandle = stopHandle.bind(thisObj);    //绑定this
    }
    return {
        start : function(){
            if(!timer){
                timer = setInterval(function(){
                    if (startHandle) {
                        startHandle(duration);
                    }
                },duration)
            }
        },
        stop : function(){
            if(timer){
                clearInterval(timer);
                timer = null;
                if(stopHandle){
                    stopHandle();
                }
            }
        }
    }
}

//游戏对象
var game = {
    score : 0,//记分
    timing : 60,//计时
    levels : ["瞎子", "色盲", "色郎", "色狼", "色鬼", "色魔", "超级色魔", "变态色魔", "孤独求色"],//等级
    countLv4 : 2,//lv4会出现两次
    countLv5 : 2,//lv5会出现两次
    countLv6 : 3,//lv6会出现三次
    countLv7 : 5,//lv7会出现五次
    _this : null,//保存当前盘的this
    _tr : 0,//保存当前盘的tr
    _td : 0,//保存当前盘的td
    lv : null,//实例对象
    
    firstScreen : {     //首屏
        dom: document.getElementById("firstScreen"),
        button: document.getElementById("gameStart"),
    },
    secondScreen : {    //游戏屏
        dom: document.getElementById("secondScreen"),
        countScore : document.getElementsByClassName("count")[0],
        pause : document.getElementsByClassName("pause")[0],
        timing : document.getElementsByClassName("timing")[0],
    },
    pauseScreen : {     //暂停屏
        dom : document.getElementById("pauseScreen"),
        continue : document.getElementsByClassName("continue")[0],
    },
    endScreen : {       //结束屏
        dom : document.getElementById("endScreen"),
        endScore : document.getElementsByClassName("endScore")[0],
        endLevel : document.getElementsByClassName("endLevel")[0],
        onceAgain : document.getElementsByClassName("onceAgain")[0],
    },
    
    init : function(){
        this.lv = new Checkerboard("lv1", 2, 2);
        this.lv.init();//初始化盘
        game.timingTimer.start();
    }
}

//游戏盘构造函数
function Checkerboard(className, tr, td) {
    this.className = className;
    this.tr = tr;
    this.td = td;

    this.info = []; //存放每一个方块的信息,二维数组
    this.lvGap = 105;    //每个等级所隔的rgb差值（每次隔15）-->1级是105

    this.parent = document.getElementById("game");  //获取父亲节点(#game)
}
//创建dom元素的函数
Checkerboard.prototype.createDom = function () {
    this.parent.innerHTML = '';
    for (var i = 0; i < this.tr; i++) {
        for (var j = 0; j < this.td; j++) {
            var span = document.createElement("span");
            this.parent.appendChild(span);

            this.info.push({    //很重要,保留每一个方块的dom信息
                dom: span,
            })
        }
    }
    this.parent.className = this.className;
}
//初始化函数
Checkerboard.prototype.init = function(){
    game._tr = this.tr;
    game._td = this.td;     //每次初始化的时候得到行和列的值,后面循环该样式要用
    this.updateLvGap();
    this.createDom();
    this.giveColor();
}
//更新等级的rgb值差
Checkerboard.prototype.updateLvGap = function(){
    //lvGap初始105-->1级别（2*2）
    //        90-->2级别（3*3）
    //        75-->3级别（4*4）
    var gap = ((this.tr - 1) - 1);
    if(gap == 7){gap = 6}   //当9格难度时，依然差15rgb
    this.lvGap -= gap * 15;
}
//获取随机数的函数
Checkerboard.prototype.getRandom = function(max, min){
    return Math.floor(Math.random() * (max - min) + min);
}
//得到包含随机间谍的数组
Checkerboard.prototype.getSpy = function () {
    var result = [],
        len = this.tr * this.td;
    for (var i = 1; i <= len; i++) {
        result.push(i);
    }
    result[this.getRandom(0,len)] = "spy";  //随机标记一个间谍
    return result;
}
//赋予颜色,找到spy后,点击构建下一个等级的盘,当等级大于7时,不再重新渲染页面,而是换颜色
Checkerboard.prototype.giveColor = function () {
    var This = this;    //保留内部this,里面用
    game._this = this;   //保留到外部，计时的时候要用
    //颜色取值范围:[50, 205-this.lvGap)
    r = this.getRandom(10, 205-this.lvGap);
    g = this.getRandom(10, 205-this.lvGap);     
    b = this.getRandom(10, 205-this.lvGap);
    var result = this.getSpy(),
        len = this.tr*this.td;
    for (var i = 0; i < len; i++) {
        if(typeof result[i] == "number"){
            this.info[i].dom.style.backgroundColor = "rgb("+r+","+g+","+b+")";
        }
        else{
            //核心，this.info[i].dom  -->  当前的spy dom节点
            this.info[i].dom.style.backgroundColor = "rgb("+(r+this.lvGap)+","+(g+this.lvGap)+","+(b+this.lvGap)+")";
            this.info[i].dom.onclick = function(){
                //点击spy创建新的DOM
                var newlv = This.tr,        //更新等级，因为盘的行列数总是比等级多一,所以这里刚好赋tr
                    newTr = This.tr + 1,    //行数+1
                    newTd = This.td + 1;    //列数+1
                
                //当等级是4、5、6、7时，分别停留不同的次数
                if(newlv == 5 && game.countLv4 > 1){newlv = 4;newTr = 5;newTd = 5;--game.countLv4;}
                if(newlv == 6 && game.countLv5 > 1){newlv = 5;newTr = 6;newTd = 6;--game.countLv5;}
                if(newlv == 7 && game.countLv6 > 1){newlv = 6;newTr = 7;newTd = 7;--game.countLv6;}
                if(newlv == 8 && game.countLv7 > 1){newlv = 7;newTr = 8;newTd = 8;--game.countLv7;}
                var newlvClass = "lv" + newlv;  //新的类名
                if(newlv < 8){     //当等级小于9的时候,重新初始化盘
                    game.lv = new Checkerboard(newlvClass, newTr, newTd);
                    game.lv.init();
                }else if(newlv == 8){
                    game.lv = new Checkerboard(newlvClass, newTr, newTd);
                    game.lv.init();
                    this.onclick = null;    //杀掉这个第一个lv8的点击事件
                }else{  //为了避免重新创建dom，在这里重新渲染lv8的所有颜色就好
                    function update(){
                        if(game.timing <= 0){  //时间结束，递归出口
                            return;
                        }
                        r = This.getRandom(10, 205-This.lvGap);
                        g = This.getRandom(10, 205-This.lvGap);     
                        b = This.getRandom(10, 205-This.lvGap);
                        for(var i=0;i<len;i++){
                            This.info[i].dom.style.backgroundColor = "rgb("+r+","+g+","+b+")";
                        }
                        //随机产生一个间谍
                        var spyIndex = This.getRandom(0,len);   //保留间谍的索引
                        This.info[spyIndex].dom.style.backgroundColor = "rgb("+(r+This.lvGap)+","+(g+This.lvGap)+","+(b+This.lvGap)+")";
                        This.info[spyIndex].dom.onclick = function(){
                            //间谍点击后再重新渲染
                            update();   //递归调用
                            game.score += 2;    //积分,写在递归后面以免计时完后还加分
                            game.secondScreen.countScore.innerHTML = game.score;    //由于前面的onclick已删掉
                            this.onclick = null;    //杀掉上一个点击事件
                        }
                    }
                    update();
                }
                game.secondScreen.countScore.innerHTML = ++game.score;   //积一分
                //如果是等级7以上，额外加一分
                if(newlv >= 7){
                    game.secondScreen.countScore.innerHTML = ++game.score;
                }
            }
        }
    }
}

//计时定时器，游戏结束处理函数
game.timingTimer = getTimer(1000, game, function(){
    this.timing -= 1;
    game.secondScreen.timing.innerHTML = this.timing;
    if (this.timing == 0) { //游戏结束-->方块全变成底板色,渐逝
        game.secondScreen.timing.innerHTML = "￣▽￣";
        for(var i=0;i<game._tr*game._td;i++){
            game._this.info[i].dom.style.transition = "background-color 1s linear";
            game._this.info[i].dom.style.backgroundColor = "rgb(221,221,221)";
        }
        //1秒后,渲染结束屏-->方块消失动画
        setTimeout(function(){
            var score = game.score;     //避免每次都从game里面拿
            if(score >= 0 && score <= 5){
                game.endScreen.endLevel.innerHTML = game.levels[0];     //瞎子
            }else if(score > 5 && score <= 15){     //10
                game.endScreen.endLevel.innerHTML = game.levels[1];     //色盲
            }else if(score > 15 && score <= 30){     //15
                game.endScreen.endLevel.innerHTML = game.levels[2];     //色郎
            }else if(score > 30 && score <= 45){     //15
                game.endScreen.endLevel.innerHTML = game.levels[3];     //色狼
            }else if(score > 45 && score <= 65){     //20
                game.endScreen.endLevel.innerHTML = game.levels[4];     //色鬼
            }else if(score > 65 && score <= 85){     //20
                game.endScreen.endLevel.innerHTML = game.levels[5];     //色魔
            }else if(score > 85 && score <= 105){    //20
                game.endScreen.endLevel.innerHTML = game.levels[6];     //超级色魔
            }else if(score > 105 && score <= 125){    //20
                game.endScreen.endLevel.innerHTML = game.levels[7];     //变态色魔
            }else{                                      //牛
                game.endScreen.endLevel.innerHTML = game.levels[8];     //独孤求色
            }
            game.endScreen.endScore.innerHTML = score;
            game.secondScreen.dom.style.display = 'none';
            game.endScreen.dom.style.display = 'block';
        },1000)
        game.timingTimer.stop();
    }
})

//事件注册-->第一屏的开始游戏按钮点击后,游戏初始化
game.firstScreen.button.onclick = function () {
    game.firstScreen.dom.style.display = 'none';
    game.init();
    //暂停按钮
    game.secondScreen.pause.onclick = function(){
        game.timingTimer.stop();
        game.secondScreen.dom.style.display = 'none';
        game.pauseScreen.dom.style.display = 'block';
    }
    //继续游戏按钮
    game.pauseScreen.continue.onclick = function(){
        game.timingTimer.start();
        game.secondScreen.dom.style.display = 'block';
        game.pauseScreen.dom.style.display = 'none';
    }
    //再来一次按钮
    game.endScreen.onceAgain.onclick = function(){
        location.reload();
    }
}

