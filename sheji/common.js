

$(window).on("load resize", function(){
	var footer = $("#footer"),
	docHeight = $(document).height(),
	bodyHeight = $(document.body).height();
	if( bodyHeight < docHeight){
		var oldTop = parseInt(footer.css("margin-top"));
		footer.css("margin-top", docHeight - bodyHeight + oldTop + "px");
	}
});


$(function(){
	var nav = $("#nav");
	/*
	$(window).resize(function(){
		if( document.documentElement.offsetWidth < 1200 ){
			nav.css("width","215px");
		}else{
			nav.css("width","315px");
		}
	});*/

	$("textarea, input[type=text]").focus(function(){
		if( this.value == this.defaultValue ){
			this.value = "";
		}
	}).blur(function(){
		if( this.value == "" ){
			this.value =  this.defaultValue;
		}
	});

	$("span.checkbox").click(function(){
		$(this).toggleClass("selected");
	});
});


$(function(){
	var content = $("#guestbook-content"),
		vcodeImg = $("#guestbook-vcode-img"),
		vcode = $("#guestbook-vcode"),
		name = $("#guestbook-name"),
		email = $("#guestbook-email"),
		status = $("#guestbook-status"),
		editor = typeof Editor == 'function' ? new Editor(document.getElementById('guestbook-content')) : null;

	function getVcode(){
		vcodeImg.get(0).src = "/actions/vcode.php?c=" + Math.random();
	}

	name.focus(function(){
		getVcode();
		vcode.show( 1000 );
		vcodeImg.show( 1000 );
	});

	content.focus(function(){
		status.html("");
		$(this).animate({height:"160px"});

	}).blur(function(){
		$(this).animate({height:"60px"});

	})
	.on("change blur keyup", function(){
		if( this.value.length > 280 ){
			this.value = this.value.slice(0, 280);
		}
	});

	vcode.one("focus", function(){
		this.value = "";
	});

	vcodeImg.click(getVcode);

	$("#guestbook-submit").click(function(){
		var data = {
			name: name.val(),
			email: email.val(),
			content: content.val(),
			vcode: vcode.val(),
			sid: __sid
		}

		if( data.email == "" ){
			email.focus();
			status.html("邮箱不能为空！").addClass("error");
			return;
		}

		if( !/^[a-z0-9][\w.]*@(?:\w+\.)+[a-z]+$/i.test(data.email)){
			status.html("邮箱格式不正确！").addClass("error");
			return;
		}

		if( data.name == "" ){
			name.focus();
			status.html("昵称不能为空！").addClass("error");
			return;
		}

		if( !/^(?:[\u4e00-\u9fa5]+|[a-z]\w+)$/.test(data.name) ){
			name.focus();
			status.html("你的昵称有点奇怪！").addClass("error");
			return;
		}

		if( data.content == "" ){
			content.focus();
			status.html("内容不能为空！").addClass("error");
			return;
		}

		if( data.vcode == "" || data.vcode == vcode.get(0).defaultValue){
			vcode.focus();
			status.html("验证码不能为空！").addClass("error");
			return;
		}

		status.html("").removeClass("error");
		$.post( "/actions/guestbook.php?action=post", data,
		function(data){
			switch( data ){
				case '0':
					status.html("评论发表成功！").addClass("success").removeClass("error");
					setTimeout(function(){
						status.html("").removeClass("success");
					}, 3000);
					content.val("");
					editor && editor.clear();
					getposts();
				break;

				case '1':
					status.html("验证码错误！").addClass("error");
				break;

				default:
					status.html("发布失败！").addClass("error");
			}
			getVcode();
			vcode.val("");
		});
	});

	var postsbox = $("#guestbook-posts"), postsNumber = $("#guestbook-posts-number");

	postsbox.on('mousedown', 'a', function(){
		this.target = '_blank';
	});

	getposts();
	function encode(str){
		return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}
	function getposts(){
		$.get("/actions/guestbook.php?action=get&sid=" + __sid, function(data){
			postsNumber.html( data.length );
			postsbox.find("dd").remove();
			for(var item, date = new Date(), time; item = data.shift();){
				date.setTime(item.time * 1000);
				time = date.getFullYear() + "-" + (date.getMonth()+ 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
				postsbox.append($("<dd><span class='name'>" + encode(item.name) + "：</span>" +  encode(item.content) + " <span class='time'>" + time + "</span></dd>"));
			}
		}, "json");
	}

});

$(function(){
  function checkflash(){
    if(navigator.plugins['Shockwave Flash'] ){
      return true;
    }
    try{
      return !!new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
    }catch(e){}
    return false;
  }

  if( checkflash() === false ){
    $('#objectID-0').remove();
  }
});
