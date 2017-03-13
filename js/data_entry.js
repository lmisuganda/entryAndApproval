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

redirectIfEditIsDenied(form); //if edit not allowed (based on completion and approval status, user rights): navigate to form summary

generateMainMenu(); //located in scripts.js

var singleCommodityEdit = getParameterFromURLByName("single");
var commodityId = getParameterFromURLByName("commodityId");
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
		setArrowPosition($("#save_continue_button")[0], -6);
	}
}

function styleCompletedCommodity(currentElement) {
	$(currentElement).addClass("completed_element"); //add style for completed element
	if (!$(currentElement).hasClass("not_applicable")) $(currentElement).find(".commodity_status_text").text("Completed");
}

function styleNotApplicableCommodity(listElement) {
	$(listElement).find(":checkbox").prop("checked", "checked");
	$(listElement).find(".data_element_input").attr("disabled", "true");
	$(listElement).addClass("not_applicable");
	$(listElement).find(".commodity_status_text").text("Not applicable");
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
		}
	}
}

// generates and returns new list element (form for one commodity)
function getNewListElement(commodity) {

	var listElement = document.createElement("LI");

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

	var notApplicableBox = getNotApplicableBox(listElement);

	var button = getValidateButton();

	var form = getDataEntryForm(commodity); //get input form generated based on the elements defined data elements

	//Create expandable detail element and append content
	var detailElement = document.createElement("SECTION");
	$(detailElement).addClass("expandable_data_entry");
	$(detailElement).append(explanationText, form, notApplicableBox, button); //add content to details section (expandable section)

	//create list element and append content
	$(listElement).attr("id", getId(commodity));

	var commodityStatus = document.createElement("P");
	$(commodityStatus).addClass("commodity_status_text");
	$(listElement).append(title, commodityStatus, detailElement); //add content to list elemen

	if (isCompleted(commodity)) {
		styleCompletedCommodity(listElement);
	}

	if (!isApplicable(commodity)) {
		styleNotApplicableCommodity(listElement);
	}

	//Event-listener  expand  / minimize list elements
	$(listElement).on("click", function(e) {
		if (e.target.className != "error_message" && e.target == this || e.target.tagName == "H3") {
			if (!unsolvedErrors && isCompletedHTML(this) && !isExpandedHTML(this)) expandOrMinimizeListElement(this);
		}
	});

	return listElement;
}

function getValidateButton() {
	var button = document.createElement("BUTTON");
	$(button).text("Validate and save");
	$(button).attr("tabindex", "0");
	$(button).attr("id", "save_commodity_button");

	$(button).on("click", function() {
		validateCommodityClickHandler(this);
	});

	return button;
}
function getNotApplicableBox(listElement) {
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
		toggleCommodityNotApplicableStyling(listElement);
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
		$(form).append(getDataElementInputPair(commodity, dataElements[i]));
	}

	return form;
}

function getDataElementInputPair(commodity, dataElement) {
	var label = document.createElement("LABEL");
	var input = document.createElement("INPUT");
	$(input).addClass("data_element_input");
	$(input).val(getValue(dataElement));

	var section = document.createElement("SECTION");
	$(section).addClass("data_element_input_pair");


	if (dataElement.required) {
		$(input).prop('required', true);
	}

	//set tool-tip descriptions
	if (hasDescription(dataElement)) attachTooltip(section, getDescription(dataElement));


	//if data element is auto-calculated
	if (isCalculated(dataElement)) {
		$(input).prop('disabled', true);
		$(input).css('border', "1px dashed grey");
		$(input).addClass("calculated_input");
		$(input).prop('required', false);

		//set/add tooltip
		var description = "";
		if (hasDescription(dataElement)) description = getDescription(dataElement);
		attachTooltip(section, description + " (auto calculated)");
	}

	//get data from defined element in previous cycle (for example previous closing balance to place in current opening balance)
	insertValueFromPreviousCycleIfRequired(input, dataElement, commodity);

	$(input).prop('type', getType(dataElement));
	$(input).prop('step', '1');

	$(label).text(getName(dataElement));
	$(label).attr('for', getName(dataElement));
	$(input).attr('name', getName(dataElement));
	$(input).attr('id', "de_" + getId(dataElement));

	addInputEventListeners(input);

	//If notes
	if (getName(dataElement) == "Notes") {
		$(section).addClass("notes");
	}

	$(section).append(label, input);
	return section;
}

