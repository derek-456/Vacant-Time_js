let home = (function(){
	let carousel = document.querySelector('.carousel'),
		carousel_img = Tool.firstChild(carousel),
		imgList = carousel_img.getElementsByTagName('img'),
		pre = Tool.next(carousel_img),
		next = Tool.next(pre),
		count_ul = Tool.firstChild(Tool.lastChild(carousel)),
		count_li = count_ul.getElementsByTagName('li'),
		floor = document.getElementsByClassName('floor')[0],
		floor_h = floor.querySelectorAll('h3'),
		box_bd = floor.querySelectorAll('.box-bd'),
		floorImgList = floor.getElementsByTagName('img'),
		aside = document.querySelector('.aside'),
		asideList = aside.querySelectorAll('li');
	
	
	// 请求数据功能
	function ajax(options){
		let defaults = {
			type:'get',
			url:'',
			data:{id:1},
			hearder:{'Content-Type':'application/x-www-form-urlencoded'},
			// success: function(){},
			// error: function(){}
		};
		Object.assign(defaults, options);
		let xhr = new XMLHttpRequest();
		let params = null;
		for(let key in defaults.data){
			params += key + '=' + defaults.data[key] + '&';
		}
		params = params.substring(0,params.length-1);
		if(defaults.type === 'get'){
			defaults.url = defaults.url + '?' + params;
		}
		xhr.open(defaults.type,defaults.url);
		if(defaults.type === 'post'){
			let contentType = defaults.header['Content-Type'];
			xhr.setRequestHeader('Content-Type', contentType);
			if(contentType === 'application/json'){
				xhr.send(JSON.stringify(defaults.data))
			}else{
				xhr.send(params);
			}
		}else{
			xhr.send();
		}
		xhr.onload = function(){
			let contentType = xhr.getResponseHeader('Content-Type');
			let responseText = xhr.responseText;
			if(contentType.includes('application/json')){
				responseText = JSON.parse(responseText);
			}
			if(xhr.readyState ===4 & xhr.status === 200){
				defaults.success(responseText,xhr);
			}else{
				defaults.error(responseText,xhr);
			}
		}
	}
	function lazyImg(){
		for(let i=0;i<imgList.length;i++){
			let curImg = imgList[i];
			let oImg = new Image;
			oImg.src = curImg.getAttribute('data-img');
			oImg.onload = function(){
				curImg.src = this.src;
				Tool.setCss(curImg,'display','block');
				myAnimation(curImg,{opacity:1},300);
				oImg = null;
			}
		}
	}
	function banner(){
		let total =null;
		//Promise 管理异步
		let promise = new Promise((resolve,reject)=>{
			// 请求数据
			this.ajax({
				type: "get",
				url: "./data/banner_index.json",
				success: function(jsonDate){
					//数据绑定
					let str = strLi = '';
					jsonDate.forEach(({type,name,post_url},index)=>{
						str += `<li><a href="#" title=${name}><img src data-img=${post_url} alt=""></a></li>`;
						strLi += index ==0?`<li class="active"></li>`:`<li></li>`;
					})
					str += `<li><a href="#" title=`+jsonDate[0]['name']+`><img src alt="" data-img=`+jsonDate[0]["post_url"]+`></a></li>`;
					carousel_img.innerHTML = str;
					count_ul.innerHTML = strLi;
					total = jsonDate.length +1;
					Tool.setCss(carousel_img,'width',1200*total);
					Tool.setCss(count_ul,'width',25*total);
					resolve()
				}
			})
		})
		// .then(()=>{
		// 	//焦点轮播
		// 	for(let i=0;i<total-1;i++){
		// 		let curLi = count_li[i];
		// 		curLi.index = i;
		// 		curLi.onclick = function(){
		// 			step = this.index;
		// 			Tool.setCss(carousel_img,'left',-step*1200);
		// 			changeTip();
		// 		}
		// 	}
		// })
		//轮播图懒加载
		// function lazyImg(a){
		// 	for(let i=0;i<imgList.length;i++){
		// 		let curImg = imgList[i];
		// 		let oImg = new Image;
		// 		oImg.src = curImg.getAttribute('data-img');
		// 		oImg.onload = function(){
		// 			curImg.src = this.src;
		// 			Tool.setCss(curImg,'display','block');
		// 			myAnimation(curImg,{opacity:1},300);
		// 			oImg = null;
		// 		}
		// 	}
		// }
		window.setTimeout(lazyImg,300);
		
		//实现自动轮播
		let step = 0;
		let interval = 3000;
		let autoTimer = window.setInterval(autoMove,interval);
		function autoMove(){
			if(step>=4){
				step = 0;
				Tool.setCss(carousel_img,'left',0);
			}
			step++;
			myAnimation(carousel_img,{left:-step*1200},500);
			changeTip();
		}
		
		//焦点对齐
		function changeTip(){
			let temStep = step>=total-1?0:step;
			for(let i=0;i<count_li.length;i++){
				let curLi = count_li[i];
				curLi.className= i===temStep?'active':'';
			}
		}
		
		promise.then(()=>{
			for(let i=0;i<total-1;i++){
				let curLi = count_li[i];
				curLi.index = i;
				curLi.onclick = function(){
					step = this.index;
					Tool.setCss(carousel_img,'left',-step*1200);
					changeTip();
				}
			}
		})
		
		//鼠标停止轮播
		carousel.onmouseenter = function(){
			window.clearInterval(autoTimer);
			myAnimation(pre,{opacity:1},300);
			myAnimation(next,{opacity:1},300);
		}
		carousel.onmouseleave = function(){
			autoTimer = window.setInterval(autoMove,interval);
			myAnimation(pre,{opacity:0},300);
			myAnimation(next,{opacity:0},300);
		}
		//实现左右切换
		next.onclick = autoMove;
		pre.onclick = function(){
			if(step<=0){
				step=4;
				Tool.setCss(carousel_img,'left',-step*1200);
			}
			step--;
			myAnimation(carousel_img,{left:-step*1200},500);
			changeTip();
		}
		
	}
	
	//延迟请求和加载
	//楼层区域数据请求
	function getFloorData(){
		for(let i=0,len=floor_h.length;i<len;i++){
			let curFloor = floor_h[i];
			let curBox_bd = box_bd[i];
			let curImgList = curBox_bd.getElementsByTagName('img');
			if(curFloor.isLoad){
				continue;
			}
			let A = curFloor.offsetTop + curFloor.offsetHeight + 130;
			let B = Tool.win("clientHeight") + Tool.win('scrollTop');
			if(A<B){
				//依据i的不同获取不同的地址、
				function bind(jsonDate,xhr){
					let str = strLi = '';
					jsonDate.forEach(({type,name,post_url},index)=>{
						str += `<li><a href="#"><img src data-img=${post_url} alt=""><span>${name}</span></a></li>`;
					})
					curBox_bd.innerHTML = str;
					curFloor.isLoad = true;
					Tool.setCss(box_bd[i].parentNode,'background','none');
					
					//floor图片懒加载
					for(let i=0;i<curImgList.length;i++){
						let curImg = curImgList[i];
						// console.log(1);
						// console.log(curImg);
						if(curImg.isLoad){
							continue;
						}
						let oImg = new Image;
							oImg.src = curImg.getAttribute('data-img');
							oImg.onload = function(){
							curImg.src = this.src;
							myAnimation(curImg,{opacity:1},500);
							oImg = null;
							curImg.isLoad = true;
						}
					}
				}
				let obj = [{typ:'get',url:'./data/movie_index.json',success:bind},{typ:'get',url:'./data/animation_index.json',success:bind},{typ:'get',url:'./data/teleplay_index.json',success:bind},{typ:'get',url:'./data/book_index.json',success:bind},]
				this.ajax(obj[i]);
				
				
				// promise.then(()=>{
				// 	for(let i=0;i<floorImgList.length;i++){
				// 		let curImg = floorImgList[i];
				// 		if(curImg.isLoad){
				// 			continue;
				// 		}
				// 	let A = curImg.offsetTop + 180;
				// 	let B = Tool.win("clientHeight") + Tool.win('scrollTop');
				// 	console.log(A);
				// 	if(A<B){
				// 		let oImg = new Image;
				// 			oImg.src = curImg.getAttribute('data-img');
				// 			oImg.onload = function(){
				// 			curImg.src = this.src;
				// 			oImg = null;
				// 		}
				// 		curImg.isLoad = true;
				// 		}
				// 	}
				// })
			}
		}
	}
	
	//侧边栏滚动切换
	function asideChange(){
		let B = Tool.win('scrollTop');
		let toTop = document.querySelector('#toTop');
		for(let i=0,len=floor_h.length;i<len;i++){
			let curFloor = floor_h[i];
			let A = curFloor.offsetTop;
			if(A-B<=265&A-B>=85&B>266){
				change(i);
			}
			if(B<266){
				for(let k=0;k<asideList.length;k++){
					let curAside = asideList[k];
					curAside.className = 'asideItem';
				}
			}
		}
		function change(i){
			for(let k=0;k<asideList.length;k++){
				let curAside = asideList[k];
				curAside.className = 'asideItem';
			}
			asideList[i].className = 'asideItem active';
		}
		if(B>600){
			toTop.onclick = function(){
				Tool.win('scrollTop',0);
			}
			toTop.isclick = true;
		}
	}
	
	
	
	
	
	
	
	
	return {
		ajax:ajax,
		banner:banner,
		getFloorData:getFloorData,
		// lazyFloorImg:lazyFloorImg,
		// lazyAllImg:lazyAllImg
		asideChange:asideChange
	}
})()

home.banner();
window.setTimeout(function(){home.getFloorData()},200);
// home.lazyAllImg();
window.onscroll = function(){
	home.getFloorData();
	home.asideChange();
};

