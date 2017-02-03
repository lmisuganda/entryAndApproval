// DHIS2 LMIS ORDER/REPORT APP. UiO - MAGNUS LI 2017. 
// LOCAL DATA OBJECT INTERFACE (SET/GET-METHODS)


//#### user data

function allowedApproval(user) {
	return true; //TEMP
}


//GENERIC GETSET
function getId(object) {
	return object.id;
}
function getName(object) {
	return object.name;
}
function getValue(object) {
	return object.value;
}
function setValue(object, val) {
	object.value = val;
}


//completion
function isCompleted(object) {
	return object.completed;
}
function setToCompleted(object) {
	object.completed = true;
}
function setToUncompleted(object) {
	object.completed = false;
}
function getFormsByCompletionStatus(objects) {
	var completed = [];
	var uncompleted = [];
	for (var i = 0; i < objects.length; i++) {
		if (isCompleted(objects[i])) {
			completed.push(objects[i]);
		} else {
			uncompleted.push(objects[i]);
		}
	}
	return [completed, uncompleted];
}

//approval
function isApproved(object) {
	return object.approved;
}
function setToApproved(object) {
	object.approved = true;
}
function setToUnapproved(object) {
	object.approved = false;
}
//applicable
function setToNotApplicable(object) {
	object.notApplicable = true;
}
function isApplicable (object) {
	if (object.notApplicable === undefined || !object.notApplicable) {
		return true;
	} else { return false;}
}

//commodity descriptions
function hasBasicUnit (object) {
	return (typeof object.basicUnit !== 'undefined');
}
function hasExplanationText(object) {
	return (typeof object.explanationText !== 'undefined');
}

//descriptions
function hasDescription(object) {
	return (typeof object.description !== 'undefined');
}
function getDescription(object) {
	return object.description;
}



// ######### Facility
function getCycles(facility) {
	return facility.cycles;
}
function getCurrentCycle(facility) {
	return getCycles(facility)[0]; //TEMP HACK NEED FIX
}
function getPreviousCycles(facility) {
	return getCycles(facility).slice(1); //TEMP HACK NEED FIX
}
function getPreviousCycle(currentCycle) {
	return getCycles(facility)[1]; //TEMP HACK NEED FIX
}
function getCycleById(facility, id) {
	var cycles = getCycles(facility);
	for (var i = 0; i < cycles.length; i++) {
		if (getId(cycles[i]) == id) return cycles[i];
	}
	return false;
}

// ######### Cycles
function getForms(cycle) {
	return cycle.forms;
}
function getFormById(cycle, id) {
	var forms = getForms(cycle);
	for (var i = 0; i < forms.length; i++) {
		if (getId(forms[i]) == id) return forms[i];
	}
	return null;
}
function getDataElementFromCycle(cycle, formId, sectionId, commodityId, dataElementId) {
	var form = getFormById(cycle, formId);
	var commodity = getCommodityById(getSectionById(form, sectionId), commodityId);
	return getDataElementById(commodity, dataElementId);
}

//##########  FORMS

