function CreateTable(base) {

	this.base = base;
	this.init();
}
CreateTable.prototype = {

	init: function() {
		var _this = this;
	},
	config: function() {

		return {
			id: "hc_table_editor",
			caption: "テーブル",
			css: {
				width: "800px",
				height: "400px"
			},
			xy: [2, 3] // 2*3
		}
	},
	loaded: function($modal, param) {

		var _this = this;
		var col = _this.config().xy[0];
		var row = _this.config().xy[1];

		// 少なくとも2つある
		if (Object.keys(param).length > 1) {
			col = param.col;
			row = param.row;
		}
		var tag = _this.createTable(row, col, param, true)
		$modal.prepend(tag);
		var $table = $(".hc_table");

		//行追加
		$(".hc_add_row").on("click", function() {

			var r = $table.attr("row");
			var c = $table.attr("col");

			var nr = Number(r) + 1;
			var addRow = `<tr class="hc_row hc_row${nr}" row="${nr}">`;
				addRow += _this.setRowSetting(nr);

			for (var i = 1; i <= c; i++) {

				var col_class = "";
				if ($("#hc_col_check" + i).prop("checked")) {
					col_class = "hc_colmark";
				}
				addRow += `<td class="hc_col ${col_class}"><div contenteditable="true" id="hc_cell_form${nr}_${i}" class="hc_cell hc_col${i}" tabindex="${nr}"></div></td>`;
			}
			addRow += `</tr>`;
			$table.append(addRow);
			$table.attr("row", nr);
			_this.resetSetting();
		});

		//列追加
		$(".hc_add_col").on("click", function() {

			var r = $table.attr("row");
			var c = $table.attr("col");
			var nc = Number(c) + 1;
			var addCol1 = _this.setColSetting(nc);

			$table.find("tr").eq(0).append(addCol1);

			for (var i = 1; i <= r; i++) {

				var addCol = "";
				addCol += `<td class="hc_col">`;
				addCol += `<div contenteditable="true" id="hc_cell_form${i}_${nc}" class="hc_cell hc_col${nc}" tabindex="${nc}"></div>`;
				addCol += `</td>`;
				$table.find("tr").eq(i).append(addCol);
			}
			$table.attr("col", nc);
			_this.resetSetting();
		});

		//行削除
		$modal.on("click", ".hc_del_row", function() {

			var r = $(this).parents(".hc_row").attr("row");
			//行削除
			$(".hc_row" + r).remove();
			return false;
		});

		//列削除
		$modal.on("click", ".hc_del_col", function() {

			var r = $table.attr("row");
			var c = $(this).parents(".th_col").attr("col");
			var mc = Number($table.attr("col")) - 1;

			//チェックボックスの箇所削除
			$table.find("tr").eq(0).find(".th_col"+c).remove();
			for (var i = 1; i <= r; i++) {
				$table.find("tr").eq(i).find(".hc_col"+c).remove();
			}
			$table.attr("col", mc);
			return false;
		});

		//チェック時 行
		$modal.on("click", ".hc_row_check", function() { checkRow($(this), $(this).parents(".hc_row").attr("row")); });

		function checkRow($dom, num) {
			_this.resetSetting();
			if ($dom.prop("checked")) {
				$dom.parents(`#${_this.config().id}`).find(".hc_row" + num).addClass("hc_rowmark");
			} else {
				$dom.parents(`#${_this.config().id}`).find(".hc_row" + num).removeClass("hc_rowmark");
			}
		}

		//チェック時 列
		$modal.on("click", ".hc_col_check", function() { checkCol($(this), $(this).parents(".th_col").attr("col")); });

		function checkCol($dom, num) {
			_this.resetSetting();
			if ($dom.prop("checked")) {
				$(".hc_col" + num).addClass("hc_colmark");
			} else {
				$(".hc_col" + num).removeClass("hc_colmark");
			}
		}

		//行設定
		$modal.on("click", ".hc_row_setting", function() {

			_this.resetSetting();
			if (!$(this).find(".hc_row_setting_area").is(":visible")) {
				$(this).find(".hc_row_setting_area").fadeIn();
				$table.append('<div class="hc_table_overlay"></div>');
			}
		});

		//列設定
		$modal.on("click", ".hc_col_setting", function() {

			_this.resetSetting();
			if (!$(this).find(".hc_col_setting_area").is(":visible")) {

				$(this).find(".hc_col_setting_area").fadeIn().css("margin-left", $(".th_col").eq(0).width() / 2);
				$table.append('<div class="hc_table_overlay"></div>');
			}
		});

		//オーバーレイクリック
		$modal.on("click", ".hc_table_overlay", function() {
			_this.resetSetting();
		});
	},
	resetSetting: function() {

		//行列の設定隠す
		$(".hc_col_setting_area").fadeOut();
		$(".hc_row_setting_area").fadeOut();
		//オーバー削除
		$(".hc_table_overlay").remove();
	},
	getTag: function($modal) {

		var _this = this;

		var r = $modal.find(".hc_table").attr("row");
		var c = $modal.find(".hc_table").attr("col");

		var param = _this.getParam($modal.find(".hc_table"));
		var html = _this.createTable(r, c, param, false);

		return html;
	},
	createTable: function(row, col, param, editble) {

		var _this = this;
		var tag = `<table class="hc_table" row="${row}" col="${col}">`;

		// 列編集エリア
		if (editble === true) {
			tag += `<tr>`;
			tag += `<th>&nbsp;</th>`;
			for (var c = 1; c <= col; c++) {
				tag += _this.setColSetting(c);
			}
			tag += `</tr>`;
		}

		var i = 1
		for (var r = 1; r <= row; r++) {

			var rc = new Function("a", "b", "var x = a+b; return x;") ("row", r);
			var rcc = param[rc];
			if (param[rc] === undefined) {
				rcc =  `hc_row hc_row${r}`;
			}
			tag += `<tr class="${rcc}" row="${r}">`;

			// 行編集エリア
			if (editble === true) {
				tag += _this.setRowSetting(r);
			}

			for (var c = 1; c <= col; c++) {

				var cell = new Function("a", "b", "c", "d", "var x = a+b+c+d; return x;") ("cell", r,"_",c);
				var cc = new Function("a", "b", "var x = a+b; return x;") ("col", c);
				var ccc = `hc_col hc_col${c} hc_cell hc_cell${r}_${c}`;
				var mark = /hc_colmark/;
				var cm1 = $(".hc_" + cell).hasClass("hc_colmark");
				var cm2 = mark.test(param[cc]);
				if (cm1 === true || cm2 === true) {
					ccc = `hc_col hc_col${c} hc_cell hc_cell${r}_${c} hc_colmark`;
				}

				tag += `<td class="${ccc}" col="${c}">`;

				var text = (param[cell] !== undefined) ? param[cell] : "";
				// 編集のとき
				if (editble === true) {

					tag += `<div contenteditable="true" name="hc_cell_form[]" tabindex="${r*c*i}">${text}</div>`;

				// ぶち込むとき
				} else {

					tag += ($(text).html() != "" && $(text).html() !== undefined) ? $(text).html() : "";
				}
				tag += `</td>`;
			}

			tag += `</tr>`;
			i++;
		}
		tag += `</table>`;
		return tag;
	},
	setRowSetting: function(r) {

		var row = ``;
		row += `<th class="th_row th_row${r}" row="${r}">`;
		row += `<div class="hc_row_setting">`;
		row += `<span>‥</span>`;
		row += `<div class="hc_row_setting_area">`;
		row += `<label>`;
		row += `<span><input type="checkbox" name="hc_row[]" id='hc_row_check${r}' class="hc_row_check"></span>`;
		row += `<span>行マーク切替</span>`;
		row += `</label>`;
		row += `<label>`;
		row += `<span>×</span>`;
		row += `<span class="hc_del_row">行を削除</span>`;
		row += `</label>`;
		row += `</div>`;
		row += `</div>`;
		row += `</th>`;
		return row;
	},
	setColSetting: function(c) {

		var col = ``;
		col += `<th class="th_col th_col${c}" col="${c}">`;
		col += `<div class="hc_col_setting">`;
		col += `<span>‥</span>`;
		col += `<div class="hc_col_setting_area">`;
		col += `<label>`;
		col += `<span><input type="checkbox" name="hc_col[]" id='hc_col_check${c}' class="hc_col_check"></span>`;
		col += `<span>列マーク切替</span>`;
		col += `</label>`;
		col += `<label>`;
		col += `<span>×</span>`;
		col += `<span class="hc_del_col">列を削除</span>`;
		col += `</span>`;
		col += `</label>`;
		col += `</div>`;
		col += `</div>`;
		col += `</th>`;
		return col;
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

		var datas = {};

		var row = $(dom).attr("row");
		var col = $(dom).attr("col");
		var rc;
		var rClass;
		var cClass;
		datas.row = row;
		datas.col = col;
		for (r=1;r<=row;r++) {

			rClass = $(dom).find("tr.hc_row" + r).attr("class");
			datas["row" + r] = (rClass === undefined) ? "" : rClass;

			for (c=1;c<=col;c++) {

				rc = r + "_" + c;
				datas["cell" + rc] = $(dom).find(".hc_cell" + rc).html();
				cClass = $(dom).find(".hc_cell" + rc).attr("class");
				datas["col" + c] = (cClass === undefined) ? "" : cClass;
			}
		}
		return datas;
	}
}