jQuery(document).ready(function($) {
	$("#charpter ul").toc(
        "selectors": "h1,h2,h3",
        "container": "#post",
        "smoothScrolling": true,
        "prefix": "toc",
        "anchorName": function (i, heading, prefix) {
            return prefix + i;
        }
	);
});
