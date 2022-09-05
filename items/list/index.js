function CreateList(base) {

	this.base = base;
	this.init();
}
CreateList.prototype = {

	init: function() {
		var _this = this;
	},
	config: function() {

		return {
			id: "hc_list_editor",
			caption: "リスト",
			css: {
				width: "400px",
				height: "600px"
			},
			list: 5
		}
	},
	loaded: function($modal, param) {

		var _this = this;

		var num = _this.config().list;
		if (param.num > 0) {
			num = param.num;
		}

		var li = _this.setList(1, num, param);
		$(".hc_list").append(li);
		$(".hc_list").attr("num", num);

		$(".hc_list").css({"list-style": (param.style) ? param.style : "disc"});
		$('[name=style]').val((param.style) ? param.style : "disc");

		$(".hc_list").sortable({
			axis: "y"
		});

		$('[name=style]').on("change", function() {

			$(".hc_list").css({"list-style": $(this).val()});
		});

		$(".-add").off("click");
		$(".-add").on("click", function() {

			var nm = Number($(".hc_list").attr("num")) + 1;
			var li = _this.setList(nm, nm, {});

			$(".hc_list").append(li);
			$(".hc_list").attr("num", nm);
		});

		$(".hc_list").on("click", ".-del", function() {
			if ($(".-del").parents("li").length <= 1) { return; }
			$(this).parents("li").remove();
		});
	},
	setList: function(s, e, param) {

		var _this = this;
		var li = "";
		for (var i = s; i <= e; i++) {

			var liEval = new Function("a", "b", "var x = a+b; return x;") ("list", i);
			var text = (param[liEval] !== undefined) ? param[liEval] : "";
			li += `<li class="ui_list_li hc_list_li hc_list_li${i}">`;
			li += `<div>`;
			li += `<input type="text" name="hc_list[]" class="hc_list_text" value="${text}">`;
			li += `<button type="button" class="-del"><svg><use href="${_this.base.rootPath}assets/images/defs.svg#iconClose"></use></svg></button>`;
			li += `</div>`;
			li += `</li>`;
		}
		return li;
	},
	getTag: function($modal) {

		var _this = this;
		return _this.setTag({});
	},
	setTag: function(param) {

		var listStyle = $(".hc_list").attr("style");
		if (listStyle === undefined) {
			listStyle = "disc";
		}
		var listClass = "list_" + $('[name=style]').val();

		var li = "";
		var texts = "";
		$(".hc_list .hc_list_text").each(function(i) {
			num = Number(i) + 1;
			li += `<li class="hc_list_li hc_list_li${num}">${$(this).val()}</li>`;
			texts += $(this).val();
		});

		if (texts.replace(/\s+/, "") == "") {
			alert("入力してください。");
			return undefined;
		}

		var html = `<ul class="hc_list ${listClass}" style="${listStyle}">${li}</ul>`;

		return html;
	},
	getParam: function(dom) {

		var datas = {};
		datas.style = $(dom).attr("style").replace(/list-style:(.*);/, "$1").replace(/\s+/, "");
		var len = $(dom).children("li").length;
		datas.num = len;
		for (var l = 1;l <= len; l++) {
			datas["list" + l] = $(dom).find(".hc_list_li" + l).text();
		}
		return datas;
	}
}