function CreateHorizon(base) {

	this.base = base;
	this.init();
}
CreateHorizon.prototype = {

	init: function() {
		var _this = this;
	},
	config: function() {

		var _this = this;

		return {
			id: "hc_horizon_editor",
			caption: "横組み",
			css: {
				width: "1000px",
				height: "800px"
			},
			box: 1,
			initViews: {
				pattern: "cross",
				text: "scroll"
			},
			initParams: {
				src: "",
				caption: "タイトル",
				textarea: "",
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

						var dom = _this.setImage(datas.files_url + datas.file, true)
						$(_target).replaceWith(dom);

						$obj.dialog("close");
					}
				});
			}
		}
	},
	loaded: function($modal, param) {

		var _this = this;

		// 初期表示
		if (Object.keys(param).length < 1) {

			Object.keys(_this.config().initViews).forEach(function(key) {

				var views = _this.config().initViews;
				$(".hc_horizon").addClass("-" + views[key]);

				if (key == "text") {
					$(".viewText").find(`option[value="${views[key]}"]`).attr("selected", "selected");
				} else if (key == "pattern") {
					$(".viewPattern").find(`option[value="${views[key]}"]`).attr("selected", "selected");
				}
			});

			for (var i = 0; i < _this.config().box; i++) {
				var arr = {}
				arr[i] = _this.config().initParams;
				var dom = _this.setTag(arr, true);
				$(".hc_horizon").append(dom);
			}

		} else {

			var views = param.views;
			views = views.split(" ");
			views.forEach(cl => {
				if (cl != "" && cl != "hc_horizon") {
					$(".hc_horizon").addClass(cl);
				}
				$("select").find(`option[value="${cl.replace(/-/g, "")}"]`).attr("selected", "selected");
			});
			var dom = _this.setTag(param.params, true);
			$(".hc_horizon").append(dom);
		}

		// ソート有効
		$(".hc_horizon").sortable({
			axis: "y"
		});

		// 追加
		$(".-add").off("click");
		$(".-add").on("click", function() {

			var arr = {}
			arr[0] = _this.config().initParams;
			var dom = _this.setTag(arr, true);
			$(".hc_horizon").append(dom);
		});

		// 画像選択
		$(".hc_horizon").on("click", ".hc_horizon_image", function() {

			_this.config().selectImage(this);
		});

		// 配置変更
		$(".hc_horizon_form").on("change", ".viewPattern", function() {

			var options = ["left", "cross", "right"];
			options.forEach(el => {
				$(".hc_horizon").removeClass("-" + el);
			});
			$(".hc_horizon").addClass("-" + $(this).val());
		});

		// テキスト表示切替
		$(".hc_horizon_form").on("change", ".viewText", function() {

			var options = ["all", "scroll"];
			options.forEach(el => {
				$(".hc_horizon").removeClass("-" + el);
			});
			$(".hc_horizon").addClass("-" + $(this).val());
		});

		// 削除
		$(".hc_horizon").on("click", ".-del", function() {

			if ($(".hc_horizon").find(".-item").length <= 1) { return; }
			$(this).parents(".-item").remove();
		});
	},
	setImage: function(src, editble) {

		var _this = this;
		var dom = "";

		if (editble) {

			dom += `<div class="hc_horizon_image">`;

			if (src) {

				dom +=`<img src="${src}" alt="hc_horizon_items" width="200" height="200" loading="lazy">`;
			} else {

				dom += `<div class="-select">`;
				dom += `<svg><use href="${_this.base.rootPath}assets/images/defs.svg#image"></use></svg>`;
				dom += `<span>No Image</span>`;
				dom += `</div>`;
			}
			dom += `</div>`;

		} else {

			if (src) {
				dom += `<div class="hc_horizon_image">`;
				dom +=`<img src="${src}" alt="hc_horizon_items" width="200" height="200" loading="lazy">`;
				dom += `</div>`;
			}
		}
		return dom;
	},
	setCaption: function(caption, editble) {

		var _this = this;
		var dom = "";
		if (editble) {
			dom += `<div class="hc_horizon_caption">`;
			dom += `<input type="text" class="caption" value="${caption}">`;
			dom += `</div>`;
		} else {

			if (caption) {
				dom += `<div class="hc_horizon_caption">`;
				dom += `${caption}`;
				dom += `</div>`;
			}
		}
		return dom;
	},
	setTextArea: function(textarea, editble) {

		var _this = this;
		var dom = "";
		if (editble) {
			dom += `<div class="hc_horizon_text">`;
			dom += `<textarea class="textarea" rows="8">${textarea}</textarea>`;
			dom += `</div>`;
		} else {
			if (textarea) {
				dom += `<div class="hc_horizon_text">`;
				dom += `${textarea}`;
				dom += `</div>`;
			}
		}
		return dom;
	},
	getTag: function($modal) {

		var _this = this;
		var views = _this.getParam($modal[0]).views;
		var param = _this.getParam($modal[0]).params;
		var tag = `<div class="${views}">`;
		tag += _this.setTag(param, false);
		tag += `</div>`;

		return tag;
	},
	setTag: function(param, editble) {

		var _this = this;

		var dom = "";
		Object.keys(param).forEach(function(key) {

			dom += `<div class="-item">`;
			if (editble) {
				dom += `<button type="button" class="-del"><svg><use href="${_this.base.rootPath}assets/images/defs.svg#iconClose"></use></svg></button>`;
			}
			dom += _this.setImage(param[key]["src"], editble)
			dom += `<div class="hc_horizon_infos">`;
			dom += _this.setCaption(param[key]["caption"], editble)
			dom += _this.setTextArea(param[key]["textarea"], editble)
			dom += `</div>`;
			dom += `</div>`;
		});


		return dom;
	},
	getParam: function(dom) {

		var _this = this;
		var response = {
			views: {},
			params: {}
		};

		if ($(dom).attr("id") != _this.config().id) {
			response["views"] = $(dom)[0].className;
		} else {
			response["views"] = $(dom).find(".hc_horizon")[0].className.replace(/ui-sortable/ig, "");
		}

		$(dom).find(".-item").each(function(i, item) {

			// 編集画面

			var src = ($(item).find(".hc_horizon_image img").attr("src") !== undefined) ? $(item).find(".hc_horizon_image img").attr("src") : "";
			var caption = ($(item).find(".hc_horizon_infos .caption").val() !== undefined) ? $(item).find(".hc_horizon_infos .caption").val() : "";
			var textarea = ($(item).find(".hc_horizon_infos .textarea").val() !== undefined) ? $(item).find(".hc_horizon_infos .textarea").val() : "";
			textarea = textarea.replace(/\n/g, "<br>");

			if ($(dom).attr("id") != _this.config().id) {

				caption = ($(item).find(".hc_horizon_caption").html() !== undefined) ? $(item).find(".hc_horizon_caption").html() : "";
				textarea = ($(item).find(".hc_horizon_text").html() !== undefined) ? $(item).find(".hc_horizon_text").html() : "";
				textarea = textarea.replace(/<br>/g, "\n");
			}
			var params = {
				src: src,
				caption: caption,
				textarea: textarea
			}
			if (params.caption != "" || params.textarea != "") {
				response["params"][i] = params;
			}
		});
		return response;
	}
}