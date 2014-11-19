var WadeUtil = {
	
	rowIndex : 0,
		
	callSvc : function(areaids, listener, params, partids, sucfn, errfn,
			contents) {
		var currentPage = 0;
		// var countPage = 0;
		var pageSize = 5;
		var needCount = false;
		if(null != areaids){
			// 得到areaids的参数
			areasArray = areaids.split(',');
			for (var i = 0; i < areasArray.length; i++) {
				// 得到节点下属(WADE)元素
				var elements = $("#" + areasArray[i] + " .WADE_CLASS_PARAM");
				for (var j = 0; j < elements.length; j++) {
					params.add(elements[j].id, elements[j].value);
				}
			}
		}
		
		
		// 查询跟新区域是否有分页,如有需要添加分页
		if(null != partids){
			partsArray = partids.split(',');
			for (var i = 0; i < partsArray.length; i++) {
				if ($("#" + partsArray[i] + " .WADE_Page").length > 0) {
					pageSize 	= $("#" + partsArray[i] + " .WADE_Page").attr("pagesize");
					if(0 != $(event.target).parents(".WADE_Page").length) {
						currentPage = $("#" + partsArray[i] + " .WADE_Page [name=current]")[0].innerHTML;
					} else {
						currentPage = 1;
					}
					params.add("PAGE_SIZE", pageSize);
					params.add("PAGE_NUM", currentPage);//== 0 ? "1" : currentPage
					break;
				}
			}
		}
		
		

		// 调用mobile框架访问Ajax
		Common.callSvcForPC(listener, params, function(dataset) {
			// 正常处理
			if ($.isFunction(sucfn)) {
				sucfn(dataset);
			}
			// 更新partids区域值

			// 处理页面区域
			for (var i = 0; i < partsArray.length; i++) {
				
//				var eles = $("[class*=WADE_]");
//				var jk = null;
//				for(var i = 0, jk=$(eles[i]); i < eles.length; i++, jk=jk.next()) {
////					switch(jk.hasClass("WADE_Foreach")) {
////					case 1:break//WADE_Foreach元素
////					WadeUtil.ForeachParser(partsArray[i]);
////					}
//					if(jk.hasClass("WADE_Foreach")) {
//						//WADE_Foreach元素
//						WadeUtil.ForeachParser(partsArray[i]);
//					} else if(jk.hasClass("WADE_Foreach")){
//						
//					}
//					
//					
//						
//					}
//					
//					if(typeof(jk.attr("wadevalue")) != "undefined") {
//						
//					}
//				}
				
				
				
				//WADE_Foreach元素
				WadeUtil.ForeachParser(partsArray[i]);
				WadeUtil.PAGEParser(partsArray[i], dataset.get("0"));
				//WADE_TABLE
				if($("#" + partsArray[i] + " .WADE_TABLE").length > 0) {
					$("#" + partsArray[i] + " .WADE_TABLE tr").click(function(){
						//$(this).onClick();
						//var k = $(this);
		                //alert("tr行："+$(this).attr("rowIndex"));
		                //WadeUtil.OGNLParser($(this).attr("source"));
		            });
				}
				//WADE_Insert
				WadeUtil.INSERTParser(partsArray[i]);
				
			}
			//console.log(dataset);
			if (dataset && dataset.get(0)) {
				for (var i = 0; i < dataset.length; i++) { // 处理分页
					tmp = dataset.get(i);

				}
			}
		}, function(x_code, x_info) {
			// 异常处理
			if ($.isFunction(errfn)) {
				errfn(x_code + ":" + x_info);
			}
		});
	},
	
	WADECHECK : function(str) {
		var pattern = new RegExp("^WADE_:.*");
		if(pattern.test(str)){
			try {
				return eval(str.replace("ognl:",""));
			} catch(exception) {
				return str;
		    };
		} else {
			return str;
		}
	},
	
	/**
	 * 解析OGNL
	 * @param str
	 * @param contents
	 */
	OGNLParser : function(str) {
		var pattern = new RegExp("^ognl:.*");
		if(pattern.test(str)){
			try {
				return eval(str.replace("ognl:",""));
			} catch(exception) {
				return "";
		    };
		} else {
			return "";
		}
	},
	
	/**
	 * 解析WADE_Foreach
	 * @param partId
	 */
	ForeachParser : function(partId) {
		var trs = $("#" + partId + " .WADE_Foreach");//得到区域内所有需循环组件
		if(trs.length > 0) {
			var tr = trs.first();
			for(var j = 0; j < trs.length;j++,tr=$(trs[j])) {
				//清除以前遗留
				tr.nextAll().remove();
				if(sourceDatas = WadeUtil.OGNLParser(tr.attr("source"))) {
					for(var k = sourceDatas.length-1; k >= 0; k--) {//数据集行数
						if(sourceDatas.get('0').length <= 3){
							break;
						}
						var newTr = tr.clone(false);//复制模板
						newTr.removeClass("WADE_Foreach");
						newTr.attr("style","");
						rowIndex = k;
						var tds = newTr.find(".WADE_Table_Insert");
						var td = tds.first();
						for(var l = 0; l < tds.length; l++, td=$(tds[l])) {
							td.text(WadeUtil.OGNLParser(td.attr("wadevalue")));
						}
						//newTr.attr("index", sourceDatas.length - rowIndex-1);
						$(tr).first().after(newTr);//添加元素
					}
				}
				//tr.remove();//删除元素
				$(tr).attr("style","display:none");//隐藏元素
			}
		}
	},
	
	/**
	 * 解析WADE_Page
	 * @param partId
	 */
	PAGEParser : function(partId, data) {
		params = new Wade.DataMap();
		if ($("#" + partId + " .WADE_Page").length > 0) {
			$("#" + partId + " .WADE_Page [name=current]").text(data.get("P_CURRENT","0"));
			$("#" + partId + " .WADE_Page [name=count]").text(Math.ceil(data.get("P_COUNT","0") / data.get("P_PAGESIZE","1")));
		}
		PageUtil.changeIco($("#" + partId + " .WADE_Page [name=current]").text(), $("#" + partId + " .WADE_Page [name=count]").text(), $("#" + partId + " .WADE_Page"));
	},
	/**
	 * 解析WADE_Insert
	 * @param partId
	 */
	INSERTParser : function(partId) {
		var es = $("#"+partId).find(".WADE_Insert");
		for(var i = 0 ; i < es.length; i++) {
			if($(es[i]).attr("tagName") === "INPUT") {
				$(es[i]).attr('value',WadeUtil.OGNLParser($(es[i]).attr("wadevalue")));
			} else {
				$(es[i]).text(WadeUtil.OGNLParser($(es[i]).attr("wadevalue")));
			}
		}
	},
	
	
	
	gotoPre : function() {
		//判断是否是第一页(改变图标)
		//发送请求跳转至第一页
		//改变图标状态
	},
	
	gotoNext : function() {
		//判断是否是最后一页(改变图标)
		if($("#WADE_PAGE_CTRL .WADE_Page #current").text()+1 < parseInt($("#WADE_PAGE_CTRL .WADE_Page #current").text())) {
			//$("#WADE_PAGE_CTRL .WADE_Page #current").text($("#WADE_PAGE_CTRL .WADE_Page #current").text() + 1);
			eval($("#WADE_PAGE_CTRL").attr('onchange'));
		} else {
			
		}
		//发送请求跳转至下一页
		//改变图标
	},
	
	gotoEnd : function() {
		//判断是否是最后一页(改变图标)
		//跳转至最后一页
		//改变突变
	},
};


