<?php
	// 保存先
	define("UPLOAD_PATH", "./temp/");

	// DB保存用
	$datas = array();
	// ファイルアップロード用
	$files = array();
	// POST名
	$trdb = "Description3";
	// 以外を削除
	$notDeteleFiles = array();

	$ItemNo = 1;
	foreach ($_POST[$trdb] as $i => $val) {

		$fileName = $_POST[$trdb."_FileName"][$i];
		$notDeteleFiles[] = $fileName;

		$datas[] = array(
			"ItemNo" => $ItemNo,
			$trdb => $val,
			$trdb."_Caption" => $_POST[$trdb."_Caption"][$i],
			$trdb."_PageLink" => $_POST[$trdb."_PageLink"][$i],
			$trdb."_FileName" => $fileName,
		);

		if ($_FILES[$trdb."_File"]["name"][$i]) {

			$files[] = array(
				"ItemNo" => $ItemNo,
				$trdb."_File_Temp" => $_FILES[$trdb."_File"]["tmp_name"][$i],
				$trdb."_File_Name" => $_FILES[$trdb."_File"]["name"][$i],
			);
		}
		$ItemNo++;
	}
	// データ保存
	foreach ($datas as $key => $arr) {

		$view = new stdClass;
		$view->Comment = $arr[$trdb];
		$view->Caption = $arr[$trdb."_Caption"];
		$view->IsCheck = $arr[$trdb."_PageLink"];
		$view->AttachedFile = $arr[$trdb."_FileName"];
		var_dump($view);
	}

	// ファイルをアップロード
	foreach ($files as $i => $arr) {

		// アップロードするファイル名
		$target = UPLOAD_PATH.$arr[$trdb."_File_Name"];
		// ファイルアップロード
		if (move_uploaded_file($arr[$trdb."_File_Temp"], $target)) {
			chmod($target, 0666);
		}

		// 指定以外のファイル削除
		$pattern = "/" . implode("|", $notDeteleFiles) . "/";
		deleteFileMatch($paths["org"]["path"], $pattern, false);
	}

	$temps = getDirArray(UPLOAD_PATH);
	var_dump($temps);

	function deleteFileMatch($dir, $pattern, $isMatch = true) {
		$dir = rtrim($dir,"/")."/";
		$ret = 0;
		if ($handle = @opendir($dir)) {
			while (($file = readdir($handle)) !== false) {
				if ($file != "." && $file != "..") {
					if ($isMatch) {
						if (preg_match("{$pattern}", $file)) {
							unlink("{$dir}{$file}");
							$ret++;
						}
					} else {
						if (!preg_match("{$pattern}", $file)) {
							unlink("{$dir}{$file}");
							$ret++;
						}
					}
				}
			}
			closedir($handle);
		}

		return $ret;
	}

	function getDirArray($dirPath) {
		$files = array();
		if ($handle = @opendir($dirPath)) {
			while (($file = readdir($handle)) !== false) {
				if ($file != "." && $file != ".." && $file != ".htaccess") {
					$row["filename"] = $file;
					$row["url"] = rawurlencode($file);
					$row["updated"] = filemtime($dirPath.$file);
					$row["size"] = filesize($dirPath.$file);
					$files[] = $row;
				}
			}
		}
		if (count($files) > 0) {
			foreach ($files as $key => $row) {
				$filename[$key]  = $row["filename"];
				$url[$key] = $row["url"];
				$updated[$key] = $row["updated"];
				$size[$key] = $row["size"];
			}
			array_multisort($filename, SORT_ASC, $files);
		}
		return $files;
	}
?>