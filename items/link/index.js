function CreateLink(base) {

	this.base = base;
	this.init();
}
CreateLink.prototype = {

	init: function() {
		var _this = this;
	},
	config: function() {

		return {
			id: "hc_link_editor",
			caption: "リンク",
			css: {
				width: "500px",
				height: "280px"
			},
			// 画像選択[プラグイン使用]
			selectImage: function(_target) {

				var url = $(_target).find("img").attr("src");
				url = (url === undefined) ? "" : url;

				$(_target).fileUploader({
					datas: {
						word: "pdf",
						url: url
					},
					selectLabel: "<span>選択</span>",
					selectMessage: "",
					onFileSelected: function(_fu, $obj, datas) {

						$(".href").val(datas.files_url + datas.file);
						$(".href").trigger("change");
						$obj.dialog("close");
					}
				});
			}
		}
	},
	loaded: function($modal) {
		var _this = this;

		$("#fileuploader").on("click", function() {

			_this.config().selectImage(this);
		});
	},
	getTag: function($modal) {

		var _this = this;
		var ret = _this.checkTag($modal);

		if (!ret.result) {
			alert(ret.msg);
			return;

		} else {

			return _this.setTag(_this.getFormParam($modal));
		}
	},
	setTag: function(param) {

		return `<a href="${param.attrs.href}" target="${param.attrs.target}" data-url="${param.attrs.href}" class="hc_link" data-time="dt${Date.now()}">${param.text}</a>`;
	},
	checkTag: function($dom) {

		var _this = this;
		var ret = {
			result: true,
			msg: "",
		}

		$dom.find(".-validation").each(function(i, dom) {

			ret = _this.base.preg_match($(dom));
			if (!ret.result) { return false; }
		});
		return ret;
	},
	getFormParam: function ($dom) {

		var _this = this;

		var text = $dom.find(".text").val();
		var href = $dom.find(".href").val();
		var target = $dom.find(".target").val();

		return {
			attrs: {
				class: "hc_link",
				href: href,
				target: target
			},
			text: text
		}
	},
	getParam: function(dom) {

		return {
			target: $(dom).attr("target"),
			href: $(dom).attr("href"),
			text: $(dom).text()
		};
	}
}