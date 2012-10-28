jQuery(document).ready(function($) {
	$("#charpter ul").tableOfContents(
		$("#page"),
		{
			startLevel: 2,
			depth: 3
		}
	);
});