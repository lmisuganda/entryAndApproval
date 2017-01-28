// DHIS2 LMIS ORDER/REPORT APP. UiO - MAGNUS LI 2017. 
// PROGRAM INDICATOR CALCULATION HANDLER FOR DATA ENTRY SCREEN. 

//TEMP TESTDATA
var programIndicators = [
	{
		id: "de_4",
		name: "Test",
		expression: "#{0} + #{1} - #{2} + #{3}",
	},
		
	{
		id: "de_5",
		name: "Test",
		expression: "#{2}*2",
	},
	{
		id: "de_6",
		name: "Test",
		expression: "#{5}-#{4}",
	},
]

function getIndicatorById(indicators, id) {
	for (var i = 0; i < indicators.length; i++) {
		if (indicators[i].id == id) return indicators[i];
	}
	return false;
}

//Calculates and prints value of indicators (based on value of provided input elements)
function calculateAndPrintIndicators(indicators, inputElements) {
	
	for (var i = 0; i < inputElements.length; i++) {
		if ($(inputElements[i]).attr("disabled")) {
			var indicator = getIndicatorById(programIndicators, $(inputElements[i]).attr("id"));
			//console.log(indicator);
			var calculation = calculateExpression(indicator.expression, inputElements)
			if (calculation) $(inputElements[i]).val(calculation);
		}
	}
}

// calculates DHIS2 indicator expressions by resolving values from input-fields and evaluating expressions with values. 
function calculateExpression(exp, currentInputFields) {
	var convExp = "";
	var i = 0;
	while (i < exp.length) {
		if (exp.charAt(i) == "#") {
			var id = exp.substr(i + 2, exp.substr(i + 2, exp.length).indexOf("}"));
			var inputValue = getValueFromDataInputElement(id, currentInputFields);
			if (inputValue == "") return false;
			inputValue = "(" + inputValue + ")";
			convExp += inputValue;
			i += id.length + 3;
		} else { 
			convExp += exp.charAt(i++);
		} 
	}
	return eval(convExp);
}