

function showHelpAside() {
	var helpElement = document.createElement("ASIDE");
	$(helpElement).attr("id", "help_aside");
	$(helpElement).width("30%");
	$(helpElement).height("100vh");
	$(helpElement).css("position", "fixed");
	$(helpElement).css("background-color", "white");
	$(helpElement).css("border-left", "3px solid #276696");
	$(helpElement).css("top", $("#main_header").height());
	$(helpElement).css("right", "0");

	$(helpElement).append("<h1>Help</h1>");
	$(helpElement).append('<iframe src="help.html?page=test"></iframe>');
	$("main").css("width", "70%");
	$("body").append(helpElement);
	console.log($("body"));
	
}
function hideHelpAside() {
	$("#help_aside").remove();
	$("main").css("width", "");
}


function helpAsideIsOpen() {
	return $("#help_aside").length;
}