checkIfChrome();

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


//returns parameter from url based on given name (?example=test)
function getParameterFromURLByName(name) {
    url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
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

//takes array of variables and check for undefined and null
function isUndefinedOrNull() {
	for (var i = 0; i < arguments.length; i++) {
		if (typeof arguments[i] == 'undefined' || arguments[i] == null) return true;
	}
	return false;
}