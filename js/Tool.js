let Tool = (function(){
	let flag = window.getComputedStyle;
	let frag = 'getComputedStyle' in window;
	/*设置元素行内样式,对于常用的直接自动带单位
	*@params curEle[object] attr[string] value[number]
	*@return the style is working  
	*/
	function setCss(curEle,attr,value){
		if(attr === 'float'){
			curEle.style.cssFloat = value;
			curEle.style.styleFloat = value;
		}else{
			if(typeof value === 'string' && /px$/i.test(value)){
				curEle.style[attr] = value;
			}else{
				let reg = /width|height|left|right|top|bottom|((margin|padding)(Top|Left|Bottom|Right)?)/i;
				curEle.style[attr]= reg.test(attr)?value+"px":value;
			}
		}
	}
	
	/*获取元素的样式值，带数字的得到的结果为数字
	*@params: curEle[object] attr[string]
	*@return: val[number] or val[string]
	*/
	function getCss(curEle,attr){
		let val = null;
		if(flag){
			val = window.getComputedStyle(curEle,null)[attr];
		}else{
			if(attr === 'opacity'){
				val = curEle.currentStyle['filter'];
				let reg = /^alpha\(opacity=(\d+(\.\d+)?)\)$/i;
				val = reg.test(val)?reg.exec(val)[1]:1;
			}else{
				val = curEle.currentStyle[attr];
			}
		}
		let reg1 = /^(-?\d+(\.\d+)?)(px|rem|em|pt)?/i;
		return reg1.test(val)?parseFloat(val):val;
	}
	
	/*操作浏览器盒子模型的方法
	*@params: attr[string] value[有效数字]
	*@return: [number]
	*/
	function win(attr,value){
		if(value === undefined){
			return document.documentElement[attr] || document.body[attr];
		}
		document.documentElement[attr] = value;
		document.documentElement[attr] = value;
	}
	
	/*获取当前元素距离父级参照物的偏移
	*@params: curEle[object]
	*@return: object[left: ,top: ]
	*/
	function offset(curEle){
		let totalLeft = null, totalTop = null, par = curEle.offsetParent;
		totalLeft += curEle.offsetLeft;
		totalTop += curEle.offsetTop;
		while(par){
			if(flag){
			totalLeft += par.clientLeft;
			totalTop += par.clientTop;
		}
		totalLeft += par.offsetLeft;
		totalTop += par.offsetTop;
		par = par.offsetParent;
		}
		return {left:totalLeft,top:totalTop};
	}
	
	function children(curEle,tagName){
		let ary=[];
		if(frag){
			ary = [].slice.call(curEle.children);
		}else{
			nodeList = curEle.childNodes;
			for(let i = 0;i<nodeList.length;i++){
				let curNode = nodeList[i];
				if(curNode.nodeType === 1){
					ary.push(curNode);
				}
			}
		}
		if(typeof tagName === 'string'){
			for(let k=0;k<ary.length;k++){
				if(ary[k].nodeName !== tagName){
					ary[k] = ary[ary.length-1];
					ary.length--;
					k--;
				}
			}
		}
		return ary;
	}
	
	function prev(curEle){
		if(frag){
			return curEle.previousElementSibling;
		}
		let pre = curEle.previousSibling;
		while(pre && pre.nodeType !==1){
			pre = pre.previousSibling;
		}
		return pre;
	}
	
	function next(curEle){
		if(frag){
			return curEle.nextElementSibling;
		}
		let nex = curEle.nextSibling;
		while(nex && nex.nodeType !==1 ){
			nex = nex.nextSibling;
		}
		return nex;
	}
	
	function prevAll(curEle){
		let ary = [], pre =this.prev(curEle); 
		while(pre){
			ary.unshift(pre);
			pre =this.prev(pre);
		}
		return ary;
	}
	
	function nextAll(curEle){
		let ary = [], nex =this.next(curEle);
		while(nex){
			ary.push(nex);
			nex = this.next(nex);
		}
		return ary;
	}
	
	function sibling(curEle){
		let pre = this.prev(curEle);
		let nex = this.next(curEle);
		let ary = [];
		pre?ary.push(pre):null;
		nex?ary.push(nex):null;
		return ary;
	}
	
	function siblings(curEle){
		return this.prevAll(curEle).concat(this.nextAll(curEle));
	}
	
	function index(curEle){
		return this.prevAll(curEle).length;
	}
	
	function firstChild(curEle){
		let chs = this.children(curEle);
		return chs.length>0?chs[0]:null;
	}
	
	function lastChild(curEle){
		let chs = this.children(curEle);
		return chs.length>0?chs[chs.length-1]:null;
	}
	
	function append(newEle,container){
		container.appendChild(newEle);
	}
	
	function prepend(newEle,container){
		let fir = this.firstChild(newEle);
		if(fir){
			container.insertBefore(newEle,fir);
			return;
		}
		container.appendChild(newEle);
	}
	
	function insertBefore(newEle,oldEle){
		oldEle.parentNode.insertBefore(newEle,oldEle);
	}
	
	function insertAfter(newEle,oldEle){
		let nex = this.next(oldEle);
		if(nex){
			oldEle.parentNode.insertBefore(newEle,nex);
			return;
		}
		oldEle.parentNode.appendChild(newEle);
	}
	
	function hasClass(curEle,className){
		let reg = new RegExp("(^| +)"+className+"($| +)");
		return reg.test(curEle.className);
	}
	
	function addClass(curEle,className){
		let ary = className.split(/ +/g);
		for(let i = 0;i<ary.length;i++){
			let curName = ary[i];
			if(!this.hasClass(curEle.className)){
				curEle.className +=' ' + curName;
			}
		}
	}
	
	function removeClass(curEle,className){
		let ary = className.split(/ +/g);
		for(let i = 0;i<ary.length;i++){
			let curName = ary[i];
			if(this.hasClass(curEle,className)){
				let reg = new RegExp("(^| +)"+curName+"( +|$)");
				className.replace(reg,' ');
			}
		}
	}
	
	return {
		setCss:setCss,
		getCss:getCss,
		win:win,
		offset:offset,
		children:children,
		prev:prev,
		next:next,
		prevAll:prevAll,
		nextAll:nextAll,
		sibling:sibling,
		siblings:siblings,
		index:index,
		firstChild:firstChild,
		lastChild:lastChild,
		append:append,
		prepend:prepend,
		insertBefore:insertBefore,
		insertAfter:insertAfter,
		hasClass:hasClass,
		addClass:addClass,
		removeClass:removeClass
	};
})()