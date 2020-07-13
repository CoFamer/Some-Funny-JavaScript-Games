/*
 * @Author: your name
 * @Date: 2020-07-06 22:18:02
 * @LastEditTime: 2020-07-07 12:48:32
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \扫雷\js\index.js
 */ 
function Mine(tr, td, mineNum){
    this.tr = tr;               //初始化行数
    this.td = td;               //初始化列数
    this.mineNum = mineNum;     //初始化雷的数量

    //行列索引用来取每个方块的位置，坐标索引用来探寻九宫格方块，坐标索引刚好是行列索引反过来
    this.squares = [];          //二维数组，用来存放所有方块的对象信息，其数据结构是一个对象，包括类型，行列索引等等
    this.tds = [];              //二维数组，用来存放每个方块的DOM信息
    this.spareMine = mineNum;   //剩余雷的数量
    this.allRight = false;      //是否标的小旗下面都是雷

    this.parent = document.getElementsByClassName("disc")[0];      //DOM获取棋盘父级元素
    
}

//产生随机的雷
Mine.prototype.getRanMine = function(){
    var result = [];        //存放产生的随即索引的雷的数组
        len = this.tr*this.td;
    for(var i=1;i<=len;i++){
        result.push(i);
    }
    result.sort(function(){return 0.5-Math.random();})      //乱序数组
    return result.slice(0,this.mineNum);                  //截取到雷的数量的长度
}

//创建棋盘，并赋值一些重要信息，添加上事件
Mine.prototype.createDom = function(){
    //一般用row代表行，col代表行列
    var This = this;    //保存实例对象的this

    var table = document.createElement("table");
    for(var i=0;i<this.tr;i++){
        var row = document.createElement("tr");
        this.tds[i] = [];           //使tds变成二维数组
        for(var j=0;j<this.td;j++){
            var col = document.createElement("td");
            col.pos = [i,j];        //很重要，为每个td标签保存自己的pos属性（行列索引）
            this.tds[i][j] = col;   //保存每个td的信息到this.tds里，tds是二维数组

            col.onmousedown = function(){
                This.play(event,this);  //大This:实例对象，小this:col
            }

            row.appendChild(col);
        }
        table.appendChild(row);
    }
	this.parent.innerHTML='';	//避免多次点击创建多个
	this.parent.appendChild(table);
}

//初始化函数
Mine.prototype.init = function(){
    var mineIndex = this.getRanMine();
        n = 0;
    console.log(mineIndex);
    //为每一个方格添加上他的属性，并绑定点击事件
    for(var i=0;i<this.tr;i++){
        this.squares[i] = [];
        for(var j=0;j<this.td;j++){
            if(mineIndex.indexOf(++n) != -1){
                //squares存放信息的索引按坐标索引来，方便后面寻找九宫格
                this.squares[i][j] = {type:"mine",x:j,y:i};     
            }else{
                this.squares[i][j] = {type:"number",x:j,y:i,value:0}
            }
        }
    }

    this.createDom();   //创建DOM
    this.update();      //更新数字vaule
    
    //清除右键默认事件-->事件委托
    this.parent.oncontextmenu = function(){
		return false;
    }
    
    //剩余雷数
	this.mineNumDom = document.getElementsByClassName('mineNum')[0];
	this.mineNumDom.innerHTML = this.spareMine;
}

//寻找九宫格函数-->思路：雷的九宫格内除了自己，使其他每个number类型的value值加一，当然贴边的情况另算
Mine.prototype.findNine = function(square){ //参数square是单个点的square对象信息
    var x = square.x;  
    var y = square.y;      //创建变量存放当前传入的那个点的坐标索引
	var result=[];	       //把找到的格子的坐标保存（二维数组）
    
    /* 坐标索引获取九宫格位置图如下
        x-1,y-1   x,y-1  x+1,y-1
        x-1,y     x,y    x+1,y
        x-1,y+1   x,y+1  x+1,y+1
    */

    for(var i=x-1;i<=x+1;i++){
        for(var j=y-1;j<=y+1;j++){
            if(
                i<0 ||           //左边超出的情况
                j<0 ||           //上边超出的情况
                i>this.td-1 ||   //右边超出的情况
                j>this.tr-1 ||   //下边超出的情况
                //这里的squares之所以用[j][i]是要按正常行列取索引，因为赋值的时候是按行列索引赋值，赋值对象的内容才颠倒，按坐标索引赋属性值
                this.squares[j][i].type == "mine" ||   //周围的格子是雷时
                (i==x && j==y)  //当循环到自己的时候
            ){
                continue;   //这些情况跳过
            }
            result.push([j,i]); //要以行与列的形式返回出去。因为到时候需要用它去取数组里的数据
        }
    }
    return result;
}

