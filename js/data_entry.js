// DHIS2 LMIS ORDER/REPORT APP. UiO - MAGNUS LI 2017. 
// DATA ENTRY PAGE HANDLER 


var facilityId = getParameterFromURLByName("facility");
var cycleId = getParameterFromURLByName("cycle");
var formId = getParameterFromURLByName("form");
var sectionId = getParameterFromURLByName("section");
if (isUndefinedOrNull(facilityId, cycleId, formId, sectionId)) navigateToAddress("index.html"); //Handle errors in URL-parameters

var facility = LS.getFacilityById(facilityId);
var form = getFormById(getCycleById(facility, cycleId), formId);
var section = getSectionById(form, sectionId);

if (isUndefinedOrNull(facility, section, form)) navigateToAddress("index.html"); //handle errors in LS lookup. 

//if edit not allowed (based on completion and approval status, user rights): navigate to form summary
if (!editIsAllowed(form, "temp")) {
	$("body").hide();
	navigateToAddress("form_summary.html?facility=" + facilityId + "&cycle=" + cycleId + "&form=" + formId)	
}

generateMainMenu(); //located in scripts.js
var singleCommodityEdit = getParameterFromURLByName("single")
var commodityId = getParameterFromURLByName("commodityId")
var unsolvedErrors = false; //in use for validation to prevent navigation way from commodity with errors. 

if (isUndefinedOrNull(singleCommodityEdit)) {
	initMultipleCommodityMode();
} else {
	initSingleCommodityMode();
}

var currentExpandedCommodity;

//initialise gui for single entry
function initSingleCommodityMode() {
	$("#section_title").text("Edit commodity");
	generateCommodityList(sectionId, commodityId);
	$("#save_continue_button").css("display", "none");
	$("#save_commodity_button").text("Save and go back to summary");
	$(".not_applicable_wraper").css("right", 300);
	currentExpandedCommodity = $("li");
	expandOrMinimizeListElement(currentExpandedCommodity);
}
//initialise gui for multiple entry 
function initMultipleCommodityMode() {
	setsectionHeader(sectionId);					
	configureCompleteButton();
	generateCommodityList(sectionId);

	//Expand next uncompleted commodity. undefined-check to avoid error when revisit after all commodities have been completed
	if (typeof lastCompletedCommodity !== 'undefined') {
		currentExpandedCommodity = $("#" + getId(getLastCompletedCommodity(getSectionById(form, sectionId))));
	} else {
		currentExpandedCommodity = $("li");
	}
	expandCurrentCommodity();
}

function expandCurrentCommodity() {
	var commodity = getLastCompletedCommodity(getSectionById(form, sectionId));
	
	if (typeof commodity !== 'undefined') {
		var listElement = $("#" + getId(commodity));
		expandOrMinimizeListElement(listElement);
		currentExpandedCommodity = (listElement[0]);
	} else {
		$("#save_continue_button").css("display","inline-block"); //show save and continue button
		setArrowPosition($("#save_continue_button")[0]);
	}
}

function styleCompletedCommodity(currentElement) {
	$(currentElement).addClass("completed_element"); //add style for completed element
}
//  #################### GENERATE LIST OF COMMODITIES IN GUI #############################
function generateCommodityList(sectionId, commodityId) {
	var commodityList = document.getElementById("commodity_list");
	if (!isUndefinedOrNull(singleCommodityEdit) && !isUndefinedOrNull(commodityId)) { //single commodity edit mode
		commodityList.appendChild(getNewListElement(getCommodityById(getSectionById(form, sectionId), commodityId)));

	} else {	//Multiple commodity input mode
		var commodities = getCommodities(getSectionById(form, sectionId));
		for (i = 0; i < commodities.length; i++) {
			var li = getNewListElement(commodities[i])
			commodityList.appendChild(li);
			if (isCompleted(commodities[i])) styleCompletedCommodity(li);
		}
	}
}

