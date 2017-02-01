var asideMode = getParameterFromURLByName("asideMode");
var page = getParameterFromURLByName("page");

if (asideMode) initialiseAsideMode();
loadHelpContent(page);

function initialiseAsideMode() {
	$("#main_header").remove();
}

function loadHelpContent(page) {
	console.log(page);
	if (!isUndefinedOrNull) $("#help_content").append('<iframe src="content/' + page + '"></iframe>');

}