//更新出所有数字-->雷周围九宫格的数字值加一
Mine.prototype.update = function(){
    for(var i=0;i<this.tr;i++){
        for(var j=0;j<this.td;j++){
            if(this.squares[i][j].type == "mine"){
                var getNum = this.findNine(this.squares[i][j]);
                for(var k=0;k<getNum.length;k++){
                    this.squares[getNum[k][0]][getNum[k][1]].value += 1;
                }
            }
        }
    }
}

//用户操作事件函数-->思路：点击数字
Mine.prototype.play = function(e, obj){ //这里的obj得到的是cul
    var This = this;    //保存外部实例对象this
    
    if(e.which==1 && obj.className!='flag'){	//后面的条件是为了限制用户标完小红旗后不能够左键点击
        var squareInfo = this.squares[obj.pos[0]][obj.pos[1]];//获取当前点击的这个td的square对象信息
        var cl=['zero','one','two','three','four','five','six','seven','eigth'];//用于添加样式

        if(squareInfo.type == "number"){
            //用户点到了数字
            obj.innerHTML = squareInfo.value;
            obj.className = cl[squareInfo.value];

            if(squareInfo.value == 0){
                //特别的，用户点到了0
                obj.innerHTML='';	//数字为0，不显示 

                function getAllZero(square){  //核心，参数：点击的那一个方块，若是0，则递归寻找
                    var getNum = This.findNine(square); //找到周围的数字square对象信息

                    for(var i=0;i<getNum.length;i++){
                        var x = getNum[i][0];	//得到行索引
                        var y = getNum[i][1];	//得到列索引
                        
                        This.tds[x][y].className = cl[This.squares[x][y].value];  //赋className

                        if(This.squares[x][y].value==0){
                            //如果以某个格子为中心找到的其他格子值为0，那就递归寻找
                            if(!This.tds[x][y].check){
                                //给对应的td添加一个属性，这条属性用于决定这个格子有没有被找过。如果找过的话，它的值就为true，下一次就不会再找了
                                This.tds[x][y].check = true;
                                getAllZero(This.squares[x][y]);
                            }
                        }else{
                            //如果以某个格子为中心找到的四周格子的值不为0，那就把人家的数字显示出来
                            This.tds[x][y].innerHTML = This.squares[x][y].value;
                        }
                    }
                }
                getAllZero(squareInfo);
            }
        }else{
            this.gameOver(obj);
        }
    }

    //用户点击的是右键
	if(e.which == 3){
		//如果右击的是一个数字（有className），那就不能点击
		if(obj.className && obj.className!='flag'){
			return;
		}
		obj.className = obj.className == 'flag' ? '':'flag';	//切换CLASS

		if(this.squares[obj.pos[0]][obj.pos[1]].type == 'mine'){
			this.allRight = true;	//用户标的小红旗背后是雷
		}else{
			this.allRight = false;
		}


		if(obj.className=='flag'){
			this.mineNumDom.innerHTML = --this.spareMine;
		}else{
			this.mineNumDom.innerHTML = ++this.spareMine;
		}

		if(this.spareMine == 0){
			//剩余的雷的数量为0，表示用户已经标完小红旗了，这时候要判断游戏是成功还是结束
			if(this.allRight){
				//这个条件成立说明用户全部标对了
				alert('恭喜你，游戏通过');
			}else{
				alert('游戏失败');
				this.gameOver();
			}
		}
	}
}

//游戏失败函数
Mine.prototype.gameOver = function(clickTd){
	/* 
		1、显示所有的雷
		2、取消所有格子的点击事件
		3、给点中的那个雷标上一个红
	 */
	for(var i=0;i<this.tr;i++){
		for(var j=0;j<this.td;j++){
			if(this.squares[i][j].type == 'mine'){
				this.tds[i][j].className = 'mine';
			}

			this.tds[i][j].onmousedown = null;
		}
	}
	if(clickTd){
		clickTd.style.backgroundColor = '#f00';
	}
}

//上边button的功能
var btns = document.getElementsByTagName('button');
var mine = null;	//用来存储生成的实例
var ln = 0;	//用来处理当前选中的状态
var arr = [[9,9,10],[16,16,40],[24,24,99],[36,36,180],[48,48,300],[60,60,500],[120,60,680]];	//不同级别的行数列数雷数

for(let i=0;i<btns.length-1;i++){
	btns[i].onclick = function(){
		btns[ln].className = '';
		this.className = 'active';

		mine = new Mine(...arr[i]);
		mine.init();

		ln = i;
	}
}
btns[0].onclick();	//初始化一下,确保刚开始是初级页面
btns[7].onclick = function(){
	alert("你还真敢想啊！")
}
btns[8].onclick = function(){
	mine.init();
}