// generates and returns new list element (form for one commodity)
function getNewListElement(commodity) {

	//Create element title and add text
	var title = document.createElement("H3")
	$(title).text(getName(commodity));
	//Create explanationText element and add text  (combining baseUnit and explanation in one p)
	var explanationText = document.createElement("P")
	
	if (hasExplanationText(commodity)) {
		$(explanationText).append(getExplanationText(commodity) + "<br><br>");
	}
	if (hasBasicUnit(commodity)) {
		$(explanationText).append("<b>Basic Unit:</b> " + getBasicUnit(commodity));
	} 

	var notApplicableBox = getNotApplicableBox();
	
	var button = getValidateButton();
	
	var form = getDataEntryForm(commodity); //get input form generated based on the elements defined data elements
	
	//Create expandable detail element and append content
	var detailElement = document.createElement("SECTION");
	$(detailElement).addClass("expandable_data_entry");
	$(detailElement).append(explanationText, form, notApplicableBox, button); //add content to details section (expandable section)
	
	//create list element and append content
	var listElement = document.createElement("LI");
	$(listElement).attr("id", getId(commodity));
	$(listElement).append(title, detailElement); //add content to list elemen
	
	if (!isApplicable(commodity)) {
		console.log();
		$($(notApplicableBox).find(":checkbox")[0]).prop("checked", "checked");
		$(listElement).find(".data_element_input").attr("disabled", "true");
	}
	
	return listElement;
}

function getValidateButton() {
	var button = document.createElement("BUTTON");
	$(button).text("Validate and go to next");
	$(button).attr("tabindex", "0");
	$(button).attr("id", "save_commodity_button");
	return button;
}
function getNotApplicableBox(commodity, listElement) {
	var notApplicableCheckbox = document.createElement("INPUT");
	$(notApplicableCheckbox).attr("type", "checkbox");
	$(notApplicableCheckbox).attr("tabindex", "-1");
	$(notApplicableCheckbox).attr("id", "not_applicable_checkbox");
	var notApplicableWrapper = document.createElement("DIV");
	$(notApplicableWrapper).addClass("not_applicable_wraper");
	attachTooltip(notApplicableWrapper, "Check if this item is not applicable for this facility");
	//handle not applicable checking
	$(notApplicableWrapper).on("click", function(e) {
		var checkbox = $(e.target).find("#not_applicable_checkbox");
		checkbox.prop("checked", !checkbox.prop("checked")); 
		styleCommodityToNotApplicable(checkbox);
	});
	$(notApplicableCheckbox).change("click", function(e) {
		var checkbox = $(e.target);
		styleCommodityToNotApplicable(checkbox);
	});

	$(notApplicableWrapper).append(notApplicableCheckbox, "Not applicable");
	return notApplicableWrapper;
}

//Generates and returns form for commodity with data elements
function getDataEntryForm(commodity) {
	var dataElements = commodity.dataElements;
	var form = document.createElement("FORM");
	
	//add hidden submit-button to trigger html5 validation messages on save
	var submit = document.createElement("INPUT");
	$(submit).css("display", "none");
	$(submit).attr("type", "submit");
	$(form).append(submit);
	
	//add data element input fields
	for (var i = 0; i < dataElements.length; i++) {
		var label = document.createElement("LABEL");
		var input = document.createElement("INPUT");
		$(input).addClass("data_element_input");
		$(input).val(getValue(dataElements[i]));
		
		var section = document.createElement("SECTION");
		$(section).addClass("data_element_input_pair");

		
		if (dataElements[i].required) {
			$(input).prop('required', true);
		}
		
		//set tool-tip descriptions
		if (hasDescription(dataElements[i])) attachTooltip(section, getDescription(dataElements[i]));

		
		//if data element is auto-calculated
		if (isCalculated(dataElements[i])) {
			$(input).prop('disabled', true);
			$(input).css('border', "1px dashed grey");
			$(input).addClass("calculated_input");
			$(input).prop('required', false);
			
			//set/add tooltip
			var description = "";
			if (hasDescription(dataElements[i])) description = getDescription(dataElements[i]);
			attachTooltip(section, description + " (auto calculated)");
		}
		
		//get data from defined element in previous cycle (for example previous closing balance to place in current opening balance)
		if (getDataFromElementInPreviousCycle(dataElements[i])) {
			try {
				var IdOfElementToGet = getDataFromElementInPreviousCycle(dataElements[i]);
				var dataElement = getDataElementFromCycle(getPreviousCycle(cycleId), formId, sectionId, getId(commodity), IdOfElementToGet);
				$(input).val(getValue(dataElement));
			} catch (error) {console.log("Could not get data from previous cycle")};
		}

		$(input).prop('type', getType(dataElements[i]));
		$(input).prop('step', '1');
		
		$(label).text(getName(dataElements[i]));
		$(label).attr('for', getName(dataElements[i]));
		$(input).attr('name', getName(dataElements[i]));
		$(input).attr('id', "de_" + getId(dataElements[i]));
		
		//If notes
		if (getName(dataElements[i]) == "Notes") {
			$(section).addClass("notes");
		}
		
		$(section).append(label, input);
		$(form).append(section);
	}

	return form;
}


