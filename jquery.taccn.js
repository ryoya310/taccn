/**
 * ver1.0.0 2022.05
 */
jQuery(function($){

	var TACCN = function($dom, options, mode) {

		//呼び出し元
		var _this = this;
		_this.$dom = $dom;
		_this.mode = mode;
		_this.rootPath = _this.root("jquery.taccn.js") + "/";

		//初期値
		var init_settings = {
			toolbar1: (options.toolbar1) ? options.toolbar1 : ["image", "quote", "column", "table", "list", "horizon", "headers", "link", "unlink", "color", "backcolor", "bold", "italic", "underline", "strike", "fontsize", "embed"],
			toolbar2: (options.toolbar2) ? options.toolbar2 : ["hr", "padding-m", "padding-p", "align-l", "align-c", "align-r", "viewbox", "reset"],
			toolbar3: (options.toolbar3) ? options.toolbar3 : [],
			datas: "", //json or source or string
			height: 400,
			multi: false,
			fileupload: false,
			toolPos: "top",
			tail: true,
			modalAppendTo: "body",
			textAreaLoaded: function(_hc) {},
			changeText: function(_hc, mutation) {},
			keydown: function(_hc, e) {},
			keyup: function(_hc, e) {}
		}

		// 要素名 メソッド内でクラス名を指定したくない
		_this.head = "hc_head";
		_this.body = "hc_body";
		_this.wrapper = "hc_wrapper";
		_this.tool = "hc_tool";
		_this.info = "hc_info";
		_this.contents = "hc_contents";
		_this.editor = "hc_editor";
		_this.file = "hc_file";
		_this.save = "hc_save";
		_this.addsave = "hc_addsave";
		_this.tail = "hc_tail";
		_this.footer = "hc_footer";

		//上書用
		$.getScript(`${_this.rootPath}config.js`).done(function() {

			_this.settings = $.extend(true, init_settings, set_extend, options);

			_this.doms_br_tags = new RegExp("^(div|blockquote|table|ul|img|h1|h2|h3)$");

			//高さ調整
			_this.maxEditorHeight = _this.settings.height *  2;
			_this.minEditorHeight = _this.settings.height / 10;

			_this.setDescriptions();

			_this.init();
		});
	};

	TACCN.prototype = {

		init: function() {

			var _this = this;

			if ($(_this.$dom).length < 1) {
				console.log(`not dom`);
				return;
			}
			if (_this.mode === undefined) {

				// 格納できれば一旦削除
				$(_this.$dom).html("");

				if ($("#hc_admin_css").length < 1) {
					$(_this.$dom).before(`<link rel="stylesheet" type="text/css" id="hc_admin_css" href="${_this.rootPath}assets/css/admin.min.css">`);
				}

				// ベースクラス
				_this.hc_class = "hc_" + $(_this.$dom).attr("id");
				_this.$dom.addClass(_this.hc_class);

				_this.setBody();

			} else if (_this.mode == "add") {

				var rows = Number(_this.$dom.attr("rows")) + 1;
				_this.setWrapper(rows, [], "");
			}
		},
		// ここテンプレート追加したら増やしていく箇所
		setEvent: function(btn, no, bar) {

			var _this = this;
			var $wrapper = _this.$dom.find("." + _this.wrapper + `_${no}`);
			var $toolBar = $wrapper.find("." + _this.tool).find("." + _this.tool + `_${bar}`);
			var text = btn;
			var icon = "";
			var only = true;
			switch (btn) {
				case "horizon":
					text = "横組み";
					icon = btn;
					$.getScript(`${_this.rootPath}items/horizon/index.js`).done(function() {
						_this.drawEditor(new CreateHorizon(_this), $toolBar, btn, no);
					});
					break;
				case "table":
					text = "テーブル";
					icon = btn;
					$.getScript(`${_this.rootPath}items/table/index.js`).done(function() {
						_this.drawEditor(new CreateTable(_this), $toolBar, btn, no);
					});
					break;
				case "list":
					text = "リスト";
					icon = btn;
					$.getScript(`${_this.rootPath}items/list/index.js`).done(function() {
						_this.drawEditor(new CreateList(_this), $toolBar, btn, no);
					});
					break;
				case "color":
					text = "文字色";
					icon = btn;
					$.getScript(`${_this.rootPath}items/color/index.js`).done(function() {
						_this.drawEditor(new CreateColor(_this), $toolBar, btn, no);
					});
					break;
				case "backcolor":
					text = "背景色";
					icon = btn;
					$.getScript(`${_this.rootPath}items/backcolor/index.js`).done(function() {
						_this.drawEditor(new CreateColor(_this), $toolBar, btn, no);
					});
					break;
				case "link":
					text = "リンク";
					icon = btn;
					$.getScript(`${_this.rootPath}items/link/index.js`).done(function() {
						_this.drawEditor(new CreateLink(_this), $toolBar, btn, no);
					});
					break;
				case "unlink":
					text = "リンク解除";
					icon = btn;
					$toolBar.off("click", "." + btn);
					$toolBar.on("click", "." + btn, function() {
						var $editor = _this.$dom.find("." + _this.contents + `_${no}`).find("." + _this.editor);
						_this.reset($editor, "a");
					});
					break;
				case "headers":
					text = "見出し";
					icon = btn;
					$.getScript(`${_this.rootPath}items/headers/index.js`).done(function() {
						_this.drawEditor(new CreateHeaders(_this), $toolBar, btn, no);
					});
					break;
				case "embed":
					text = "埋込";
					icon = btn;
					$.getScript(`${_this.rootPath}items/embed/index.js`).done(function() {
						_this.drawEditor(new CreateEmbed(_this), $toolBar, btn, no);
					});
					break;
				case "image":
					text = "画像";
					icon = btn;
					$.getScript(`${_this.rootPath}items/image/index.js`).done(function() {
						_this.drawEditor(new CreateImage(_this), $toolBar, btn, no);
					});
					break;
				case "quote":
					text = "引用";
					icon = btn;
					var tag = `<blockquote class="hc_quote"><p>ここに引用文</p><p class="hc_quote_source">引用元：<a href="#" class="hc_link" data-time="dt${Date.now()}"><ここをリンク設定で変更してください></a></p></blockquote>`;
					_this.directTag(tag, btn, no, $toolBar);
					break;
				case "hr":
					text = "境界線";
					icon = btn;
					var tag = `<div><hr></div>`;
					_this.directTag(tag, btn, no, $toolBar);
					break;
				case "fontsize":
					text = "文字サイズ";
					icon = btn;
					var sizes = {
						"小": "hc_fontsize_small",
						"中": "hc_fontsize_middle",
						"大": "hc_fontsize_large",
					};
					_this.selectTag(sizes, btn, no, $toolBar);
					break;
				case "bold":
					text = "太字";
					icon = btn;
					_this.changeTag("font-weight", "bold", btn, no, $toolBar);
					break;
				case "italic":
					text = "斜め文字";
					icon = btn;
					_this.changeTag("font-style", "italic", btn, no, $toolBar);
					break;
				case "underline":
					text = "下線";
					icon = btn;
					_this.changeTag("text-decoration", "underline", btn, no, $toolBar);
					break;
				case "strike":
					text = "取消線";
					icon = btn;
					_this.changeTag("text-decoration", "line-through", btn, no, $toolBar);
					break;
				case "column":
					text = "コラム";
					icon = btn;
					var tag = `<div class="hc_column"><p>ここにコラム</p></div>`;
					_this.directTag(tag, btn, no, $toolBar);
					break;
				case "padding-p":
					text = "インデント";
					icon = btn;
					_this.parentTag(btn, no, $toolBar);
					break;
				case "padding-m":
					text = "インデント";
					icon = btn;
					_this.parentTag(btn, no, $toolBar);
					break;
				case "align-l":
					text = "左寄せ";
					icon = btn;
					_this.parentTag(btn, no, $toolBar);
					break;
				case "align-c":
					text = "中央揃え";
					icon = btn;
					_this.parentTag(btn, no, $toolBar);
					break;
				case "align-r":
					text = "右寄せ";
					icon = btn;
					_this.parentTag(btn, no, $toolBar);
					break;
				case "viewbox":
					text = "領域展開";
					icon = btn;
					$toolBar.off("click", "." + btn);
					$toolBar.on("click", "." + btn, function(e) {
						if (!$(this).hasClass("view_block_true")) {
							$(this).addClass("view_block_true");
							_this.$dom.find("." + _this.contents + `_${no}`).find("." + _this.editor).contents().find("body").addClass("view_block_area");
						} else {
							$(this).removeClass("view_block_true");
							_this.$dom.find("." + _this.contents + `_${no}`).find("." + _this.editor).contents().find("body").removeClass("view_block_area");
						}
					});
					break;
				case "reset":
					text = "リセット";
					icon = btn;
					$toolBar.off("click", "." + btn);
					$toolBar.on("click", "." + btn, function(e) {
						if (!confirm("この詳細をリセットしますか？")) { return; }
						_this.$dom.find("." + _this.contents + `_${no}`).find("." + _this.editor).contents().find("body").html("");
					});
					break;

			}
			var $btn = _this.getBtn(btn, text, icon, only);
			if ($toolBar.find("." + btn).length < 1) {
				$toolBar.append($btn);
			}
		},
		emptyRow: function(val) {

			if (val === undefined) {
				return "<p><br></p>\n";
			} else {
				return "<p>"  + val + "</p>\n";
			}
		},
		selectTag: function(arr, btn, no, $toolBar) {

			var _this = this;
			var selects = '';
			$.each(arr, function(cap, value) {
				selects += `<div class="hc_item_select_value" value="${value}">${cap}</div>`;
			});

			var $wrapper = _this.$dom.find("." + _this.wrapper + `_${no}`);
			var $editor = _this.$dom.find("." + _this.contents + `_${no}`).find("." + _this.editor);

			//セレクト表示非表示
			$wrapper.on("click", function(e) {

				if (!e.target.closest("." + btn)) {
					$("." + btn).attr("action", "off");
					$(".hc_item_select").remove();
				}
			});

			$toolBar.off("click", "." + btn);
			$toolBar.on("click", "." + btn, function(e) {

				if ($(this).attr("action") === undefined || $(this).attr("action") == "off") {
					$(this).attr("action", "on");
					$(this).append(`<div class="hc_item_select">${selects}</div>`);
				} else {
					$(this).attr("action", "off");
					$(".hc_item_select").remove();
				}
			});

			$toolBar.on("click", ".hc_item_select_value", function() {

				var _gs = _this.getSelections($editor);
				$(this).attr("action", "off");
				$(".hc_item_select").remove();
				var tag = `<span class="${$(this).attr("value")}">${_gs.getRange.toString()}</span>`;
				_this.insert(_gs, $wrapper, tag);
			});
		},
		changeTag: function(property, style, btn, no, $toolBar) {

			var _this = this;
			var $wrapper = _this.$dom.find("." + _this.wrapper + `_${no}`);
			$toolBar.off("click", "." + btn);
			$toolBar.on("click", "." + btn, function() {

				var $editor = _this.$dom.find("." + _this.contents + `_${no}`).find("." + _this.editor);
				var _gs = _this.getSelections($editor);

				var text = {}
				if (_gs.getRange) {
					text = _gs.getRange.toString();
				}

				if (text == "") {
					return;
				}
				var styles = `${property}:${style}`;

				var tag = `<span style="${styles}">${text}</span>`;

				// 入れ子となるタグで重複は消す予定
				// var attrs = $(_gs.start.element)[0].attributes;
				// var isStyle = false;
				// for(let i = 0 ; i < attrs.length; i++) {
				// 	if (styles == attrs.item(i).value) {
				// 		isStyle = true;
				// 	}
				// }

				if (_gs.getRange !== undefined) {
					// 一致してれば戻す
					if (tag == $(_gs.start.element)[0].outerHTML && tag == $(_gs.end.element)[0].outerHTML) {

						$(_gs.start.element)[0].replaceWith(text);

					} else {

						_this.insert(_gs, $wrapper, tag);
					}
				}
			});
		},
		directTag: function(tag, btn, no, $toolBar) {

			var _this = this;
			var $wrapper = _this.$dom.find("." + _this.wrapper + `_${no}`);
			$toolBar.off("click", "." + btn);
			$toolBar.on("click", "." + btn, function() {

				var $editor = _this.$dom.find("." + _this.contents + `_${no}`).find("." + _this.editor);
				var _gs = _this.getSelections($editor);
				_this.insert(_gs, $wrapper, tag);
			});
		},
		//マージンと文字寄せはできてる。微調整は必要
		parentTag: function(btn, no, $toolBar) {

			var _this = this;
			var $editor = _this.$dom.find("." + _this.contents + `_${no}`).find("." + _this.editor);
			var $node = $editor.contents().find("body");

			$toolBar.off("click", "." + btn);
			$toolBar.on("click", "." + btn, function() {

				var _gs = _this.getSelections($editor);
				var s = 0;
				var e = 0;
				if (_gs.start === undefined) {

					s = 0;
					_this.getStyle(btn, $node.children().eq(s));

				} else {

					s = _this.parentRow(_gs.start.element);
					e = _this.parentRow(_gs.end.element);

					var doms = _gs.getRange.cloneContents().children;
					if (doms.length > 1) {

						var text = "";
						$(doms).each(function(i, dom) {
							_this.getStyle(btn, dom);
							text += dom.outerHTML;
						});
						for (var i = s; i <= e; i++) {
							_this.getStyle(btn, $node.children().eq(i));
						}
					} else {
						_this.getStyle(btn, $node.children().eq(_gs.selected.row));
					}
				}
			});
		},
		parentRow: function(element) {

			var _this = this;
			var row = 0;

			if ($(element)[0].nodeName == "BODY") {

				return row;

			} else {

				if ($(element.parentElement)[0].nodeName == "BODY") {

					row = $(element).index();
					return row;
				} else {
					_this.parentRow(element.parentElement);
				}
			}
		},
		getStyle: function(btn, dom) {

			var _this = this;
			var tgText;
			var emDefault = 2;
			var style = {};
			//インデント
			if (btn == "padding-p" || btn == "padding-m") {
				if ($(dom).attr("style") !== undefined && $(dom).attr("style").search(/padding-left/) !== -1) {

					tgText = $(dom).attr("style");
					var nPadding = tgText.match(/\d+/)[0];
					if (nPadding === null) { nPadding = 1; }
					emNumP = ((nPadding / emDefault) + 1) * emDefault;
					if (emNumP > 50) {
						emNumP = 50;
					}
					emNumM = ((nPadding / emDefault) - 1) * emDefault;
					if (emNumM < 0) {
						emNumM = 0;
					}
				} else {
					emNumP = 2;
					emNumM = 0;
				}
				if (btn == "padding-p") {
					style.attr = "padding-left";
					style.value = emNumP + "em";
				} else if (btn == "padding-m") {
					style.attr = "padding-left";
					style.value = emNumM + "em";
				}
			//左寄せ
			} else if (btn == "align-l") {
				style.attr = "text-align";
				style.value = "left";
			//中央寄せ
			} else if (btn == "align-c") {
				style.attr = "text-align";
				style.value = "center";
			//右寄せ
			} else if (btn == "align-r") {
				style.attr = "text-align";
				style.value = "right";
			}
			$(dom).css(style.attr, style.value);
		},
		brTag: function(obj, $target) {

			var _this = this;
			var row = $(obj).attr("target");

			if ($(obj).hasClass("after")) {
				$target.find("body").append(_this.emptyRow());
			} else if ($(obj).hasClass("before")) {
				$target.find("body").prepend(_this.emptyRow());
			} else {
				$target.find("body").children().eq(row).after(_this.emptyRow());
			}
			$(".br_add").remove();
		},
		resetTag: function(value, tag) {

			var reg = new RegExp( '<'+ tag + '[^>]+>|</' + tag + '>', "igm");
			return value.replace(reg, "");
		},
		/**
		 * htmlからurlの配列を取得
		 */
		getHrefInHtml: function(html) {

			var infos = {};
			var datas = [];
			var $tar = $(html).find("a");
			if ($(html)[0].nodeName == "A") {
				$tar = $(html);
			}
			$tar.each(function(i, dom) {
				infos.href = $(dom).attr("href");
				infos.time = $(dom).data("time");
				datas.push(infos);
			})
			return datas;
		},
		/**
		 * url配列からOGPを取得
		 */
		getOGP: function(infos, $wrapper) {

			var _this = this;
			// https://yahoo.co.jp
			// https://www.kk-sowa.co.jp/
			infos.forEach(function(info) {

				var opt = {
					url: `${_this.rootPath}app/ogp_get.php`,
					type: "POST",
					dataType: "JSON",
					datas: {
						ogp_url: info.href,
						ogp_time: info.time,
					}
				}
				GeneralFrame.doAjax(opt, function(res) {

					if (res.ogp_html && $wrapper.find("div." + _this.addsave).find(`.ogpBox[data-url="${encodeURIComponent(info.href)}"]`).length < 1) {
						_this.setOGP(res.ogp_html, $wrapper);
					}
				});
			});
		},
		/**
		 * 取得したOGPをセットする
		 */
		setOGP: function(html, $wrapper) {

			var _this = this;
			$wrapper.find("textarea." + _this.addsave).val($wrapper.find("textarea." + _this.addsave).val() + html);
			$wrapper.find("div." + _this.addsave).append(html);

			// ogpプレビューをクリックで削除
			$wrapper.on("click", ".ogpBox",  function() {

				$(this).remove();
				var repHtml = "";
				$wrapper.find("div." + _this.addsave + " .ogpBox").each(function(i, dom) {
					repHtml += $(dom)[0].outerHTML;
				});
				$wrapper.find("textarea." + _this.addsave).val(repHtml);
				return false;
			})
		},
		/**
		 * HTMLリンクからOGPを再構築
		 */
		refreshOGP: function(html, $wrapper) {

			var _this = this;
			var times = [];
			// テキスト入力のaタグ「data-time」を検知
			$(html).find("a").each(function(i, dom) {

				var time = $(dom).data("time");
				if (time !== undefined) {
					times.push(time);
				}
			});

			var repHtml = "";
			// 現在のOGPからないものを削除
			$wrapper.find("div." + _this.addsave + " .ogpBox").each(function(i, ogp) {

				var time = $(ogp).data("time");
				if (times.includes(time) === false) {
					$(ogp).remove();
				} else {
					repHtml += $(ogp)[0].outerHTML;
				}
			});
			$wrapper.find("textarea." + _this.addsave).val(repHtml);
		},
		/**
		 * 以下DOMイベント系
		 */
		editorAppearance: function($contents) {

			var _this = this;

			var $wrapper = $contents.parents("." + _this.wrapper);
			var $editor = $contents.find("." + _this.editor).contents().find("body");
			_this.refreshSource($editor);

			$editor.on("click", "*", function() {

				var _gs = _this.getSelections($contents.find("." + _this.editor));
				$contents.next().find(".htmls").html("");

				var htmls = $(_gs.end.element)[0].nodeName;
					htmls = `<a href="javascript:;" class="-range">${$(_gs.end.element)[0].nodeName}</a>`;
				$contents.next().find(".htmls").append(htmls);
			});

			// フォーカス
			$editor.on("focus", function(e) {

				// フォーカスしたときにBodyが空
				if ($editor.html() == "") {
					$editor.html(_this.emptyRow());
				}
			});

			// テキストエリアから離れたとき
			$editor.on("blur", function(e) {

				_this.adjustRows($editor);
			});

			// キーを押した時
			$editor.on("keyup", function(e) {

				var $this = $(this);

				if (typeof _this.settings.keyup == "function") {
					_this.settings.keyup(_this, e);
				}
			});

			// キーを押した時
			$editor.on("keydown", function(e) {

				var $this = $(this);

				// Bodyが空もしくは初期以外
				if ($editor.html() == "" && $this.parents($editor).find("body > *").eq(0).length == 0) {
					$editor.html(_this.emptyRow());
				}

				/**
				 * エンターか半角スペースを押されたとき、その行にURLが存在すればリンクにする
				 */
				if (e.key === "Enter" || e.key === " ") {

					var _gs = _this.getSelections($contents.find("." + _this.editor));
					var $row = $this.parents($editor).find("body > *").eq(_gs.start.row);
					var reHtml = "";
					if ($row[0] !== undefined) {
						$row[0].childNodes.forEach((node) => {

							console.log(node)
							if ($(node).prop("nodeName") === undefined) {

								var regex = /(https?:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+)$/i;
								var isLink = regex.test($(node)[0].nodeValue);
								if (isLink) {

									reHtml += $(node)[0].nodeValue.replace(regex, `<a href="$1" class="hc_link" data-time="dt${Date.now()}" target="_blank">$1</a>`);
									_this.getOGP(_this.getHrefInHtml(reHtml), $wrapper);
									e.preventDefault();
								} else {
									reHtml += $(node)[0].nodeValue;
								}
							} else {
								reHtml += $(node)[0].outerHTML;
							}
						});
						$row.replaceWith($(`<${$row[0].localName}>`).append(reHtml));
						var range = document.createRange()
						var $newRow = $this.parents($editor).find("body > *").eq(_gs.start.row);
						range.setStart($newRow[0], $newRow[0].childNodes.length)
						range.setEnd($newRow[0], $newRow[0].childNodes.length)
						_gs.removeAllRanges();
						_gs.addRange(range);
						_this.adjustRows($editor);
					}
				}
				if (typeof _this.settings.keydown == "function") {
					_this.settings.keydown(_this, e);
				}
			});

			//文章をコピーされたときプレーンテキストとして貼付
			$editor.bind("paste", function(e) {

				e.preventDefault();
				var nodes = (e.originalEvent || e).clipboardData.getData("text/plain").replace(/\r?\n|\n/, "<br>");
				var tags = $(_this.emptyRow("")).append(nodes);
				var _gs = _this.getSelections($contents.find("." + _this.editor));
				var html = $(tags)[0].outerHTML.replace(/(https?:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+)/igm, `<a href="$1" class="hc_link" data-time="dt${Date.now()}" target="_blank">$1</a>`);

				_this.getOGP(_this.getHrefInHtml(html), $wrapper);
				_this.insert(_gs, $contents, html);
			});

			//編集エリアの変更を保存用にも反映させる。
			//https://developer.mozilla.org/ja/docs/Web/API/MutationObserver
			var observer = new MutationObserver(function(mutation) {

				mutation.forEach(function(m) {

					var html = $editor.html();
					// _this.adjustRows($editor);

					if (m.type == "characterData" || m.type == "childList" || m.type == "attributes") {
						$contents.find("." + _this.save).val(html);
					}

					if (m.type == "characterData" || m.type == "childList") {
						_this.refreshOGP(html, $wrapper);
					}

					if (typeof _this.settings.changeText == "function") {
						_this.settings.changeText(_this, m);
					}
				});
			});
			observer.observe($editor[0], {
				subtree: true,
				attributes: true,
				characterData: true,
				childList: true,
			});

			// 編集領域可変
			$contents.resizable({
				handles: "s",
				animate: true,
				helper: "ui-resizable-helper"
			});

			//ボタンで改行挿入
			$editor.on("click", ".br_add", function(e) {
				_this.brTag(this, $contents.find("." + _this.editor).contents());
			});

			$editor.on("mouseover", "> *",  function(e) {

				if ($editor.find(".br_add").length < 1) {

					var $child = $editor.children();
					var now = $editor.children().index(this);

					if ($(this).prop("nodeName") == "P") { return; }

					// この案件では不要
					return;
					//最初の要素
					if (now == 0) {

						$(this).before(`<span class="br_add" target="${now}"></span>`);
						$(this).after(`<span class="br_add" target="${now+1}"></span>`);

					//最後の要素
					} else if (now == $child.length - 1) {

						$(this).after(`<span class="br_add" target="${now}"></span>`);

					//間の行で、改行入れれるタグの場合
					} else if ($child.eq(now)[0].localName.search(_this.doms_br_tags) !== -1) {

						//重なってるあとに改行
						if ($child.eq(now+1)[0].localName.search(_this.doms_br_tags) !== -1) {

							$(this).after(`<span class="br_add" target="${now}"></span>`);
						} else if ($child.eq(now-1)[0].localName.search(_this.doms_br_tags) !== -1) {

							$(this).before(`<span class="br_add" target="${now}"></span>`);
						}
					}
				}

			}).on("mouseout", "*", function(e) {

				var i = 0;
				//要素内のホバー要素の場合は消さないようにする。(文字の上だとホバーがはずれたと判定されるため)
				$(":hover").each(function () {

					if ($(e.relatedTarget).hasClass("br_add")) {
						i++;
					}
				});
				if (i < 1) {
					$editor.find(".br_add").remove();
				}
			});

		},
		bodyAppearance: function() {

			var _this = this;
			var head;
			var body;
			// 複数対応
			if ($.isArray(_this.settings.datas) === true) {
				_this.$dom.find("." + _this.body).sortable({
					axis: "y",
					cancel: ":input,button,.hc_editor,.hc_head,.hc_footer",
					opacity: 0.9,
					start: function(e, ui) {
						head = $(ui.item).find("." + _this.editor).contents().find("head")[0].innerHTML;
						body = $(ui.item).find("." + _this.editor).contents().find("body")[0].innerHTML;
					},
					stop: function(e, ui) {

						$(ui.item).find("." + _this.editor).contents().find("head").html(head);
						$(ui.item).find("." + _this.editor).contents().find("body").attr("contenteditable", true).attr("placeholder", "コメントを入力").html(body);

						_this.editorAppearance($(ui.item).find("." + _this.contents));

						var $body = $(ui.item).find("." + _this.contents).parents("." + _this.body);
						_this.toolAppearance(_this.$dom.find($body).index("." + _this.body));
					}
				});
			}
		},
		headAppearance: function($head) {

			var _this = this;
			$head.on("click", ".-hc_open", function(e) {
				$head.find("button").removeClass("-active");
				$(this).addClass("-active");
				_this.$dom.find("." + _this.contents).height(_this.maxEditorHeight);
			});
			$head.on("click", ".-hc_close", function(e) {
				$head.find("button").removeClass("-active");
				$(this).addClass("-active");
				_this.$dom.find("." + _this.contents).height(_this.minEditorHeight);
			});
			$head.on("click", ".-hc_default", function(e) {
				$head.find("button").removeClass("-active");
				$(this).addClass("-active");
				_this.$dom.find("." + _this.contents).height(_this.settings.height);
			});
		},
		toolAppearance: function(no) {

			var _this = this;
			(_this.settings.toolbar1 != false) ? _this.settings.toolbar1.forEach((btn) => {
				_this.setEvent(btn, no, 1);
			}) : "";

			(_this.settings.toolbar2 != false) ? _this.settings.toolbar2.forEach((btn) => {
				_this.setEvent(btn, no, 2);
			}) : "";

			(_this.settings.toolbar3 != false) ? _this.settings.toolbar3.forEach((btn) => {
				_this.setEvent(btn, no, 3);
			}) : "";
		},
		tailAppearance: function($tail, no) {

			var _this = this;
			var $editor = _this.$dom.find("." + _this.contents + `_${no}`).find("." + _this.editor);

			$tail.on("click", ".-range", function(e) {

				var _gs = _this.getSelections($editor);
				var range = new Range();
					range.selectNode($(_gs.selected.anchorNode)[0]);
				range.setStart($(_gs.selected.anchorNode)[0], 0);
				range.setEnd($(_gs.selected.focusNode)[0], _gs.selected.focusNode.length);
				_gs.removeAllRanges();
				_gs.addRange(range);

			});
			$tail.on("click", ".-hc_open", function(e) {
				$tail.parents("." + _this.wrapper).find("." + _this.contents).height(_this.maxEditorHeight);
			});
			$tail.on("click", ".-hc_close", function(e) {
				$tail.parents("." + _this.wrapper).find("." + _this.contents).height(_this.minEditorHeight);
			});
			$tail.on("click", ".-hc_default", function(e) {
				$tail.parents("." + _this.wrapper).find("." + _this.contents).height(_this.settings.height);
			});
			$tail.on("click", ".-hc_delete", function(e) {

				var $wrapper = _this.$dom.find("." + _this.wrapper);
				if ($wrapper.length < 2) {
					console.log("これ以上は削除できません...")
					return false;
				}
				if (confirm("この詳細を削除しますか？")) {
					$tail.parents("." + _this.wrapper).remove();
				}
			});
		},
		footerAppearance: function($footer) {

			var _this = this;

			$footer.off("click", ".-add");
			$footer.on("click", ".-add", function(e) {

				_this.settings.datas = [];
				$(_this.$dom).TACCN(_this.settings, "add");
			});
		},
		doms: function(no) {

			var _this = this;
			return {
				"wrapper": _this.$dom.find("." + _this.wrapper + `_${no}`),
				"contents": _this.$dom.find("." + _this.contents + `_${no}`),
			}
		},
		/**
		 * 以下DOM作成系
		 */
		setHead: function() {

			var _this = this;
			if (!_this.settings.multi) { return false; }

			$.get(`${_this.rootPath}component/head.html`, function(html) {

				_this.$dom.prepend(html);
				// イベント定義
				var $head = _this.$dom.find("." + _this.head);
				_this.headAppearance($head);
			});
		},
		setBody: function() {

			var _this = this;

			// ヘッダー
			_this.setHead();

			// 大枠
			var $body = $('<div>').addClass(_this.body);

			_this.$dom.append($body);

			// イベント定義
			_this.bodyAppearance();

			if ($.isArray(_this.settings.datas) === true) {

				_this.$dom.attr("rows", _this.settings.datas.length);

				$.each(_this.settings.datas, function(no, arr) {

					_this.setWrapper(no, arr, arr.Description);
				});
			} else {

				_this.$dom.attr("rows", 1);
				_this.setWrapper(1, [], _this.Descriptions);
			}

			// フッター
			_this.setFooter();
		},
		setWrapper: function(no, arr, Description) {

			var _this = this;

			var $wrapper = $('<div>').addClass(_this.wrapper).addClass(_this.wrapper + `_${no}`);
			var $body = _this.$dom.find("." + _this.body);

			$body.append($wrapper);

			_this.setContents(no, arr, Description);
		},
		setContents: function(no, arr, Description) {

			var _this = this;
			var $contents = $('<div>').addClass(_this.contents).addClass(_this.contents + `_${no}`);

			// 追加時はコンテンツから呼ぶ
			if (_this.mode == "add") {
				_this.$dom.attr("rows", no);
			}

			// ツール
			_this.setTool(no);

			// コンテンツのその他系
			_this.setInfo(no, arr);

			// 編集コンテンツ
			_this.doms(no).wrapper.append($contents);

			_this.setEditor($contents, Description);

			// メイン画像
			_this.setFileUpload($contents, no, arr);

			// フッター
			if (_this.settings.tail) {
				_this.setTail(no);
			}
		},
		setFileUpload: function($contents, no, arr) {
			var _this = this;

			if (_this.settings.fileupload) {

				// 横並びする用にコンテンツにクラス付与
				$contents.addClass("hc_fileupload");

				var unique = _this.file + `_${no}`;
				var $file = $('<div>').addClass(_this.file).addClass(unique).attr("id", unique);
				var inputFile = `<label><div class="preview -background"></div><input type="file" name="${$(_this.$dom).attr("id")}_File[]" id="${unique}"></label>`;
				var name = `<input type="hidden" name="${$(_this.$dom).attr("id")}_FileName[]" class="name" value="${(arr.File !== undefined) ? arr.File : ""}">`;

				$file.append(inputFile).append(name);
				_this.doms(no).contents.prepend($file);

				var $preview = $file.find(".preview");
				var $name = $file.find(".name");

				var previmage = new Image();

				if (arr.File !== undefined && arr.File != "") {

					previmage.src = arr.Path + arr.File;
					previmage.width;
					previmage.height;

				} else {

					previmage.src = `${_this.rootPath}assets/images/noimage.png`;
					previmage.width;
					previmage.height;
				}
				previmage.onload = function() {
					$preview.css({
						"background-image" : "url('" + previmage.src + "')",
						"width": previmage.width,
						"height": previmage.height,
					});
				}

				// ファイル変更イベント
				$file.on("change", "#" + unique, function(e) {

					var target = e.target;
					var file = target.files[0];
					var type = file.type;

					var reader = new FileReader();
					var image = new Image();
					reader.onload = function(foe) {

						image.src = reader.result;

						if (type.match(/jpg|jpeg|png|gif|tif|icon/)) {

							image.onload = function() {
								$preview.css({
									"background-image" : "url('" + foe.target.result + "')",
									"width": image.naturalWidth,
									"height": image.naturalHeight,
								});
							}
							$name.val(file.name);

						} else if (type.match(/pdf/)) {

							$preview.css({"background-image" : "url('/assets/images/appicon/pdf32.png')", "width" : "32px"});

						} else if (type.match(/csv|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet/)) {

							$preview.css({"background-image" : "url('/assets/images/appicon/xls32.png')", "width" : "32px"});

						} else if (type.match(/msword|vnd.openxmlformats-officedocument.wordprocessingml.document/)) {

							$preview.css({"background-image" : "url('/assets/images/appicon/doc32.png')", "width" : "32px"});

						} else if (type.match(/vnd.ms-powerpoint|vnd.openxmlformats-officedocument.presentationml.presentation/)) {

							$preview.css({"background-image" : "url('/assets/images/appicon/ppt32.png')", "width" : "32px"});

						} else {

							$preview.css({"background-image" : "url('/assets/images/appicon/other32.png')", "width" : "32px"});
						}
					}
					reader.readAsDataURL(e.target.files[0]);
				});
			}
		},
		setTool: function(no) {

			var _this = this;
			$.get(`${_this.rootPath}component/tool.html`, function(html) {

				// 枠の上
				if (_this.settings.toolPos == "top") {
					_this.doms(no).wrapper.prepend(html);
				// 枠の下
				} else {
					_this.doms(no).wrapper.append(html);
				}

				$("." + _this.tool).addClass(_this.tool + `_${no}`);

				if (_this.settings.toolbar2.length < 1) {
					_this.doms(no).wrapper.find("." + _this.tool + `_${no}` + " .hc_tool_2").remove();
				}

				if (_this.settings.toolbar3.length < 1) {
					_this.doms(no).wrapper.find("." + _this.tool + `_${no}` + " .hc_tool_3").remove();
				}

				// イベント定義
				_this.toolAppearance(no);
			});
		},
		/**
		 * arr [Caption, Description, PageLink]
		 */
		setInfo: function(no, arr) {

			var _this = this;
			if (!_this.settings.multi) { return false; }

			var $info = $("<div>").addClass(_this.info).addClass(_this.info + `_${no}`);

			_this.doms(no).wrapper.append($info);
			var checked = "";
			if (arr.PageLink == 1) {
				checked = "checked";
			}
			// PageLink
			var inputPageLink = `<input type="checkbox" name="${$(_this.$dom).attr("id")}_PageLink[]" value="1" ${checked}>`;
			$info.prepend(inputPageLink);
			// Caption
			var inputCaption = `<input type="text" name="${$(_this.$dom).attr("id")}_Caption[]" value="${(arr.Caption !== undefined) ? arr.Caption : ""}">`;
			$info.prepend(inputCaption);
		},
		setEditor: function($contents, html) {

			var _this = this;

			// 編集エリア
			var $editor = $("<iframe>").addClass(_this.editor).attr("allowtransparency", true).attr("src", "");
			$contents.append($editor);

			// css系
			$editor.contents().find("head").append(`<link rel="stylesheet" type="text/css" id="hc_front_css" href="${_this.rootPath}assets/css/front.min.css">`);

			// 編集
			$editor.contents().find("body").attr("contenteditable", true).attr("placeholder", "コメントを入力").html(html);

			// 高さ
			$contents.css({
				"height": _this.settings.height
			});

			var textarea = "";
			var addarea = "";
			// 複数の場合とポストの方法変更
			if (_this.settings.multi) {
				textarea += `<textarea name="${$(_this.$dom).attr("id")}[]" class=${_this.save}>${html}</textarea>`;
				addarea += `<textarea name="${$(_this.$dom).attr("id")}_add[]" class=${_this.addsave} style="display:none;">${html}</textarea>`;
			} else {
				textarea += `<textarea name="${$(_this.$dom).attr("id")}" class=${_this.save}>${html}</textarea>`;
				addarea += `<textarea name="${$(_this.$dom).attr("id")}_add" class=${_this.addsave} style="display:none;">${html}</textarea>`;
			}
			addarea += `<div class=${_this.addsave}></div>`;

			// 保存用テキストエリアを追加 デベロッパーツールで見やすいように上に配置
			$contents.prepend(textarea);
			$contents.after(addarea);

			// イベント定義
			_this.editorAppearance($contents);
		},
		setTail: function(no) {

			var _this = this;

			$.get(`${_this.rootPath}component/tail.html`, function(html) {

				_this.doms(no).wrapper.append(html);
				_this.doms(no).wrapper.find("." + _this.tail).addClass(_this.tail + `_${no}`);

				// イベント定義
				var $tail = _this.doms(no).wrapper.find("." + _this.tail + `_${no}`);

				if (!_this.settings.multi) {
					$tail.find(".-hc_delete").remove();
				}
				_this.tailAppearance($tail, no);
			});
		},
		setFooter: function() {

			var _this = this;
			if (!_this.settings.multi) { return false; }

			$.get(`${_this.rootPath}component/footer.html`, function(html) {

				_this.$dom.append(html);
				_this.$dom.find("." + _this.footer);

				// イベント定義
				var $footer = _this.$dom.find("." + _this.footer);
				_this.footerAppearance($footer);
			});
		},
		getBtn(btn, text, icon, only) {

			var _this = this;
			var view = `<svg style="max-width:18px;max-height:18px;fill:none;"><use href="${_this.rootPath}assets/images/defs.svg#${btn}"></use></svg><span>${text}</span>`;
			// icon 指定なし > テキスト
			if (!icon) {
				view = text;
			// only > アイコンのみ表示
			} else if (only) {
				view = `<svg style="max-width:18px;max-height:18px;fill:none;"><use href="${_this.rootPath}assets/images/defs.svg#${btn}"></use></svg>`;
			}
			var $btn = $("<button>").attr("title", text).attr("type", "button").addClass(btn).html(view);
			return $btn;
		},
		setModal: function(btn, no, _event, param) {

			var _this = this;
			var $editor = _this.$dom.find("." + _this.contents + `_${no}`).find("." + _this.editor);
			var $wrapper = _this.$dom.find("." + _this.wrapper + `_${no}`);

			var _gs = _this.getSelections($editor);

			// 要素からフォーカスをはずす
			$editor.blur();

			$(_this.settings.modalAppendTo).append('<div class="-hc_overlay">');

			// モーダル大元を取得
			$.get(`${_this.rootPath}component/modal.html`, function(modal) {

				$(modal).appendTo(_this.settings.modalAppendTo).hide().fadeIn(200);

				// モーダルの内容をセット
				$.get(`${_this.rootPath}items/${btn}/`, function(html) {

					var $hc_modal = $(".-hc_modal");

					var top = $wrapper.find("." + btn).offset().top  + _this.$dom.position().top;

					$hc_modal.css({
						// "top": top,
						// "max-height": `calc(100% - ${top}px)`,
						// "bottom": "initial",
					})

					$hc_modal.draggable({
						"handle": ".-hc_modal_caption"
					});

					$(document).on("keyup", function(e) {

						//Escキーでダイアログを閉じる
						if (e.which == 27) {
							_this.removeModal($hc_modal);
							return false;
						}
					});

					// モーダルの見た目
					$hc_modal.css(_event.config().css);

					// タイトル
					var caption = `<span>${_event.config().caption}</span><svg class="-hc_close"><use href="${_this.rootPath}assets/images/defs.svg#iconClose"></use></svg>`;

					// Parts追加
					$hc_modal.find(".-hc_modal_caption").append(caption);
					$hc_modal.find(".-hc_modal_contents").append(html);

					// データあればセット
					$.each(param, function(cl, val) {
						$hc_modal.find("." + cl).val(val)
					});

					if (Object.keys(param).length < 1) {
						$hc_modal.find(".-hc_delete").remove();
					}
					$hc_modal.off("click", ".-hc_delete");
					$hc_modal.on("click", ".-hc_delete", function() {

						if (confirm("選択されている要素を削除しますか？")) {
							_gs.getRange.deleteContents();
							_this.removeModal($hc_modal);
						}
					});

					// OK
					$hc_modal.off("click", ".-hc_save");
					$hc_modal.on("click", ".-hc_save", function() {

						var tag = _event.getTag($hc_modal.find("#" + _event.config().id));
						console.log(tag)
						if (tag === undefined) { return }

						_this.insert(_gs, $wrapper, tag);
						_this.removeModal($hc_modal);

						_this.getOGP(_this.getHrefInHtml(tag), $wrapper);
					});

					// キャンセル
					$hc_modal.on("click", ".-hc_close", function() {
						_this.removeModal($hc_modal);
					});

					if (typeof _event.loaded === "function") {
						_event.loaded($hc_modal.find("#" + _event.config().id), param);
					}
				});
			});
		},
		removeModal: function($hc_modal) {

			var _this = this;
			$(".-hc_overlay").remove();
			$hc_modal.remove();
		},
		/**
		 * 以下処理系
		 */
		setDescriptions: function() {

			var _this = this;
			//json
			if ($.isArray(_this.settings.datas) === true) {

				_this.dataType = "json";
				_this.Descriptions = _this.settings.datas;

			//url or string
			} else {

				// url
				if (_this.settings.datas) {
					var regex = /^(?:(?:ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)*$/;
					var r = {};
					r.result = regex.test(_this.settings.datas);
					// url
					if (r.result === true) {

						_this.dataType = "url";
						$.get(_this.settings.datas, function(res) {
							_this.Descriptions = res;
						});

					// string
					} else {
						_this.dataType = "string";
						_this.Descriptions = _this.settings.datas;
					}

				// string
				} else {

					_this.dataType = "string";
					_this.Descriptions = $(_this.$dom).html();
				}
			}
		},
		// 編集画面を開く
		drawEditor: function(_event, $toolBar, btn, no) {

			var _this = this;
			var $editor = _this.$dom.find("." + _this.contents + `_${no}`).find("." + _this.editor);

			// 新規
			$toolBar.off("click", "." + btn);
			$toolBar.on("click", "." + btn, function() {

				var _gs = _this.getSelections($editor);

				var param = {}
				if (_gs.getRange) {
					param = (_gs.getRange.toString()) ? { "text": _gs.getRange.toString() } : {}
				}
				_this.setModal(btn, no, _event, param)
			});

			$editor.contents().on("dblclick", ".hc_" + btn, function(e) {

				var _gs = _this.getSelections($editor);
				_gs.removeAllRanges();

				var param = _event.getParam(this);
				var range = new Range();
					range.selectNode(this);
				_gs.addRange(range);

				_this.setModal(btn, no, _event, param);
				return false;
			});
		},
		// 選択状態の情報(肝)
		getSelections: function($target) {

			var _this = this;
			//選択情報
			var _gs = {}
				_gs = $target[0].contentDocument.getSelection();

			//DOM操作に必要なもの
			_gs.newNode = document.createElement("newnode");

			//選択されてる場合
			if (_gs.rangeCount > 0) {

				_gs.getRange = _gs.getRangeAt(0);

				//anchor focusで前後するため
				var _sc = _gs.getRange.startContainer;
				_gs.start = {
					container: $(_sc).parents("body > *"),
					row: $(_sc).parents("body > *").index(),
					element: _sc.parentElement,
					offset: _gs.getRange.startOffset,
					len: $(_sc).text().length,
					outtext: $(_sc).text().substr(0, _gs.getRange.startOffset),
					intext: $(_sc).text().substr(_gs.getRange.startOffset, $(_sc).text().length),
				}

				var _ec = _gs.getRange.endContainer;
				_gs.end = {
					container: $(_ec).parents("body > *"),
					row: $(_ec).parents("body > *").index(),
					element: _ec.parentElement,
					offset: _gs.getRange.endOffset,
					len: $(_ec).text().length,
					intext: $(_ec).text().substr(0, _gs.getRange.endOffset),
					outtext: $(_ec).text().substr(_gs.getRange.endOffset, $(_ec).text().length),
				}

				var crow = 0;
				if (_gs.getRange.commonAncestorContainer.innerHTML == "<br>") {
					crow = $(_gs.getRange.commonAncestorContainer).index()
				} else {
					crow = $(_gs.getRange.commonAncestorContainer).parents("body > *").index()
				}
				//その時の情報記用
				_gs.selected = {
					commonContainer: _gs.getRange.commonAncestorContainer,
					row: crow,
					anchorOffset: _gs.anchorOffset,
					anchorNode: _gs.anchorNode,
					focusOffset: _gs.focusOffset,
					focusNode: _gs.focusNode,
					rangeCount: _gs.rangeCount,
					isCollapsed: _gs.isCollapsed
				}

				// 単一行
				if (_gs.start.row == _gs.end.row) {

					var nodes = _gs.getRange.cloneContents().childNodes;
					var mdlt = "";
					var mdlh = "";

					$(nodes).each(function(i, node) {

						// テキスト
						if ($(node).prop("nodeName") === undefined) {

							mdlt += $(node)[0].nodeValue;
							mdlh += $(node)[0].nodeValue;
						// Aタグ 入れ子となってるリンクは消す
						} else if ($(node).prop("nodeName") == "A") {
							mdlt += $(node)[0].outerText;
							mdlh += _this.resetTag($(node)[0].outerHTML, "a");
						// html
						} else {
							mdlt += $(node)[0].outerText;
							mdlh += $(node)[0].outerHTML;
						}
					});

					_gs.selected.text = mdlt;
					_gs.selected.html = mdlh;

				// 複数行
				} else {

					var rows = _gs.getRange.cloneContents().children;
					var texts2 = [];
					var htmls2 = {};

					$(rows).each(function(i, row) {

						var nodes = $(row)[0].childNodes;
						var mdlt2 = "";
						var mdlh2 = "";
						var no = _gs.start.row + i;
						$(nodes).each(function(j, node) {

							// テキスト
							if ($(node).prop("nodeName") === undefined) {
								mdlt2 += $(node)[0].nodeValue;
								mdlh2 += $(node)[0].nodeValue;
							// Aタグ 入れ子となってるリンクは消す
							} else if ($(node).prop("nodeName") == "A") {
								mdlt2 += $(node)[0].outerText;
								mdlh2 += _this.resetTag($(node)[0].outerHTML, "a");
							// html
							} else {
								mdlt2 += $(node)[0].outerText;
								mdlh2 += $(node)[0].outerHTML;
							}
							texts2[no] = mdlt2;
							htmls2[no] = mdlh2;
						});
					});
					_gs.selected.text = Object.keys(texts2).map(function(no) {return [texts2[no]] }).join("");
					_gs.selected.html = Object.keys(htmls2).map(function(no) {return {no: Number(no), val:htmls2[no]} });
				}
			}
			return _gs;
		},
		// エリアの変換及び追加
		insert: function(_gs, $parent, tag) {

			var _this = this;
			//挿入する大元の要素
			var $editor = $parent.find("." + _this.editor).contents().find("body");
			var maxLen = $editor.children().length;

			//要素なにかしら
			if (_gs.selected !== undefined && _gs.selected.rangeCount > 0) {

				//選択されている
				if (_gs.selected.isCollapsed === false) {

					console.log("range");

					if (_gs.start.row != _gs.end.row) {

						console.log("node blocks");

						_this.sanitize(_gs.getRange);
						_this.checkNode($editor[0], _gs, tag);

					} else {

						console.log("node block");
						_insert(_gs, tag);
					}

				// 文字の間とか最後とか
				} else {

					console.log("no range");
					if ($editor.html() == _this.emptyRow()) { $editor.html(""); }
					_insert(_gs, tag);
				}

			//要素にあたってない
			} else {

				console.log("not selected");

				_gs.newNode.innerHTML = tag;

				if ($editor.html() == "") {
					$editor.html($(_this.emptyRow("")))
				}

				if ($editor.children().eq(maxLen).length < 1) {

					$editor.children().eq(maxLen-1).after($(_this.emptyRow("")));
					$editor.children().eq(maxLen).html(_gs.newNode);

				} else {
					$editor.children().eq(maxLen).append(_gs.newNode);
				}
			}

			_gs.removeAllRanges();

			_this.refreshSource($editor);

			function _insert(_gs, tag) {

				_gs.getRange.deleteContents();

				var tagText = $.trim($(tag)[0].outerText.replace(/\r?\n/g, ""));
				var orgText = $.trim(_gs.selected.text.replace(/\r?\n/g, ""));

				var node = $(tag)[0];

				if (tagText == orgText) {
					node = $(tag).html(_gs.selected.html)[0];
				}

				var doms_inline = new RegExp("^(FONT|A|SPAN)$");
				if ($(tag).prop("nodeName").search(doms_inline) === -1) {

					_gs.newNode.innerHTML = tag;
					_gs.getRange.insertNode(_gs.newNode);
				} else {
					_gs.getRange.insertNode(node);
				}
			}
		},
		reset: function($editor, tag) {

			var _this = this;
			var _gs = _this.getSelections($editor);

			if (_gs.getRange !== undefined) {

				// 複数行
				if (_gs.start.row != _gs.end.row) {

					alert("複数行に対応していません。")

				// 単一行
				} else {

					if ($(_gs.anchorNode.parentElement).prop("nodeName").toUpperCase() == tag.toUpperCase()) {
						$(_gs.anchorNode.parentElement).replaceWith(_this.resetTag($(_gs.anchorNode.parentElement)[0].outerHTML, tag))
					}
					if ($(_gs.focusNode.parentElement).prop("nodeName").toUpperCase() == tag.toUpperCase()) {
						$(_gs.focusNode.parentElement).replaceWith(_this.resetTag($(_gs.focusNode.parentElement)[0].outerHTML, tag))
					}
				}
			}
		},
		refreshSource: function($editor) {

			var _this = this;

			$editor.children().each(function(i, dom) {

				var pregInline = new RegExp("^(FONT|A|SPAN)$");

				// インライン要素
				if ($(dom).prop("nodeName").search(pregInline) !== -1) {

					$(dom).replaceWith(function() {
						var $row = $(_this.emptyRow(""));
						$row.append($(this)[0].outerHTML);

						$(this).replaceWith($row[0].outerHTML);
					});

					$(dom).replaceWith($(dom).after("\n"));
				}
			});

			// 不要な改行削除
			$editor.html().replace(/(\n)\1{1,}/igm, "");

			// 挿入用Node削除
			$editor.html($editor.html().replace(/<newnode>|<\/newnode>/igm, ""));

			// 空は削除
			$editor.html($editor.html().replace(/<p><\/p>/igm, ""));
			$editor.html($editor.html().replace(/<div><\/div>/igm, ""));

			//空タグはぶち消し
			$editor.html($editor.html().replace(/(<(span|a|font)(?!\/)[^>]+>)+(<\/[^>]+>)+/igm, ""));

			// Nodeに囲まれていないものを補填する
			_this.adjustRows($editor);
		},

		// Nodeに囲まれていないものを補填する
		adjustRows: function($editor) {

			var _this = this;
			$editor[0].childNodes.forEach((dom) => {

				var val;
				var $row;
				switch ($(dom).prop("nodeName")) {
					case undefined:
						val = $(dom)[0].nodeValue.replace(/\t|\r?\n/g, "");
						val = (val == "") ? "<br>" : val;
						$row = $("<p>").append(val);
						break;
					case "BR":
						$row = $("<p>").append("<br>");
						break;
					case "HR":
						$row = $("<div>").append("<hr>");
						break;
					default:
						$row = $(dom);
				}
				$(dom).replaceWith($row);
			});
		},
		//insert 前処理
		sanitize: function(range) {

			var _this = this;
			// 開始点がテキストノードの中だったら
			if (range.startContainer.nodeType == Node.TEXT_NODE) {
				// テキストノードをRangeの開始点の位置で2つに分ける
				var latter = range.startContainer.splitText(range.startOffset);
				// Rangeの開始点をテキストノードの外側にする
				range.setStartBefore(latter);
			}

			// 終了点にも同様の処理
			if (range.endContainer.nodeType == Node.TEXT_NODE) {
				var latter = range.endContainer.splitText(range.endOffset);
				range.setEndBefore(latter);
			}
		},
		// nodeは現在調べているノード、rangeは着色したい範囲のRange [ちょーややこしい]
		checkNode: function(node, _gs, tag) {

			var _this = this;
			// 新しいRangeを作る
			var nodeRange = new Range();
			// nodeRangeの範囲をnodeを囲むように設定
			nodeRange.selectNode(node);

			var tagText = $.trim($(tag)[0].outerText.replace(/\r?\n/g, ""));
			var orgText = $.trim(_gs.selected.text.replace(/\r?\n/g, ""));
			// 複数行
			var nodes = $(tag)[0];
			// 同じ文字列
			if (tagText == orgText) {

				// 選択範囲クリア
				if (_gs.rangeCount > 0) {
					_gs.getRangeAt(0).deleteContents();
				}

				if ($.isArray(_gs.selected.html) == true) {

					var $editor = $("." + _this.editor).contents();
					var $row;
					var $rowS;
					var $rowL;
					var next = 0;
					$(_gs.selected.html).each(function(i, arr) {

						// 入力
						var $node = $(`<${$(tag).prop("nodeName")}>`).append(arr.val);
						$($(tag)[0].attributes).each(function(j, attr) {
							$node.attr($(attr)[0].nodeName, $(attr)[0].nodeValue)
						});

						if (i == 0) {

							$row = $editor.find("body > *").eq(arr.no);
							$rowS = $(_this.emptyRow("")).append($row.html()).append($node[0].outerHTML);
							$row.replaceWith($rowS);

							next = arr.no + 1
						} else if (i == _gs.selected.html.length - 1) {

							$row = $editor.find("body > *").eq(next);
							$rowL = $(_this.emptyRow("")).append($row.html()).prepend($node[0].outerHTML);
							$row.replaceWith($rowL);

						} else {

							// deleteContentsで間が動いている
							$row = $editor.find("body > *").eq(next);
							$row.before($node);
							next = next + 1
						}
					});

				} else {
					_gs.getRange.insertNode(nodes);
				}

			} else {

				// nodeRangeはrangeに囲まれている
				if (_gs.getRange.compareBoundaryPoints(Range.START_TO_START, nodeRange) <= 0 && _gs.getRange.compareBoundaryPoints(Range.END_TO_END, nodeRange) >= 0) {

					// 外
					if (node.nodeType == Node.TEXT_NODE) {

						console.log("out");
						if ($(_gs.end.container)[0] !== undefined) {

							_gs.getRange.deleteContents();
							//先頭
							if (
								_gs.start.row == 0 &&
								_gs.start.offset == 0 &&
								$(_gs.start.element)[0].nodeName == "P"
							) {
								$(_gs.start.container).append(tag + $(_gs.end.container)[0].innerHTML);
								_gs.end.container.remove();
							//以外
							} else {

								var index = $(_gs.start.container).find(_gs.start.element).index();
								if (index < 0) {
									$(_gs.start.container).append(tag + $(_gs.end.container)[0].innerHTML);
								} else {
									$(_gs.start.container).children().eq(index).append(tag).after($(_gs.end.container)[0].innerHTML);
								}
								_gs.end.container.remove();
							}
						}

					// 内
					} else {
						console.log("in");
					}

				// nodeRangeとrangeは重なっていない
				} else if (_gs.getRange.compareBoundaryPoints(Range.START_TO_END, nodeRange) <= 0 || _gs.getRange.compareBoundaryPoints(Range.END_TO_START, nodeRange) >= 0) {

					return;

				} else {

					// このノードは一部rangeに含まれている
					for (var i=0; i<node.childNodes.length; i++) {
						// 子ノードをひとつずつ調べる
						_this.checkNode(node.childNodes[i], _gs, tag);
					}
				}
			}
		},
		preg_match: function($dom) {

			var _this = this;
			var regex;
			var r = {
				result: true,
				msg: "",
			}
			var val = $dom.val();
			var type = $dom.attr("ct");

			if ($dom.hasClass("required") && val == "") {

				r.result = false;
				r.msg = "入力してください。";
				return r;
			}

			if (type == "url") {

				regex = /^(?:(?:ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)*$/;
				r.result = regex.test(val);
				r.msg = (!r.result) ? "正しいURLを指定してください。" : "";

			} else if (type == "numonly") {

				regex = /^(?:-?)(?:-?[0-9\.]+)*$/;
				r.result = regex.test(val);
				r.msg = (!r.result) ? "半角数字のみで入力してください。" : "";
			}
			return r;
		},
		root: function(path) {

			var _this = this;
			var rootpath;
			var scripts = $("script");
			var pattern = "(.*)\/" + path;
			var reg = new RegExp(pattern);
			var i = scripts.length;
			while (i--) {
				var match = scripts[i].src.match(reg);
				if (match) {
					rootpath = match[1];
					break;
				}
			}
			return rootpath;
		}
	};
	$.fn.TACCN = function(options, mode) {
		return new TACCN(this, options, mode);
	};
});