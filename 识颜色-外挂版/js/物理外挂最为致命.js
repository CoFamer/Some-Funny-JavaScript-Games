var waigua = document.getElementsByClassName('waigua')[0],
    tingzhi = document.getElementsByClassName('tingzhi')[0],
    dr = document.getElementById('game'),
    ds = dr.children

waigua.onclick = function(){
    set = setInterval(function(){
        // lv.init();
       
    for(var i = 0;i<ds.length;i++){
        if(i == ds.length-2){
            if(ds[i].style.backgroundColor !== ds[i+1].style.backgroundColor){
                ds[i+1].onclick();
                break;
            }
        }
           if(ds[i].style.backgroundColor !== ds[i+1].style.backgroundColor){
            if(ds[i+1].style.backgroundColor == ds[i+2].style.backgroundColor){
                ds[i].onclick();
                break;
            }else{
                ds[i+1].onclick();
                break;
            }
           }
    }
    lv.giveColor();
    // console.log(ds.length)
    },100)
}
tingzhi.onclick = function(){
    clearInterval(set);
}

// 测试sourceTree用、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、、