//Generating and placing arrow
function setArrowPosition(section) {
	$("#arrow_icon").css("display", "block");
	var lemTop = $(section).position().top;
	var lemLeft = $(section).position().left;
	$("#arrow_icon").animate({
		top: (lemTop - 10),
		left: (lemLeft - $("#arrow_icon").width())
	}, 250, function() {
	}); 

}

//##########################  functions handling expanding and minimizing commodities ##################
function expandOrMinimizeListElement(element) {
	if ($(element).height() <= 40) {
		minimizeListElement(currentExpandedCommodity);
		expandListElement(element);
		setArrowPosition(element);
	} else {
		minimizeListElement(element);
	}
}
function expandListElement(element) {
	$(element).addClass("current_element");
	$(element).find(".expandable_data_entry").css("display","block");
	$(element).css("opacity","0.5");
	$(element).animate({
		opacity: "1"
	}, 250, function() {
		// Animation complete.
	}); 
	currentExpandedCommodity = element;
	var firstDataElementInput = $($(element).find(".data_element_input"))[0];
	console.log(firstDataElementInput);
	$(firstDataElementInput).focus();
}

function minimizeListElement(element) {
	$(element).removeClass("current_element");
	$(element).find(".expandable_data_entry").css("display","none");
	$('html, body').animate({
      scrollTop: ($(element).offset().top - 80)
    }, 2);
}

function configureCompleteButton() {
	$("#save_continue_button").on("click", function () {
		tryToCompleteSection();
	});
}

function tryToCompleteSection() {
	if (singleCommodityEdit || allCommoditiesCompleted(section)) {
		setToCompleted(getSectionById(form, sectionId));
		LS.updateFacility(facility);
		if (!singleCommodityEdit) navigateToAddress("form_overview.html?facility=" + facilityId + "&cycle=" + cycleId + "&form=" + formId);
	} else {
		alert("All commodities need to be completed in order to complete the section");
	}
}

function configureBackButton () {
	$("#back_button").attr("href", "form_overview.html?facility=" + facilityId + "&cycle=" + cycleId + "&form=" + formId);
}

function setsectionHeader(sectionNumber) {
	$("#section_title").text(getName(getSectionById(form, sectionNumber)));
}

//######### SAVE COMMODITY TO OBJECT  ###############

function saveCommodity(id, currForm, notApplicable) {
	var inputFields = $(currForm).find("input").not(":submit");

	section = getSectionById(form, sectionId);
	commodity = getCommodityById(section, id);
	dataElements = commodity.dataElements;
	
	//ADD VALUES FROM USER INPUT TO OBJECT 
	if (notApplicable) {
		setToNotApplicable(commodity);
	} else {
		for (var i = 0; i < dataElements.length; i++) {
			setValue(dataElements[i], inputFields[i].value);
		}
	}
	setToCompleted(commodity);
	LS.updateFacility(facility);
}



//Event-listener on the commodity list to expand  / minimize list elements
$("#commodity_list").on("click", "li", function(e) {
	
    if (e.target.className != "error_message" && e.target == this || e.target.tagName == "H3") {
		if (!unsolvedErrors && isCompletedHTML(this) && !isExpandedHTML(this)) expandOrMinimizeListElement(this);
	}
});

