var facilityId = getParameterFromURLByName("facility");
var cycleId = getParameterFromURLByName("cycle");
var formId = getParameterFromURLByName("form");
if (isUndefinedOrNull(facilityId, cycleId, formId)) navigateToAddress("index.html");

StorageHandler.downloadFormWithId(facilityId, cycleId, formId, initializeFormOverviewContent);

function initializeFormOverviewContent() {
	
	facility = StorageHandler.getFacility(facilityId);
	cycle = getCycleById(facility, cycleId);
	form = getFormById(cycle, formId);
	if (isUndefinedOrNull(facility, cycle, form)) navigateToAddress("index.html");

	redirectIfEditIsDenied(form); //if edit not allowed (based on completion and approval status, user rights) redirect to summary
	if (isCompleted(form)) openFormSummary();

	generateMainMenu(); //located in scripts.js
	setProgramTitleHeader(getName(form)); 
	generateSectionsList();
	
}


function refreshSectionsList() {
	$("#sections_list").html("");
	generateSectionsList();
}

function generateSectionsList() {
	var sectionsListElement = $("#sections_list");
	var sections = getSections(form);
	currentSectionNotSet = true;
	
	for (i = 0; i < sections.length; i++) {
		var elem = getNewListElement(sections[i]);
		sectionsListElement.append(elem);
		if (!isSectionCompleted(sections[i]) && currentSectionNotSet) {
			setToCurrentSection(elem);
			currentSectionNotSet = false;
		}
	}
	var elem = getLastListElement("Look over and complete form");
	sectionsListElement.append(elem);
	if (currentSectionNotSet) setToCurrentSection(elem);
	
	$(elem).click(function() {
		if (!$(elem).hasClass("current_section")) showMessageBox("All sections needs to be completed or marked as not applicable to continue");
	});
}

//generates a new LI-element containing given name
function getNewListElement(section) {
	var listElement = document.createElement("LI");
	$(listElement).attr("id", getId(section));
	var name = "<p>" + getName(section) + "</p>";

	var hiddenListSection = document.createElement("SECTION");
	var applicableElement = getNotApplicableBox(listElement);
	$(hiddenListSection).addClass("hidden_list_section");
	$(hiddenListSection).append(getSectionStartButton(section), getSectionSkipButton(section, listElement), applicableElement);
	
	if (isSectionCompleted(section)) { //If sections is already completed. Add styling
		styleAsCompleted(listElement);
		$(listElement).click(function() {
			openDataEntryForSection(getId(section));
		});
	}
	
	var statusElement = getSectionStatusElement(section);
	$(listElement).append(name, statusElement, hiddenListSection); //add content to list element

	if (!isApplicable(section)) {
		styleAsNotApplicable(listElement);
		$(listElement).unbind( "click" );
	}
	
	
	return listElement;
}

function getSectionStartButton(section) {
	var startEntryButton = document.createElement("A");
	if (dataEntryIsStartedInSection(section)) {
		buttonText = "Resume data entry";
	} else {
		buttonText = "Start data entry";
	}
	$(startEntryButton).text(buttonText);
	$(startEntryButton).on("click", function() {
		var sectionId = getId(section);
		openDataEntryForSection(sectionId);
	});
	return startEntryButton;
}

function getSectionSkipButton(section, listElement) {
	var skipButton = document.createElement("A");
	$(skipButton).addClass("skip_button");
	$(skipButton).text("Not applicable");
	$(skipButton).click(function(e) {
		toggleNotApplicable(section, listElement);
	});
	return skipButton;
}

function toggleNotApplicable(section, listElement) {	   
	if (!$(listElement).hasClass("not_applicable")) {
		showConfirmBox("<p>Are you sure the whole section is not applicable for this facility?</p>", function () {
			setToNotApplicable(section)
			setToCompleted(section);
			StorageHandler.saveForm(facility, form);
			refreshSectionsList();
			closeMessageBox($("#popup_msgbox_background"));
		}, function () {
			//her kommer godsakene
			closeMessageBox($("#popup_msgbox_background"));
		});
		
	} else {
		setToApplicable(section)
		setToUncompleted(section);
		LS.updateFacility(facility);
		refreshSectionsList();
	}
}

function styleAsCompleted(listElement) {
	$(listElement).addClass("completed_section"); 
	$($(listElement).find(".hidden_list_section")[0]).hide();
}
function styleAsNotApplicable(listElement) {
	$(listElement).addClass("not_applicable");
	$(listElement).find(".section_status").hide();
	var wrapper = $(listElement).find(".not_applicable_wraper");
	var checkbox = $(wrapper).find(":checkbox");
	$(listElement).append(wrapper);
	$(checkbox).prop("checked", "true");

}
function isNotApplicableElement(elem) {
	return (elem.tagName !== "DIV" && elem.tagName !== "INPUT");
}

