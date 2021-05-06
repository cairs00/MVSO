window.daicuo = {
	file :  function(){
		return $('script[data-id="daicuo"]').attr('data-file');
	}(),
	root :  function(){
		return $('script[data-id="daicuo"]').attr('data-root');
	}(),
	view : function(){
		return $('script[data-id="daicuo"]').attr('data-view');
	}(),
	module : function(){
		return $('script[data-id="daicuo"]').attr('data-module');
	}(),
	controll : function(){
		return $('script[data-id="daicuo"]').attr('data-controll');
	}(),
	action : function(){
		return $('script[data-id="daicuo"]').attr('data-action');
	}(),
	userId : function(){
		return $('script[data-id="daicuo"]').attr('data-userId');
	}(),
	pageIndex : function(){
		return $('script[data-id="daicuo"]').attr('data-pageIndex');
	}(),
	admin : {//后台管理
	},
	fn : {//插件列表
	},
	event : {//事件列表
		click : function(){
			daicuo.page.click();
		},
		scroll : function(){
			daicuo.page.scroll();
		}
	},
	carousel : {//轮播
		nav : function($target){
			$target = $target || '[data-toggle="carousel"]';//if ($target === undefined)
			daicuo.carousel.ajax(function(){
				$($target).each(function(i){
					$index = $(this).find('.active').index()*1;
					if($index > 3){
						$index = $index-3;
					}else{
						$index = 0;
					}
					$(this).flickity({
						initialIndex: $index,
						freeScroll: true,
						cellAlign: "left",
						resize: true,
						contain: true,
						lazyLoad: true,
						prevNextButtons: false,
						pageDots: false
					});
				});				
			});
		},
		resize : function($target){//resize
			$target = $target || '[data-toggle="carousel"]';
			if(daicuo.carousel.ajaxEnd){
				$($target).flickity('resize');
			}
		},
		ajaxEnd : false,//JS是否加载完成
		ajax : function($callback){
			//动态插入CSS
			if( !daicuo.carousel.ajaxEnd ){
				$("<link>").attr({
					rel: "stylesheet",
					type: "text/css",
					href: "//lib.baomitu.com/flickity/2.2.0/flickity.min.css"
				}).appendTo("head");
			}
			//动态加载JS
			$.ajaxSetup({
				cache: true
			});			
			$.getScript("//lib.baomitu.com/flickity/2.2.0/flickity.pkgd.min.js", function(data, status, jqxhr) {
				daicuo.carousel.ajaxEnd = true;
				if( typeof($callback) == "function"){
					$callback();
				}
			});
		}
	},	
	lazyload : {//延迟加载
		image : function(){//初始图片
			daicuo.lazyload.ajax(function(){
				$("img[data-original]").lazyload({
					placeholder : daicuo.root+"public/images/grey.gif",
					effect : "fadeIn",
					failurelimit: 10
					//threshold : 400
					//skip_invisible : false
					//container: $(".carousel-inner"),
				});
			});
		},
		dom : function($target){//dom操作
			if(daicuo.lazyload.ajaxEnd){
				$($target+' img[data-original]').lazyload();
			}
		},
		ajaxEnd : false,//JS是否加载完成
		ajax : function($callback){
			$.ajaxSetup({
				cache: true
			});
			$.getScript("//lib.baomitu.com/jquery.lazyload/1.9.1/jquery.lazyload.min.js", function(data, status, jqxhr) {
				daicuo.lazyload.ajaxEnd = true;
				if( typeof($callback) == "function"){
					$callback();
				}
			});
		}
	},
	language : {//简繁转换API
		type : 's2t',
		s2t : function($target){//简转繁
			if($target == undefined){
				$target = document.body;
			}
			if(daicuo.browser.language=='zh-hk' || daicuo.browser.language=='zh-tw'){
				daicuo.language.type = 's2t';
				daicuo.language.ajax(function(){
					$($target).s2t();
				});
			}
		},
		t2s : function($target){//繁转简
			if($target == undefined){
				$target = document.body;
			}
			if(daicuo.browser.language=='zh-cn'){
				daicuo.language.type = 't2s';
				daicuo.language.ajax(function(){
					$($target).t2s();
				});
			}
		},
		dom : function($target){//Dom更新后需重新激活
			if(daicuo.language.ajaxEnd){
				if(daicuo.language.type == 's2t'){
					if(daicuo.browser.language=='zh-hk' || daicuo.browser.language=='zh-tw'){
						$($target).s2t();
					}
				}else{
					if(daicuo.browser.language=='zh-cn'){
						$($target).t2s();
					}
				}
			}
		},
		ajaxEnd : false,//JS是否加载完成
		ajax : function($callback){
			$.ajaxSetup({
				cache: true
			});			
			$.getScript("//cdn.daicuo.cc/jquery.s2t/0.1.0/s2t.min.js", function(data, status, jqxhr) {
				daicuo.language.ajaxEnd = true;
				if( typeof($callback) == "function"){
					$callback();
				}
			});
		}
	},
	page : {//AJAX翻页
		locked : false,
		click : function($callback){
			$(document).on("click", '[data-toggle="pageClick"],[data-pageClick]', function(){
				if(daicuo.page.locked == false){
					daicuo.page.ajax($(this), $(this).attr('data-url'), $(this).attr('data-page')*1+1, $(this).attr('data-target'), $callback);
				}
			});
		},
		scroll : function($callback){
			$obj = $('[data-toggle="pageScroll"],[data-pageScroll]').eq(0);
			if($obj.length){
				$(window).bind("scroll", function(){
					if( daicuo.page.locked == false && ($(this).scrollTop() + $(window).height()) >= $(document).height() ){
						daicuo.page.ajax($obj, $obj.attr('data-url'), $obj.attr('data-page')*1+1, $obj.attr('data-target'), $callback);
					}
				});
			}
		},
		ajax : function($event, $url, $page, $target, $callback){
			$html = $event.html();
			$(document).ajaxStart(function(){
				daicuo.page.locked = true;
				$event.html(DCLANG.loading);
			});
			$.get($url+$page, function($data){
				daicuo.page.locked = false;
				$event.html($html);
				if($data){
					$($target).append($data);
					$event.attr("data-page", $page);
					//window.history.pushState(null, null, $url+$page);
					//图片懒加载
					daicuo.lazyload.dom($target);
					//是否简繁转化
					daicuo.language.dom($target);
					//回调事件
					if( typeof($callback) == "function"){
						$callback($event, $url, $page, $target, $data);
					}
				}else{
					$event.remove();
					$event.unbind("click");
				}
			});
		}
	},
	json : {//json格式化
		beauty : function(){//美化
			$('[data-toggle="json"]').each(function(){
				var jsonText = $(this).val();
				$(this).val(JSON.stringify(JSON.parse(jsonText), null, 4));
			});
		},
		ugly : function(){//丑化
			$('[data-toggle="json"]').each(function(){
				var jsonText = $(this).val();
				$(this).val(JSON.stringify(JSON.parse(jsonText)));
			});
		}
	},
	console: {//调试
		obj : function(obj){
			$.each(obj, function(key, val) {
				console.log(key);//alert(obj[key]);
			});
		}
	},	
	browser : {
		'url': document.URL,
		'domain': document.domain,
		'title': document.title,
		'language': (navigator.browserLanguage || navigator.language).toLowerCase(),//zh-tw|zh-hk|zh-cn
		'canvas' : function(){
			return !!document.createElement('canvas').getContext;
		}()
	},
	useragent : function(){
		var ua = navigator.userAgent;//navigator.appVersion
		return {
			'language': (navigator.browserLanguage || navigator.language).toLowerCase(),//zh-tw|zh-hk|zh-cn
			'mobile': !!ua.match(/AppleWebKit.*Mobile.*/), //是否为移动终端 
			'ios': !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
			'android': ua.indexOf('Android') > -1 || ua.indexOf('Linux') > -1, //android终端或者uc浏览器 
			'iPhone': ua.indexOf('iPhone') > -1 || ua.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器 
			'iPad': ua.indexOf('iPad') > -1, //是否iPad
			'trident': ua.indexOf('Trident') > -1, //IE内核
			'presto': ua.indexOf('Presto') > -1, //opera内核
			'webKit': ua.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
			'gecko': ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') == -1, //火狐内核 
			'weixin': ua.indexOf('MicroMessenger') > -1 //是否微信 ua.match(/MicroMessenger/i) == "micromessenger",		
		};
	}()
};