var PageUtil = {
	
		GoPre : function(obj) {
			var current = parseInt($(obj).find("[name='current']").text());
			var count = parseInt($(obj).find("[name='count']").text());
			if(current - 1 > 0) {//可以翻页
				$(obj).find("[name='current']").text(parseInt($(obj).find("[name='current']").text()) - 1);
				eval($(obj).attr('pagechange'));
				current -= 1;
			}
			PageUtil.changeIco(current, count, obj);
			
		},
		
		GoNext : function(obj) {
			//判断是否是最后一页
			var current = parseInt($(obj).find("[name='current']").text());
			var count = parseInt($(obj).find("[name='count']").text());
			if(current + 1 <= count) {//可以翻页
				$(obj).find("[name='current']").text(parseInt($(obj).find("[name='current']").text()) + 1);
				eval($(obj).attr('pagechange'));//$("#WADE_PAGE_CTRL").attr('pagechange')
				current += 1;
			}
			PageUtil.changeIco(current, count, obj);
		},
		
		GoLast : function(obj) {
			//判断是否是最后一页
			var current = parseInt($(obj).find("[name='current']").text());
			var count = parseInt($(obj).find("[name='count']").text());
			if(current < count) {//可以翻页
				$(obj).find("[name='current']").text(count);
				eval($(obj).attr('pagechange'));
			}
			PageUtil.changeIco(count, count, obj);
		},
		
		GoFirst : function(obj) {
			//判断是否是第一页
			var current = parseInt($(obj).find("[name='current']").text());
			var count = parseInt($(obj).find("[name='count']").text());
			if(current > 0) {//可以翻页
				$(obj).find("[name='current']").text(1);
				eval($(obj).attr('pagechange'));
			}
			PageUtil.changeIco(1, count, obj);
		},
		
		GoDirect : function(obj) {
			//判断是否是数字
			var current = $(obj).find('.P_DIRECT_NUM').val();
			var count = parseInt($(obj).find("[name='count']").text());
			//判断current是否是数字
			if(current > 0 && current <= count) {//可以翻页
				$(obj).find("[name='current']").text(current);
				eval($(obj).attr('pagechange'));
				PageUtil.changeIco(current, count, obj);
			}else {
				alert('请输入范围内数字');
			}
		},
		
		changeIco : function(current, count, obj){
			if(obj.length==0)
				return;
			if(current > 1) {//可前翻
				$(obj).find(".first").removeClass("e_dis");
				$(obj).find(".pre").removeClass("e_dis");
			} else {
				$(obj).find(".first").addClass("e_dis");
				$(obj).find(".pre").addClass("e_dis");
			}
			if(current >= count) {
				$(obj).find(".next").addClass("e_dis");
				$(obj).find(".last").addClass("e_dis");
			} else {
				$(obj).find(".next").removeClass("e_dis");
				$(obj).find(".last").removeClass("e_dis");
			}
		}
};