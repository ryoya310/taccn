function CreateEmbed(base) {

	this.base = base;
	this.init();
}
CreateEmbed.prototype = {

	init: function() {
		var _this = this;
	},
	config: function() {

		return {
			id: "hc_embed_editor",
			caption: "埋込",
			css: {
				width: "715px",
				height: "735px"
			}
		}
	},
	loaded: function($modal, param) {

		var _this = this;

		preview($modal);
		$modal.on("change keyup", ".html", function() {
			preview($modal);
		});

		$modal.on("change", ".css", function() {
			preview($modal);
		});

		function preview($modal) {

			$modal.find(".hc_preview > style").html(_this.getFormParam($modal).css);
			$modal.find(".hc_preview > span").html(_this.getFormParam($modal).html);
		}
	},
	getTag: function($modal) {

		var _this = this;
		return _this.setTag(_this.getFormParam($modal));
	},
	setTag: function(param) {

		return `<p class="${param.attrs.class}"><style>${param.css}</style><span>${param.html}</span></p>`;
	},
	getFormParam: function ($dom) {

		var _this = this;
		var embed_html = $dom.find(".html").val();
		var embed_css = $dom.find(".css").val();
		return {
			attrs: {
				class: "hc_embed",
			},
			html: embed_html,
			css: embed_css,
		}
	},
	getParam: function(dom) {

		return {
			html: $(dom).find("span").html(),
			css: $(dom).find("style").html()
		};
	}
}