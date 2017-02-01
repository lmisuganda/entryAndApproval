var fileName = getFileNameFromURL();
showHelpAside(fileName); //TEMP

$("#help_link").on("click", function () {
	var fileName = getFileNameFromURL();
	if (helpAsideIsOpen()) {
		hideHelpAside();
		try { 
			adjustArrowPosition();
		}catch (e) {};
	} else {
		showHelpAside(fileName);
		try { 
			adjustArrowPosition();
		}catch (e) {};
	}
	
});

function showHelpAside(fileName) {
	var helpElement = document.createElement("ASIDE");
	$(helpElement).attr("id", "help_aside");
	$(helpElement).width("30%");
	$(helpElement).height("100vh");
	$(helpElement).css("position", "fixed");
	$(helpElement).css("background-color", "white");
	$(helpElement).css("border-left", "3px solid #276696");
	$(helpElement).css("top", $("#main_header").height());
	$(helpElement).css("right", "0");
	console.log(fileName);
	$(helpElement).append('<iframe src="help/index.html?asideMode=true&page=' + fileName + '"></iframe>');
	$("main").css("width", "70%");
	$("body").append(helpElement);
	
}
function hideHelpAside() {
	$("#help_aside").remove();
	$("main").css("width", "");
}


function helpAsideIsOpen() {
	return $("#help_aside").length;
}