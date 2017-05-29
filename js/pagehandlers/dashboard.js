var facilityId = getParameterFromURLByName("facility");
if (isUndefinedOrNull(facilityId)) navigateToAddress("index.html");
StorageHandler.downloadFacilityWithId(facilityId, initializeDashboardContent);

function initializeDashboardContent() {

	facility = LS.getFacilityById(facilityId);
	if (isUndefinedOrNull(facility)) navigateToAddress("index.html");

	generateMainMenu(); //located in scripts.js

	currentCycle = getCurrentCycle(facility); //temp

	generateFormsLists(facility);
	//generateFacilityInfoSection();
	//generateListOfHighlightedForms(currentCycle);
	//generateListOfPreviousCycles(getPreviousCycles(facility));
}


function generateFacilityInfoSection() {
	$("#facility_title_header").text(getName(facility));
	$("#header_cycle_info").html('<i class="fa fa-circle-o-notch" aria-hidden="true"></i>' + "Current cycle: " + getName(currentCycle) + ". Deadline: " +  getFullDate(getDeadline(currentCycle)));
}

function generateFormsLists(facility) {
	var currentCycle = getCurrentCycle(facility);
	var currentCycleForms = getForms(currentCycle); 
	currentCycleForms.forEach(function(form) {
		if (formIsPendingForAction(form)) {
			$("#pending_forms").append(getListElement(currentCycle, form));
		} else {
			$("#submitted_forms").append(getListElement(cycle, form));
		}
	});
	
	var previousCycles = getPreviousCycles(facility);
	previousCycles.forEach(function (cycle) {
		var forms = getForms(cycle);
		var completedForms = [];
		
		forms.forEach(function (form) {
			if (formIsPendingForAction(form)) {
				$("#pending_forms").append(getListElement(cycle, form));
			} else {
				completedForms.push(getListElement(cycle, form));
			}
		});
		
		if (completedForms.length > 0) {
			generatePreviousCycleListElement(cycle, completedForms);
		}
	});
	 
	
}

function generatePreviousCycleListElement(cycle, formsListElements) {
		var listElement = document.createElement("LI");
		var detailElement = document.createElement("DETAILS");
		var summaryElement = document.createElement("SUMMARY");
		$(summaryElement).text(new Date(getDeadline(cycle)).getFullYear() + ": cycle " + getName(cycle));
		$(detailElement).append(summaryElement);
		$(listElement).append(detailElement);
		$("#previous_cycles").append(listElement);
		$(detailElement).append(formsListElements);
}

function formIsPendingForAction(form) {
	return actionIsRequiredByUser(form, allowedApproval("TEMP"));
}

/*REMOVE !!!!!!!!!!!
function generateListOfHighlightedForms(cycle) {
	var forms = getForms(cycle);
	console.log(forms);
	var pendingFormsCount = 0;
	for (var i = 0; i < forms.length; i++) {
		if (actionIsRequiredByUser(forms[i], allowedApproval("TEMP"))) {
			
			pendingFormsCount++;
		} else {
			$("#submitted_forms").append(getListElement(cycle, forms[i]));
		}
	}
	if (pendingFormsCount == 0) {
		$("#pending_forms").append("<br><p>Wohoo! No forms requires your action</p>");
	}
}

function generateListOfPreviousCycles(cycles) {
	for (var i = 0; i < cycles.length; i++) {
		var listElement = document.createElement("LI");
		var detailElement = document.createElement("DETAILS");
		var summaryElement = document.createElement("SUMMARY");
		$(summaryElement).text(new Date(getDeadline(cycles[i])).getFullYear() + ": cycle " + getName(cycles[i]));
		$(detailElement).append(summaryElement);
		$(listElement).append(detailElement);
		$("#previous_cycles").append(listElement);
		//buildListOfForms("#previous_cycles"),
		var forms = getForms(cycles[i]);
		for (var j = 0; j < forms.length; j++) {
			$(detailElement).append(getListElement(cycles[i], forms[j]));
		}
	}
}
*/



function getListElement(cycle, form) {

	var listElement = document.createElement("LI");
	$(listElement).attr("id", getId(form));
	
	//form name
	var link = document.createElement("A");
	$(listElement).append(link);

	$(link).html('<i class="fa fa-file-text-o" aria-hidden="true"></i>' + getName(form));

	//cycle info
	var cycleEl = document.createElement("P");
	if (isPassedDeadline(cycle)) $(cycleEl).css("color", "red");
	$(cycleEl).append('<i class="fa fa-circle-o-notch" aria-hidden="true"></i>' + getName(cycle));
	$(cycleEl).append(" | Deadline: " + getFullDateNoDayNoYear(getDeadline(cycle)));
	$(listElement).append(cycleEl);

	//status info
	var status = document.createElement("P");
	$(status).addClass("form_status");
	$(status).html(getStatusIcon(form, allowedApproval("TEMP")) + getStatusTextShort(form));
	$(listElement).append(status);


	if (isCompleted(form)) {
		$(link).attr("href", "form_summary.html#facility=" + facilityId + "#cycle=" + getId(cycle) + "#form=" + getId(form));
	} else {
		$(link).attr("href", "form_overview.html#facility=" + facilityId + "#cycle=" + getId(cycle) + "#form=" + getId(form));
	}

	$(listElement).click(function() {
		if (isCompleted(form)) {
			navigateToAddress("form_summary.html#facility=" + facilityId + "#cycle=" + getId(cycle) + "#form=" + getId(form));
		} else {
			navigateToAddress("form_overview.html#facility=" + facilityId + "#cycle=" + getId(cycle) + "#form=" + getId(form));
		}
	});

	return listElement;
}
