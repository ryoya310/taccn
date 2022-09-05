function CreateColor(base) {

	this.base = base;
	this.init();
}
CreateColor.prototype = {

	init: function() {

		var _this = this;
		$.getScript(`${_this.base.rootPath}assets/js/jquery.selectcolor.js`);
	},
	config: function() {

		return {
			id: "hc_color_editor",
			caption: "色選択",
			css: {
				width: "450px",
				height: "270px"
			}
		}
	},
	loaded: function($modal) {

		var _this = this;

		$("#hc_color_editor").SELECTCOLOR({
			root: _this.base.rootPath,
			property: "background-color",
			doSelect: function(color) {}
		});
	},
	getTag: function($modal) {

		var _this = this;
		console.log($modal)
		var color = $modal.find(".colorPreview").attr("color");
		var alpha = $modal.find(".colorPreview").attr("alpha");

		var text = $modal.find(".text").val();

		return _this.setTag({
			attrs: {
				color: color + alpha,
				property: "background-color"
			},
			text: (text != "") ? text : "テキスト"
		});
	},
	setTag: function(param) {

		return `<span style="${param.attrs.property}:${param.attrs.color}">${param.text}</span>`;
	}
}