function getSectionStatusElement(section) {
	var statusText = document.createElement("P");
	var completedCount = getCountOfCompletedCommoditiesInSection(section);
	if (completedCount == 0) return "<p></p>";
	$(statusText).addClass("section_status");
	$(statusText).html(getSectionStatusIcon(section) + "Entry of " + completedCount + " of " + getCountOfCommoditiesInSection(section) + " elements completed");
	return statusText;
}

function getNotApplicableBox(listElement) {
	var notApplicableCheckbox = document.createElement("INPUT");
	$(notApplicableCheckbox).attr("type", "checkbox");
	$(notApplicableCheckbox).attr("tabindex", "-1");
	$(notApplicableCheckbox).attr("id", "not_applicable_checkbox");
	
	var notApplicableWrapper = document.createElement("DIV");
	$(notApplicableWrapper).addClass("not_applicable_wraper");
	//attachTooltip(notApplicableWrapper, "Check if this section is not applicable for this facility");
	
	//handle not applicable checking
	$(notApplicableWrapper).on("click", function(e) {
		var checkbox = $(e.target).find("#not_applicable_checkbox");
		checkbox.prop("checked", !checkbox.prop("checked")); 
		toggleNotApplicable(getSectionById(form, $(listElement).attr("id")), listElement);
	});
	$(notApplicableCheckbox).change("click", function(e) {
		var checkbox = $(e.target);
		toggleNotApplicable(getSectionById(form, $(listElement).attr("id")), listElement);
	});

	$(notApplicableWrapper).append(notApplicableCheckbox, "Section not applicable");
	return notApplicableWrapper;
}



//handles navigation by enter button
$(document).keypress(function(e) {
	if(e.which == 13 && !msgBoxOpen) { //13 = enterbutton
		e.preventDefault();
		if (allSectionsIsCompleted(form)) {
			openFormSummary();
		} else {
			var sectionId = $(".current_section").attr("id");
			openDataEntryForSection(sectionId);
		}

    }
});
function openDataEntryForSection(sectionId) {
	navigateToAddress("data_entry.html#facility=" + facilityId + "#cycle=" + cycleId + "#form=" + formId + "#section=" + sectionId);
}
function openFormSummary() {
	navigateToAddress("form_summary.html#facility=" + facilityId + "#cycle=" + cycleId + "#form=" + formId + "#section=0");
}


function getLastListElement(name) {

	var listElement = document.createElement("LI");
	var hiddenListSection = document.createElement("SECTION");
	$(hiddenListSection).addClass("hidden_list_section");
	
	var startEntryButton = document.createElement("A");
	$(startEntryButton).text("Click here to look over and complete form");
	$(startEntryButton).attr("href", "form_summary.html#facility=" + facilityId + "#cycle=" + cycleId + "#form=" + formId + "#section=0");
	
	$(hiddenListSection).append(startEntryButton);
	$(listElement).attr("id", "show_summary_button");
	$(listElement).append(name, hiddenListSection); //add content to list element
	return listElement;
}



function setToCurrentSection(section) {
	$(section).toggleClass("current_section");
	$(section).find(".hidden_list_section").css("display", "block");
	$(section).find(".not_applicable_wraper").hide();
	setArrowPosition(section);
}

//Set position of arrow in UI to position of current section. 
function setArrowPosition(section) {
	$("#arrow_icon").css("display", "block");
	var lemTop = $(section).position().top;
	var lemLeft = $(section).position().left;
	$("#arrow_icon").animate({
		top: (lemTop - 2),
		left: (lemLeft - $("#arrow_icon").width())
	}, 250, function() {
		// Animation complete.
	}); 
	//$("#arrow_icon").css({ top: (lemTop - 8) });
	//$("#arrow_icon").css({ left: (lemLeft - $("#arrow_icon").width()) });
}

function setProgramTitleHeader(text) {
	$("#program_title").text(text);
	$("#cycle_title").html('<i class="fa fa-circle-o-notch" aria-hidden="true"></i>' + "Cycle " + getId(cycle));
}


// adjust arrow on window resize
$(window).resize(function () {
	adjustArrowPosition();
});

function adjustArrowPosition() {
	var lemLeft = $(".current_section").position().left;
	$("#arrow_icon").css("left", (lemLeft - $("#arrow_icon").width()));
}