function insertValueFromPreviousCycleIfRequired(input, dataElement, commodity) {
	if ($(input).val() == "" && !isCompleted(commodity) && getDataFromElementInPreviousCycle(dataElement)) {
		try {
			var IdOfElementToGet = getDataFromElementInPreviousCycle(dataElement);
			var prevDE = getDataElementFromCycle(getPreviousCycle(cycleId), formId, sectionId, getId(commodity), IdOfElementToGet);
			$(input).val(getValue(prevDE));
		} catch (error) {console.log("Could not get data from previous cycle")};
	}
}

function addInputEventListeners(input) {
	//Border when input-field is in focus.
	$(input).not(":checkbox").focus("input", function(e) {
		$(this).parent().css("border", "2px solid orange");
	});
	$(input).not(":checkbox").focusout("input", function(e) {
		$(this).parent().css("border", "");
	});

	// temp indicator autocalc handler. --> see program_indicator_handler.js
	$(input).keyup(function () {
		calculateAndPrintIndicators("temp", $("input").filter(":visible"));
	});
}

//Generating and placing arrow
function setArrowPosition(section, topMargin) {
	if (isUndefinedOrNull(topMargin)) var topMargin = 10;
	$("#arrow_icon").css("display", "block");
	var lemTop = $(section).position().top;
	var lemLeft = $(section).position().left;
	$("#arrow_icon").animate({
		top: (lemTop - topMargin),
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
	$(element).find(".commodity_status_text").hide();
	$(element).css("opacity","0.5");
	$(element).animate({
		opacity: "1"
	}, 250, function() {
		// Animation complete.
	});
	currentExpandedCommodity = element;
	var firstDataElementInput = $($(element).find(".data_element_input"))[0];
	$(firstDataElementInput).focus();
}

function minimizeListElement(element) {
	$(element).removeClass("current_element");
	$(element).find(".commodity_status_text").show();
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
		if (!singleCommodityEdit) navigateToAddress("form_overview.html#facility=" + facilityId + "#cycle=" + cycleId + "#form=" + formId);
	} else {
		showMessageBox("<p>All commodities needs to be validated and completed in order to complete section</p>");
	}
}

function configureBackButton () {
	$("#back_button").attr("href", "form_overview.html#facility=" + facilityId + "#cycle=" + cycleId + "#form=" + formId);
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
		setToApplicable(commodity);
		for (var i = 0; i < dataElements.length; i++) {
			setValue(dataElements[i], inputFields[i].value);
		}
	}
	setToCompleted(commodity);
	LS.updateFacility(facility);
}



function isCompletedHTML(element) {
	return $(element).hasClass("completed_element");
}
function isExpandedHTML (element) {
	return $(element).hasClass("current_element");
}



function toggleCommodityNotApplicableStyling(listElement) {
	var checkbox = $(listElement).find("#not_applicable_checkbox");
	if (checkbox.prop("checked")) {
		//$(currentExpandedCommodity).find(".data_element_input").val("");
		$(currentExpandedCommodity).find(".data_element_input").attr("disabled", "true");
		$(currentExpandedCommodity).addClass("not_applicable");
		$(currentExpandedCommodity).addClass("completed_element");
		$(currentExpandedCommodity).find(".commodity_status_text").text("Not applicable");
	} else {
		//$(currentExpandedCommodity).find(".data_element_input").val("");
		$(currentExpandedCommodity).find(".data_element_input").not(".calculated_input").removeAttr("disabled");
		$(currentExpandedCommodity).removeClass("completed_element");
		$(currentExpandedCommodity).removeClass("not_applicable");
		$(currentExpandedCommodity).find(".commodity_status_text").text("");
		setToUncompleted(getCommodityById(section, $(listElement).attr("id")));
		console.log("HEI");
	}
}


function validateCommodityClickHandler(button) {
	//SAVE COMMODITY
	var currentElement = button.parentElement.parentElement;
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
				navigateToAddress("form_summary.html#facility=" + facilityId + "#cycle=" + cycleId + "#form=" + formId + "#section=" + sectionId);
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
