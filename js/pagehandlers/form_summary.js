// DHIS2 LMIS ORDER/REPORT APP. 
// FORM SUMMARY PAGE HANDLER

//get ids from URL
var facilityId = getParameterFromURLByName("facility");
var cycleId = getParameterFromURLByName("cycle");
var formId = getParameterFromURLByName("form");
var sectionId = getParameterFromURLByName("section");
if (isUndefinedOrNull(facilityId, cycleId, formId)) navigateToAddress("index.html"); //check if URL parameters OK

StorageHandler.downloadFormWithId(facilityId, cycleId, formId, initializeFormSummaryContent);

function initializeFormSummaryContent() {

	facility = StorageHandler.getFacility(facilityId);
	cycle = getCycleById(facility, cycleId);
	form = getFormById(cycle, formId);
	if (isUndefinedOrNull(form, cycle, facility)) navigateToAddress("index.html");

	sectionElements = [];
	currentSection = 0;

	generateMainMenu(); //located in scripts.js
	generateFormSummaryHeader();
	generateSectionsList();

	//expandOrMinimizeListElement(sectionElements[sectionId]);  //expand element defined in url

	// init mode based on completed, approved and approval rights
	if (!isCompleted(form)) {
		initSubmissionMode(); //In submission mode, edit is allowed, and complete button is visible
	} else if (isCompleted(form) && !isApproved(form) && allowedApproval()) {
		initApprovalMode(); //In approval mode, edit is allowed, and approval button is visible
	} 

	//if user just completed the form, and have approval rights: prompt for approval. 
	var promptForInstantApproval = getParameterFromURLByName("promptForInstantApproval");
	if (promptForInstantApproval && !isApproved(form)) {
		showConfirmBox("<p>Do you also want to <b>approve</b> the form?</p>", function() {
				setToApproved(form);
				LS.updateFacility(facility);
				location.reload();
			});
	}
}

// set header + status-text and color
function generateFormSummaryHeader () {
	$("#form_summary").prepend("<p>" + '<i class="fa fa-circle-o-notch" aria-hidden="true"></i>' + "Cycle " + getId(cycle) + "</p>");
	$("#form_summary").prepend("<h1>" + getName(form) + "</h1>")
	var status = getStatus(form);
	if (status == 1 || (status == 2 && allowedApproval("TEMP"))) {
		$("#form_status").append('<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>');
	} else {
		$("#form_status").append('<i class="fa fa-check-circle-o" aria-hidden="true"></i>');
	}
	$("#form_status").append("  " + getStatusText(form));
	$("#form_status").css("background-color", getStatusColor(form, allowedApproval()));
}

function initSubmissionMode() {
	enableCommodityEditing();
	generateCompleteButton();
}
function initApprovalMode() {
	enableCommodityEditing(); 
	generateApproveButton();
}


function enableCommodityEditing() {
	$("#section_expl_text").append("Click on the name of the commodities to edit.");
	$(".title").on("click", function(e) {
		var sectionId = $(this).closest("li").attr("id"); //get sectionId from clicked element
		var commodityId = $(this).attr("id"); //get commodityId from clicked element
		navigateToAddress("data_entry.html#facility=" + facilityId + "#cycle=" + cycleId + "#form=" + formId + "#section=" + sectionId + "#commodityId=" + commodityId + "#single=true");
	});
	$(".title").css("cursor", "pointer");
}
function generateCompleteButton() {
	var button = document.createElement("BUTTON");
	var icon = '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
	$(button).append(icon);
	$(button).append("Complete form");
	$("#summary_navigation").append(button);
	
	//add event-listener to button
	$(button).on("click", function(e) {
		showConfirmBox("<p>Are you sure you want to complete the form?</p>", function() {
			setToCompleted(form);
			StorageHandler.saveForm(facility, form).then(function() {
				//if allowed approval: refresh and prompt for instant approval after completion
				if (allowedApproval("TEMP")) {
					navigateToAddress("form_summary.html#facility=" + facilityId + "#cycle=" + cycleId + "#form=" + formId + "#promptForInstantApproval=true");
					location.reload();
				} else {
					location.reload();
				}
			});
		});
	});
}
function generateApproveButton() {
	var button = document.createElement("BUTTON");
	var icon = '<i class="fa fa-thumbs-o-up" aria-hidden="true"></i>';
	$(button).append(icon);
	$(button).append("Approve form");
	$("#summary_navigation").append(button);
	
	//add event-listener to button
	$(button).on("click", function(e) {
		showConfirmBox("<p>Are you sure you want to the approve the form?</p>", function() {
			setToApproved(form);
			StorageHandler.saveForm(facility, form).then(function() {
				location.reload();
			});
		});
	});
}

function generateSectionsList() {
	var sectionsListElement = $("#sections_list");
	var sections = getSections(form);
	for (var i = 0; i < sections.length; i++) {
		var elem = getNewListElement(sections[i]);
		sectionsListElement.append(elem);
		sectionElements[i] = elem;
	}
	//Event listener 
	$(sectionsListElement).on("click", "li", function(e) {
		if (e.target == this || e.target.tagName == "H3" || e.target.tagName == "I") {
			expandOrMinimizeListElement(this);
		}
	});
}

//generates a new LI-element containing given name
function getNewListElement(section) {
	
	//Create element title and add text
	var title = document.createElement("SUMMARY")
	$(title).text(getName(section));
	//$(title).append('<i class="fa fa-plus-square-o" aria-hidden="true"></i>');
	
	var hiddenListSection = document.createElement("SECTION");
	$(hiddenListSection).addClass("hidden_list_section");
	$(hiddenListSection).append(createSectionTable(section));
	
	var listElement = document.createElement("LI");
	$(listElement).attr("id", getId(section));
	var detailsElement = document.createElement("DETAILS");
	if (getId(section) == sectionId) $(detailsElement).attr("open", "open");
	$(detailsElement).append(title, hiddenListSection); //add content to list element
	$(listElement).append(detailsElement);
	return listElement;
}

function createSectionTable(section) {
	var dataElements = getDataElements(getCommodities(section)[0]);
	var table = getInitializedTable(dataElements);
	var commodities = getCommodities(section);
	//runs through commodities
	for (var i = 0; i < commodities.length; i++) {
		var row = document.createElement("TR");
		var cell = document.createElement("TD");
		$(cell).attr("id", getId(commodities[i]));
		$(cell).text(getName(commodities[i]));
		$(cell).addClass("title");
		$(row).append(cell);
		if (isApplicable(commodities[i])) {
			//print data elements for commodity
			for (var j = 0; j < dataElements.length; j++) {
				var dataElements = getDataElements(commodities[i]);
				var cell = document.createElement("TD");
				$(cell).text(getValue(dataElements[j]));
				$(row).append(cell);
			}
		} else {
			$(cell).append("    (NOT APPLICABLE)");
			for (var j = 0; j < dataElements.length; j++) {
				var cell = document.createElement("TD");
				$(cell).text(" - ");
				$(row).append(cell);
			}
		}
		$(table).append(row);
	}
	return table;

}

function getInitializedTable(dataElements) {
	var table = document.createElement("TABLE");
	var row = document.createElement("TR");
	var nameCell = document.createElement("TD");
	$(nameCell).text("Commodity");
	$(row).append(nameCell);
	for (i = 0; i < dataElements.length; i++) {
		var cell = document.createElement("TD");
		$(cell).text(dataElements[i].name);
		$(row).append(cell);
	}
	$(table).append(row);
	return table;
}