//returns string with predefined qualitative status messages for form. Regarding approval and completion
function getStatus(form) {
	if (!isCompleted(form)) return 1;
	if (isCompleted(form) && !isApproved(form)) return 2;
	if (isApproved(form)) return 3;
	return -1;
}
function getStatusText(form) {
	var status = getStatus(form);
	if (status == 1) return "Form is waiting for completion";
	if (status == 2) return "Form is completed, and waiting for approval";
	if (status == 3) return "Form is completed and approved";
}
function getStatusTextShort(form) {
	var status = getStatus(form);
	if (status == 1) return "Waiting for completion";
	if (status == 2) return "Waiting for approval";
	if (status == 3) return "Completed and approved";
}
function getStatusColor(form, allowedApproval) {
	var status = getStatus(form);
	var orange = "#f0ad4e";
	var red = "#d9534f";
	var green = "#5cb85c";
	var colors = [orange, orange, green];
	
	if (allowedApproval) {
		return colors[status-1];
	} else {
		if (status == 1) return colors[0];
		else return colors[2]; 
	}
}
function getStatusIcon(form, allowedApproval) {
	var status = getStatus(form);
	var entry = '<i class="fa fa-pencil-square-o" aria-hidden="true"></i>';
	var completed = '<i class="fa fa-thumbs-o-up" aria-hidden="true"></i>';
	var approved = '<i class="fa fa-check" aria-hidden="true"></i>';
	var icons = [entry, completed, approved];
	
	return icons[status-1];
}
function editIsAllowed(form, user) {
	var formStatus = getStatus(form);
	if (formStatus == 1) {
		return true;
	} if (formStatus == 2 && allowedApproval(user)) {
		return true
	} else {
		return false;
	}
}
function actionIsRequiredByUser(form, allowedApproval) {
	var status = getStatus(form);
	if (status == 1) {
		return true;
	} else if (status == 2 && allowedApproval) {
		return true;
	} else {
		return false;
	}
}
//get all sections
function getSections(form) {
	return form.sections;
}

//get by id
function getSectionById(form, id) {
	var sections = getSections(form);
	for (var i = 0; i < sections.length; i++) {
		if (getId(sections[i]) == id) return sections[i];
	}
	return false;
}

//get by name
function getSectionByName(form, name) {
	var sections = getSections(form);
	for (var i = 0; i < sections.length; i++) {
		if (getName(sections[i]) == name) return sections[i];
	}
}

function getCompletedSections(form) {
	var sections = getSections(form);
	var completed = [];
	var i = 0;
	while (isCompleted(sections[i])) completed.push(sections[i]);
	return completed;
}
function getFirstUncompletedSection(form) {
	var sections = getSections(form);
	var i = 0;
	while (isCompleted(sections[i])) i++;
	return sections[i];
}
function allSectionsIsCompleted(form) {
	var sections = getSections(form);
	return isCompleted(sections[sections.length-1]);
}

//##########  SECTIONS
function getLastCompletedCommodity(section) {
	var commodities = getCommodities(section);
	var i = 0;
	while (i < commodities.length && isCompleted(commodities[i])) i++;
	return commodities[i];
}
function dataEntryIsStarted(section) {
	var commodities = getCommodities(section);
	return isCompleted(commodities[0]);
}
function allCommoditiesCompleted(section) {
	var commodities = getCommodities(section);
	return isCompleted(commodities[commodities.length-1]);
}


//########## COMMODITIES



function getCommodities(section) {
	return section.commodities;
}

function getCommodityById(section, id) {
	var commodities = getCommodities(section);
	for (var i = 0; i < commodities.length; i++) {
		if (getId(commodities[i]) == id) return commodities[i];
	}
}
function getCommodityByName(section, name) {
	commodities = getCommodities(section);
	for (var i = 0; i < commodities.length; i++) {
		if (getName(commodities[i]) == name) return commodities[i];
	}
}

function getExplanationText(commodity) {
	return commodity.explanationText;
}
function getBasicUnit(commodity) {
	return commodity.basicUnit;
}

//######### DATA ELEMENTS
function getDataElements(commodity) {
	return commodity.dataElements;
}
function getDataElementById(commodity, id) {
	var dataElements = getDataElements(commodity);
	for (var i = 0; i < dataElements.length; i++) {
		if (getId(dataElements[i]) == id) return dataElements[i];
	}
}
function isCalculated(dataElement) {
	return dataElement.calculated;
}
function isRequired(dataElement) {
	return dataElement.required;
}
function getType(dataElement) {
	return dataElement.type;
}
function getDataFromElementInPreviousCycle(dataElement) {
	if (typeof dataElement.getDataFromElementInPreviousCycle !== 'undefined') {
		return dataElement.getDataFromElementInPreviousCycle;
	} else {
		return false;
	}
}