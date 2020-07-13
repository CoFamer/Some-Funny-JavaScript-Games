//获取定时器的函数
function getTimer(duration, thisObj, startHandle, stopHandle){
    var timer = null;   //定时器变量
    if(thisObj && startHandle){
        startHandle = startHandle.bind(thisObj);   //绑定this
    }
    if(thisObj && stopHandle){
        stopHandle = stopHandle.bind(thisObj);   
    }
    return{
        start : function(){
            if(!timer){
                timer = setInterval(function(){
                    if(startHandle){
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
/* 
游戏面板对象
*/
var game = {
    score : 0,      //计分
    defeatDom : document.getElementsByClassName("defeat")[0],
    maxHeight : 600 - 112,
    maxWidth : 800,
    dom : document.getElementById("game"),
    isDead : false,      //是否死亡，默认false
    init : function(){
        skyBg.timer.start();        //天空背景
        landBg.timer.start();       //陆地背景
        bird.wingTimer.start();     //小鸟扇动翅膀
        bird.dropTimer.start();     //小鸟掉落
        pipes.genTimer.start();        //管道生成generate
        pipes.moveTimer.start();    //管道移动
    },
    stop : function(){
        skyBg.timer.stop();
            landBg.timer.stop();
            bird.wingTimer.stop();
            bird.dropTimer.stop();
            pipes.genTimer.stop();
            pipes.moveTimer.stop();
    },
    gameOver : function(){
        if(hitDetector.ishited()){
            this.stop();
            for(var i=0;i<pipes.pipes.length;i++){
                var p = pipes.pipes[i]
                if(bird.left > p.left + p.width){
                    this.score += 0.5;    //未消失的管道计分，因为是一对管，所以每次只加0.5
                }
            }
            console.log(this.score)
            document.getElementsByClassName("score")[0].innerHTML += this.score;
            this.defeatDom.style.display = 'block';
        }
    }
}
/* 
碰撞检测器对象
*/
var hitDetector = {   //碰撞检测器
    ishited : function () {
        if (bird.top >= game.maxHeight - bird.height) {
            //与大地亲吻
            return true;
        }
        //检查是否与柱子发生碰撞
        for (var i = 0; i < pipes.pipes.length; i++) {
            var pipe = pipes.pipes[i];
            if (this.isCollision(pipe)) {
                return true;
            }
        }
        return false;
    },
    isCollision : function (pipe){
        //小鸟与柱子的碰撞检测
        //横向：|矩形1x中心坐标-矩形2x中心坐标| < 宽度和/2
        //纵向：|矩形1y中心坐标-矩形2y中心坐标| < 宽度和/2
        var bx = bird.left + bird.width/2;
        var by = bird.top + bird.height/2;
        var px = pipe.left + pipe.width/2;
        var py = pipe.top + pipe.height/2;
        if(
            Math.abs( px - bx) <= (pipe.width + bird.width)/2 &&
            Math.abs( py - by) <= (pipe.height + bird.height)/2
        ){
            return true;
        }
        return false;
    }
}
/* 
天空背景对象
*/
var skyBg = {
    left : 0,
    dom : document.getElementsByClassName("sky")[0],
    show : function(){  //用来更新left值
        this.dom.style.left = this.left + 'px';
        if(this.left == - game.maxWidth){
            this.left = 0;
        }
    }
}
/* 
陆地背景对象
*/
var landBg = {
    top : 488,
    left : 0,
    dom : document.getElementsByClassName("land")[0],
    show : function(){  //用来更新left值
        this.dom.style.left = this.left + 'px';
        if(this.left == -game.maxWidth){
            this.left = 0;
        }
    }
}
/* 
鸟对象
*/
var bird = {
    width : 33,
    height : 26,
    left : 200,
    top : 150,
    speed : 0,      //初始速度
    acc : 0.002,   //加速度acceleration
    wingIndex : 0,  //翅膀扇动索引
    dom : document.getElementsByClassName("bird")[0],

    //尽量让定时器去处理函数，而不是在定时器里面写函数
    show : function(){    //显示小鸟
        //处理翅膀
        if (this.wingIndex === 0) {
            this.dom.style.backgroundPosition = "-8px -10px";
        }
        else if (this.wingIndex === 1) {
            this.dom.style.backgroundPosition = "-60px -10px";
        }
        else {
            this.dom.style.backgroundPosition = "-113px -10px";
        }
        //设置小鸟的位置
        this.dom.style.left = this.left + "px";
        this.dom.style.top = this.top + "px";
    },
    setTop : function(top){
        if(top < 0){
            top = 0;
        }
        else if (top > landBg.top - this.height) {
            top = landBg.top - this.height;
        }
        this.top = top;
        this.show()
    },
    jump : function(){
        this.speed = -0.5;
    }
}
/* 
管道对象
*/
var pipes = {
    width : 52, //每个管道的宽
    pipes : [], //用来存放管道信息的数组
    domUp : document.getElementsByClassName("pipeUp")[0],
    domDown : document.getElementsByClassName("pipeDown")[0],
    //不会取到max
    getRandom : function(min,max){
        return Math.floor(Math.random() * (max - min) + min);
    },
    //产生一对柱子的函数
    createPair : function(){
        var minHeight = 60, //柱子的最小高度
            gap = 150,      //缝隙
            maxHeight = game.maxHeight - gap - minHeight;
        var pipe1 = document.createElement('div');
        pipe1.className = "pipeUp";
        pipe1.style.height = this.getRandom(minHeight, maxHeight) + 'px';
        game.dom.appendChild(pipe1);

        var pipe2 = document.createElement('div');
        pipe2.className = "pipeDown";
        pipe2.style.height = game.maxHeight - parseInt(pipe1.style.height) - gap + 'px';
        game.dom.appendChild(pipe2);
        
        //存放每个生成的管道信息进入管道信息数组pipes
        this.pipes.push({
            dom : pipe1,
            width : pipes.width,
            height : parseInt(pipe1.style.height),
            left: game.maxWidth,
            top:0
        })
        this.pipes.push({
            dom : pipe2,
            width : pipes.width,
            height : parseInt(pipe2.style.height),
            left: game.maxWidth,
            top: parseInt(pipe1.style.height) + gap
        })
    }
}

//天空背景运动定时器
skyBg.timer = getTimer(30, skyBg, function(){
    this.left -= 2;
    this.show();
    //顺便检测是否gameOver
    game.gameOver();
})
//land背景运动定时器
landBg.timer = getTimer(30, landBg, function(){
    this.left -= 1;
    this.show();
})
//鸟翅膀扇动的定时器
bird.show();//初始化一下小鸟的位置和翅膀状态
bird.wingTimer = getTimer(150, bird, function(){
    this.wingIndex = (this.wingIndex + 1) % 3;
    this.show();
})
//鸟掉落的运动定时器（加速度）
bird.dropTimer = getTimer(16, bird, function(t){
    //t是时间，s是行动路程，a是加速度，v是速度，v0是初始速度
    //加速度公式
    //s = v0t + 1/2at*t
    //v = v0 + at
    var s = this.speed * t + 0.5 * this.acc * t * t;
    this.top += s;
    this.speed = this.speed + this.acc * t;
    this.setTop(this.top);
})
//生成pipes定时器
pipes.genTimer = getTimer(1500, pipes, function(){
    this.createPair();
})
//pipes的移动定时器
pipes.moveTimer = getTimer(16, pipes, function(){
    for(var i=0;i<this.pipes.length;i++){
        var p = this.pipes[i];
        p.left -= 2;
        if(p.left < -p.width){      //超出一个自身宽度
            p.dom.remove();         //移除dom
            this.pipes.splice(i,1); //从数组移除这个元素
            i--;                    //索引减一，不然循环不到下一个，会直接跳过
            game.score += 0.5;      //已经消失的管道计分，因为是一对管，所以每次只加0.5
        }else{
            p.dom.style.left = p.left + 'px';
        }  
    }
})


//游戏刚开始-->暂停，通过isRestart判断，enter键开始
game.stop();


var count = 0;  //用作Enter暂停计数
var isRestart = false;  //判断是否是重新开始页面
//注册事件
window.onkeydown = function(e){
    //按下空格键，跳跃
    if(e.key == " "){
        bird.jump();
    }
    //第一次按下enter后，enter用来做暂停、开始和重新开始
    if(e.key == "Enter" && isRestart){
        //用作暂停
        if(count % 2 == 0 && game.defeatDom.style.display == "none"){
            document.getElementsByClassName("pause")[0].style.display = "block";
            game.stop();
            count++;
        }else if(count % 2 == 1 && game.defeatDom.style.display == "none"){     //用作开始
            document.getElementsByClassName("pause")[0].style.display = "none";
            game.init();
            count++;
        }else if(game.defeatDom.style.display == "block"){      //用作重新开始
            location.reload();
        }
    }
    //第一次按下enter，游戏开始
    if(e.key == "Enter" && !isRestart){
        game.init();
        isRestart = true;
    }
}