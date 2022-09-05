function CreateHeaders(base) {

	this.base = base;
	this.init();
}
CreateHeaders.prototype = {

	init: function() {
		var _this = this;
	},
	config: function() {

		return {
			id: "hc_headres_editor",
			caption: "見出し",
			css: {
				width: "600px",
				height: "320px"
			}
		}
	},
	loaded: function($modal, param) {

		var _this = this;

		preview($modal);
		$modal.on("change", ".headers", function() {
			preview($modal);
		});

		$modal.on("change keyup", ".text", function() {
			preview($modal);
		});

		function preview($modal) {

			$modal.find(".hc_preview").html(_this.setTag(_this.getFormParam($modal)));
		}
	},
	getTag: function($modal) {

		var _this = this;
		return _this.setTag(_this.getFormParam($modal));
	},
	setTag: function(param) {

		return `<${param.headers} class="hc_headers hc_headers_${param.headers}">${param.text}</${param.headers}>`;
	},
	getFormParam: function($dom) {

		var _this = this;
		var headers = $dom.find(".headers").val();
		var text = $dom.find(".text").val();
		return {
			headers: headers,
			text: (text != "") ? text : "見出し",
		}
	},
	getParam: function(dom) {

		return {
			headers: $(dom).prop("nodeName").toLowerCase(),
			text: $(dom).html()
		};
	}
}