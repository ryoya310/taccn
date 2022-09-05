function CreateImage(base) {

	this.base = base;
	this.init();
}
CreateImage.prototype = {

	init: function() {
		var _this = this;
	},
	config: function() {

		return {
			id: "hc_image_editor",
			caption: "画像",
			css: {
				width: "715px",
				height: "435px"
			},
			// 画像選択[プラグイン使用]
			selectImage: function(_target) {

				var url = $(_target).find("img").attr("src");
				url = (url === undefined) ? "" : url;

				$(_target).fileUploader({
					datas: {
						url: url
					},
					selectLabel: "<span>選択</span>",
					selectMessage: "",
					onFileSelected: function(_fu, $obj, datas) {

						$(".image_url .src").val(datas.files_url + datas.file);
						$(".image_url .src").trigger("change");
						$obj.dialog("close");
					}
				});
			}
		}
	},
	loaded: function($modal, param) {
		var _this = this;

		preview($modal);
		$modal.on("change", 'input[type="text"]', function() {
			preview($modal);
		});

		function preview($modal) {

			$modal.find(".hc_preview").html(_this.setTag(_this.getFormParam($modal)));
		}

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

		return `<img src="${param.attrs.src}" alt="${param.attrs.alt}" class="${param.attrs.class}" width="${param.attrs.width}" height="${param.attrs.height}" loading="lazy">`;
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

		var src = $dom.find(".src").val();
		var width = $dom.find(".width").val();
		var height = $dom.find(".height").val();
		var alt = $dom.find(".alt").val();
		var addClass = $dom.find(".class").val();

		return {
			attrs: {
				class: "hc_image " + addClass,
				src: src,
				width: width,
				height: height,
				alt: alt
			}
		}
	},
	getParam: function(dom) {

		return {
			src: $(dom).attr("src"),
			width: $(dom).attr("width"),
			height: $(dom).attr("height"),
			alt: $(dom).attr("alt"),
			class: $.trim($(dom).attr("class").replace(/hc_image/ig, ""))
		};
	}
}