//GENERIC CROSS-FILE SCRIPTS 

checkIfChrome();


//to generate and configure main menu on top-right corner of all pages. Called from each page individualy. 
function generateMainMenu() {
	var facilityId = getParameterFromURLByName("facility");
	var mainMenu = $("#main_menu");
	if (elementExist(mainMenu)) {
		if (!isUndefinedOrNull(facilityId)) {
			$(mainMenu).append('<a tabindex="-1" href="dashboard.html#facility=' + facilityId + '"><i class="fa fa-home" aria-hidden="true"></i>' + getName(facility) + '</a>');
		}
		$(mainMenu).append('<a tabindex="-1" href="index.html"><i class="fa fa-list-ul" aria-hidden="true"></i></i>All facilities</a>');
		
		var helpLink = document.createElement("A");
		$(helpLink).attr("id", "help_link");
		$(helpLink).append('<a tabindex="-1" href="help/index.html"><i class="fa fa-question-circle" aria-hidden="true"></i>Help</a>');
		$(mainMenu).append(helpLink);
	}
}

function checkIfChrome() {
	if(!/chrom(e|ium)/.test(navigator.userAgent.toLowerCase())){
		console.log("Not using Chrome, give error-message");
		var element = document.createElement("DIV");
		$(element).css("position", "fixed");
		$(element).css("height", "100vh");
		$(element).css("width", "100vw");
		$(element).css("background-color", "white");
		$(element).css("top", "0");
		$(element).css("left", "0");
		$(element).append("<h1>This application is only supported in Google Chrome. Switch browser and try again</h1>");
		$("body").append(element);
	}
}

function attachTooltip(element, text) {
	$(element).addClass("tooltip");
	$(element).attr("data-tip", text);
	return element;
}

//returns parameter from url based on given name (#example=test)
function getParameterFromURLByName(name) {
    url = window.location.href;
	//url = url.replace('#','');
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[#]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function URLContainsParameter(param) {
	return !isUndefinedOrNull(getParameterFromURLByName(param));
}

function getFileNameFromURL() {
	var url = window.location.pathname.split('/');
	return (url[url.length-1]);
}

// JQUERY function that returns an object containing all input fields from form as attributes
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
 

function navigateToAddress(address) {
	window.location.href = address;
}

function redirectIfEditIsDenied(form) {
	if (!editIsAllowed(form, "temp")) { //temp - add real user object
		$("body").hide();
		navigateToAddress("form_summary.html#facility=" + facilityId + "#cycle=" + cycleId + "#form=" + formId)	
	}
}

//takes array of variables and check for undefined and null
function isUndefinedOrNull() {
	for (var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] == 'undefined' || arguments[i] == null) return true;
	}
	return false;
}

function elementExist(element) {
	return $(element).length;
}
function isDefined(variable) {
	return (typeof variable != 'undefined' || variable != null);
}

/* GENERIC POPUP MESSAGE BOX */
var msgBoxOpen = false;

function showMessageBox(html, closeEvent) {
	msgBoxOpen = true;
	
	var background = document.createElement("DIV");
	$(background).attr("id", "popup_msgbox_background");
	
	var box = document.createElement("SECTION");
	$(box).attr("id", "popup_msgbox");
	$(box).append(html);
	
	var close = document.createElement("P");
	$(close).html('<i id="close_msgbox" class="fa fa-window-close-o" aria-hidden="true"></i>')
	
	$(close).click(function() {
		if (isDefined(closeEvent)) closeEvent();
		closeMessageBox(background);
	});
	
	addKeyboardEnterClickEvent(function() {
		closeMessageBox(background);
	});
	
	
	$(box).append(close);
	$(background).append(box);
	$("body").append(background);
}
function showConfirmBox(html, yes, no) {
	msgBoxOpen = true;
	
	var background = document.createElement("DIV");
	$(background).attr("id", "popup_msgbox_background");
	
	var box = document.createElement("SECTION");
	$(box).attr("id", "popup_msgbox");
	$(box).append(html);
	
	var yesButton = document.createElement("BUTTON");
	$(yesButton).text("Yes");
	$(yesButton).click(yes);

	var noButton = document.createElement("BUTTON");
	$(noButton).text("No");
	if (isUndefinedOrNull(no)) {
		$(noButton).click(function () {
			closeMessageBox(background);
		});		
	} else {
		$(noButton).click(no);
	}

	addKeyboardEnterClickEvent(function() {
		yes();
	});
	
	$(box).append(yesButton);
	$(box).append(noButton);
	$(background).append(box);
	$("body").append(background);
}
function closeMessageBox(box) {
	msgBoxOpen = false;
	
	$(box).remove();
	$("main").css("opacity", "1");
}

function addKeyboardEnterClickEvent(func) {
	$(document).keypress(function(e) {
		if(e.which == 13) { //13 = enterbutton
			func();
		}
    });
}

function showWaitingScreen(message) {
	if (isUndefinedOrNull(message)) var message = "Loading data from server. Please wait...";
	var waitingElement = document.createElement("DIV");
	$(waitingElement).attr("id", "waiting_screen");
	$(waitingElement).append('<div class="loader">Loading data...</div>');
	$(waitingElement).append("<p>" + message + "</p>");
	$("body").append(waitingElement);
	//$("main").not("#main_header").hide();
}
function hideWaitingScreen() {
	setTimeout(function() {
		$("#waiting_screen").remove();
	}, 10);
}

function getFullDate(oldDate){
    var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var months = ["January","February","March","April","May","June","July", "August", "September", "October", "November", "December"];
    var date = new Date(oldDate)
    var weekday = days[date.getDay()]
    var month = months[date.getMonth()]
    var day = parseInt(date.getDate())
    if (day==1){
        day = day + 'st'
    } else if(day==2){
        day = day + 'nd'
    } else if(day==3){
        day = day + 'rd'
    } else {
        day = day + 'th'
    }
    var year = parseInt(date.getFullYear())

    var final_date = weekday + ' ' +  month + " " + day + " " + year
    return final_date
}

function getFullDateNoDayNoYear(oldDate){
    var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var months = ["January","February","March","April","May","June","July", "August", "September", "October", "November", "December"];
    var date = new Date(oldDate)
    var weekday = days[date.getDay()]
    var month = months[date.getMonth()]
    var day = parseInt(date.getDate())
    if (day==1){
        day = day + 'st'
    } else if(day==2){
        day = day + 'nd'
    } else if(day==3){
        day = day + 'rd'
    } else {
        day = day + 'th'
    }

    var final_date = month + " " + day
    return final_date
}

function getCurrentDateISO() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!

	var yyyy = today.getFullYear();
	if(dd<10){
		dd='0'+dd;
	} 
	if(mm<10){
		mm='0'+mm;
	} 
	return yyyy+'-'+mm+'-'+dd;
}