function getParam(name) {
	//from http://www.netlobo.com/url_query_string_javascript.html
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	if (!results) {
		return "";
	} else {
		return decodeURIComponent(results[1]);
	}
}