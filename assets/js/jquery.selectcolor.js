jQuery(function($) {

	var SELECTCOLOR = function($dom, options) {

		this.$dom = $dom;
		this.preview = ".colorPreview";
		this.default = "#000000";

		//初期値
		this.settings = $.extend({
			root : "/",
			color : this.default,
			properdoSelectty: "background-color",
			doSelect: function(color) {}
		}, options);

		this.init();
	}
	SELECTCOLOR.prototype = {

		init: function() {
			var _this = this;

			// カラーコード取得
			$.getJSON(`${_this.settings.root}assets/js/color.json`, (colors) => {

				Object.keys(colors).forEach(function (key) {
					$(".colors").append(`<div><span class="select" color="${colors[key]}" style="background:${colors[key]}"></span></div>`);
				});

				$(".select").off("click");
				$(".select").on("click", function() {

					var color = $(this).attr("color");
					$(_this.preview).attr("color", color);
					_this.setColor(_this.getColor());
				});

				$(".colorCode").off("change");
				$(".colorCode").on("change", function() {
					var color = $(this).val();
					$(_this.preview).attr("color", color);
					_this.setColor(_this.getColor());
				});

				_this.setSlider(100);
			});
		},
		selectColor: function() {

			var _this = this;
			var color = $(_this.preview).attr("color");
			var alpha = $(_this.preview).attr("alpha");
			if (color === undefined || color == "") {
				alert("カラーを選択してください");
				return;
			}
			if (typeof _this.settings.doSelect === "function") {
				_this.settings.doSelect(color + alpha);
			}
		},
		getColor: function() {

			var _this = this;
			var color = $(_this.preview).attr("color");
			var alpha = $(_this.preview).attr("alpha");

			if (color === undefined || color == "") {
				color = _this.settings.color;
			}
			if (alpha === undefined || alpha == "" || alpha == 100) {
				alpha = "";
			}

			return color + alpha;
		},
		setColor: function(color_alpha) {

			var _this = this;

			if (color_alpha == "" && _this.default == "") {
				color_alpha = _this.default;
			}
			var color = color_alpha.substr(0, 7);
			var alpha = color_alpha.substr(7, 8);

			var viewAlpha = alpha;
			var viewSliderAlpha = alpha;
			if (alpha === undefined || alpha == "") {
				alpha = "";
				viewAlpha = 100;
				viewSliderAlpha = 100;
			} else {
				alpha = _this.getDigestNumer(alpha);
			}

			$(_this.preview).attr("color", color);
			$(_this.preview).attr("alpha", alpha);

			$(".selectColorIcon").each(function(i, dom) {
				if ($(dom).attr("color") == color) {
					$(dom).addClass("select");
				}
			})

			//透過度
			$(".colorAlpha p span").html(viewAlpha + "%");
			//色
			$(".colorSelect input").val(color);
			//色preview
			$(_this.preview).css({"background": color + alpha});
			//カラーコード
			$(_this.preview).find("span").html(color + alpha);

			//スライダー初期化
			_this.setSlider(viewSliderAlpha);
		},
		setSlider: function(value) {

			var _this = this;
			//透明度をスライダーで指定
			$(".sliderAlpha").slider({
				animate: "fast",
				create: function(e, ui) {
				},
				slide: function(e, ui) {
					$(_this.preview).attr("alpha", 100 - ui.value);
					_this.setColor(_this.getColor());
				},
				stop: function(e, ui) {
				},
				value:Number(100 - value),
				min:Number(0),
				max:Number(100),
				step:Number(1),
				range:"min",
			});
		},
		getDigestNumer(number, digest) {

			var zero;
			if (digest === undefined) {
				digest = 2;
			}
			for (var i=1;i<=digest;i++) {
				zero += "0";
			}
			return (zero + number).slice("-" + digest);
		},
		getRGB2bgColor: function(r, g, b) {

			r = r.toString(16);
			if (r.length == 1) r = "0" + r;
			g = g.toString(16);
			if (g.length == 1) g = "0" + g;
			b = b.toString(16);
			if (b.length == 1) b = "0" + b;

			return "#" + r + g + b;
		}
	}

	$.fn.SELECTCOLOR = function(options) {
		return new SELECTCOLOR(this, options);
	};
});