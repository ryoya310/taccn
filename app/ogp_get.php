<?php
	header("Content-type: application/json; charset=utf-8");

	// http://kin-katsu.firstinc.jp/assets/js/taccn/app/ogp_get.php

	$ogp_url = isset($_POST["ogp_url"]) ? $_POST["ogp_url"] : "";
	$ogp_time = isset($_POST["ogp_time"]) ? $_POST["ogp_time"] : "";

	function setOgp($url, $time, $title, $imege, $description) {

		$html = array();

		$html[] = sprintf('<div class="ogpBox" data-time="%s" data-url="%s">', $time, rawurlencode($url));

		$html[] = sprintf('<a href="%s" target="_blank" class="ogpBox-link %s">', $url, hash("sha256", rawurlencode($url)));

		$header_params = @get_headers($imege);

		if ($header_params !== false && !preg_match('#^HTTP/.*\s+[404]+\s#i', $header_params[0])) {
			$html[] = sprintf('<div class="ogpBox-image">');
			$html[] = sprintf('<img src="%s" loading="lazy" width="100" height="75">', $imege);
			$html[] = sprintf('</div>');
		}

		$html[] = sprintf('<div class="ogpBox-info">');
		$html[] = sprintf('<div class="ogpBox-info-title">%s</div>', $title);
		$html[] = sprintf('<div class="ogpBox-info-description">%s</div>', $description);
		$html[] = sprintf('<div class="ogpBox-info-url">%s</div>', preg_replace("/http(s):\/\//", "", $url));
		$html[] = sprintf('</div>');

		$html[] = sprintf('</a>');
		$html[] = sprintf('</div>');
		return implode("", $html);
	}

	$ret = array(
		"url" => $ogp_url,
		"title" => "",
		"image" => "",
		"name" => "",
		"description" => "",
		"error" => "",
	);

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $ogp_url);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_HEADER, true);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($ch, CURLOPT_ENCODING, "gzip");
	$html = curl_exec($ch) or $ret["error"] = curl_error($ch);
	$html = preg_replace('/<meta[^>]*?charset[^>]*?>/uis', '', $html);
	$html = preg_replace('/<head[^>]*?>/uis', '<meta http-equiv="content-type" content="text/html; charset=utf-8">', $html);

	curl_close($ch);

	$dom = new DOMDocument;
	@$dom->loadHTML($html);
	$xpath = new DOMXPath($dom);

	$node_title = $xpath->query('//meta[@property="og:title"]/@content');
	$node_image = $xpath->query('//meta[@property="og:image"]/@content');
	$node_name = $xpath->query('//meta[@property="og:site_name"]/@content');
	$node_description = $xpath->query('//meta[@property="og:description"]/@content');

	if (
		$node_title->length > 0 &&
		$node_image->length > 0 &&
		$node_name->length > 0
	) {

		$ret["title"] = $node_title->item(0)->nodeValue;
		$ret["image"] = $node_image->item(0)->nodeValue;
		$ret["name"] = $node_name->item(0)->nodeValue;
		$ret["description"] = $node_description->item(0)->nodeValue;
		$ret["ogp_html"] = setOgp($ogp_url, $ogp_time, $ret["title"], $ret["image"], $ret["description"]);
	}

	echo json_encode($ret);
?>