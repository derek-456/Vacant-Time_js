(function(){
	let myAnimation = {
		linear:function(t,b,c,d){
			return c*t/d+b;
		}
	}
	
	//target[object]
	function move(curEle,target,duration,callBack){
		window.clearInterval(curEle.timer);
		let begin = {}, change = {};
		for(var key in target){
			if(target.hasOwnProperty(key)){
				begin[key] = Tool.getCss(curEle,key);
				change[key] = parseFloat(target[key]) - begin[key];
			}
		}
		
		let time = 0;
		curEle.timer = window.setInterval(function(){
			time += 100;
			if(time >= duration){
				for(var key in target){
					Tool.setCss(curEle,key,target[key]);
				}
				callBack && callBack.call(curEle);
				window.clearInterval(curEle.timer);
				return;
			}
			for(var key in target){
				if(target.hasOwnProperty(key)){
					let curPos = myAnimation.linear(time,begin[key],change[key],duration);
					Tool.setCss(curEle,key,curPos);
				}
			}
		},100)
	}
	
	window.myAnimation = move;
})()