function isCompletedHTML(element) {
	return $(element).hasClass("completed_element");
}
function isExpandedHTML (element) {
	return $(element).hasClass("current_element");
}



function styleCommodityToNotApplicable(checkbox) {	   
	if (checkbox.prop("checked")) {
		$(currentExpandedCommodity).find(".data_element_input").val("");
		$(currentExpandedCommodity).find(".data_element_input").attr("disabled", "true");
	} else {
		$(currentExpandedCommodity).find(".data_element_input").val("");
		$(currentExpandedCommodity).find(".data_element_input").not(".calculated_input").removeAttr("disabled");
	}
}

//Event listener for complete commodity button
$("#commodity_list").on("click", "button", function() {
	
	validateCommodityClickHandler(this);
	
});

function validateCommodityClickHandler(button) {
	//SAVE COMMODITY
	var currentElement = button.parentElement.parentElement;
	console.log(currentElement);
	var commodityId = $(currentElement).attr("id")
	
	var currentForm = $(currentElement).find("form")[0];
	var notApplicable = $(currentElement).find("#not_applicable_checkbox").is(':checked');
	var errorMessages = validateCommodityInput(commodityId, currentForm);
	//run validation
	if (notApplicable || errorMessages.length == 0){
			unsolvedErrors = false;
			clearValidationMessages();
			
			saveCommodity(commodityId, currentForm, notApplicable);
		
			//WHEN SINGLE EDIT MODE --> NAVIGATE BACK TO SUMMARY
			if (singleCommodityEdit) {
				navigateToAddress("form_summary.html?facility=" + facilityId + "&cycle=" + cycleId + "&form=" + formId + "&section=" + sectionId);
			}
			styleCompletedCommodity(currentElement); //set styles
			
			$(currentElement).css("border-color", "");			
			//Minimize this element and expand next
			expandOrMinimizeListElement(currentElement);
			expandCurrentCommodity();
	} else {
		unsolvedErrors = true;
		displayValidationErrorMessages(button.parentElement, errorMessages);
	}
}

//HANDLE ENTER-CLICK TO TRIGGER VALIDATE BUTTON CLICK
$(document).keypress(function(e) {
	if(e.which == 13) { //13 = enterbutton
		e.preventDefault();
		try {
			var button = $($(".current_element")[0]).find("button")[0];
			validateCommodityClickHandler(button);
		} catch (error) {
			tryToCompleteSection();
		}

    }
});

function clearValidationMessages() {
	$("#error_messages").remove();
}
function displayValidationErrorMessages(HTMLelement, messages) {
	clearValidationMessages();
	var listElement = HTMLelement.parentElement;
	$(listElement).css("border-color", "#D9534F");
	var errorElement = document.createElement("OL");
	$(errorElement).attr("id", "error_messages");
	$(HTMLelement).append(errorElement);
	$(errorElement).append("<h2>Data entry errors:</h2>");
	$(HTMLelement).find("button").css("margin", "40px");
	for (var i = 0; i < messages.length; i++) {
		$(errorElement).append("<li class='error_message'>" + (i+1) + ". " + messages[i] + "</li>");
	}
}
function displayValidationWarningMessages(HTMLelement, messages) {
	var errorElement = document.createElement("OL");
	$(errorElement).attr("id", "warning_messages");
	$(HTMLelement).append(errorElement);
	$(errorElement).append("<h2>Data entry warnings:</h2>");
	for (var i = 0; i < messages.length; i++) {
		$(errorElement).append("<li class='error_message'>" + messages[i] + "</li>");
	}
}

//Border when input-field is in focus. 
$("input").not(":checkbox").focus("input", function(e) {
	$(this).parent().css("border", "2px solid green");
});
$("input").not(":checkbox").focusout("input", function(e) {
	$(this).parent().css("border", "");
});

// temp indicator autocalc handler. --> see program_indicator_handler.js
$("input").keyup(function () {
	calculateAndPrintIndicators("temp", $("input").filter(":visible"));
});


