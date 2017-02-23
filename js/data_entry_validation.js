// DHIS2 LMIS ORDER/REPORT APP. UiO - MAGNUS LI 2017.
// DATA ENTRY VALIDATION HANDLER

function validateCommodityInput(commodityId, form) {
	currentInputFields = $(form).find("input").not(":checkbox");
	console.log("Running validation");


	//HTML5 validation (on required fields and correct data type)
	if(form.checkValidity()) {
		console.log("   - HTML5 validation OK");
	} else {
		console.log("   - HTML5 validation FAILED");
		$(form).find(":submit").click(); //trigger HTML5 validation messages
		return ["Missing required values"];
	}
	var result = [];
	if (formId == 1) {

		var j = 0;
		//run rules from DHIS2
		for (var i = 0; i < rules.length; i++) {
			if (checkValidationRule(rules[i], currentInputFields) === true) {
				console.log("   - TESTVAL OK");
			} else {
				console.log("   - TESTVAL FAILED");
				console.log("     " + rules[i].instruction);
				result[j++] = rules[i].instruction;
			}
		}
	}
	return result;
}

//testrules
testruleA = {
	operator: "less_than",
	instruction: "Test consumption should be less than opening balance + quantity received.",
	leftSide: {
		expression: "#{2}",
	},
	rightSide: {
		expression: "#{0}+#{1}",
	},
}
testruleB = {
	operator: "equal_to",
	instruction: "Opening balance should be equal to Quantity received",
	leftSide: {
		expression: "#{0}",
	},
	rightSide: {
		expression: "#{1}",
	},
}
var rules = [testruleA];

//tests validation rule based on DHIS2 rule object, and list of current input fields
//returns true or error message based on instruction defined in rule.
function checkValidationRule(rule, currentInputFields) {
	var left = convertExpression(rule.leftSide.expression, currentInputFields);
	var right = convertExpression(rule.rightSide.expression, currentInputFields);
	var operator = getOperator(rule.operator);
	//console.log("" + left + operator + right);
	try {
		var result = eval("" + left + operator + right);
		if (!result) return rule.instruction;
	}
	catch(err) {
		//console.log(err.message);
	}
	return true;
}

//takes left or right expression and converts to mathematical expression with resolved input values
function convertExpression(exp, currentInputFields) {
	var convExp = "";
	var i = 0;
	while (i < exp.length) {
		if (exp.charAt(i) == "#") {
			var id = exp.substr(i + 2, exp.substr(i + 2, exp.length).indexOf("}"));
			convExp += getValueFromDataInputElement(id, currentInputFields);
			i += id.length + 3;
		} else {
			convExp += exp.charAt(i++);
		}
	}
	return convExp;
}

//returns input value from textbox based on id and list of inputs
function getValueFromDataInputElement (id, currentInputFields) {
	var i = 0;
	while (i < currentInputFields.length) {
		if (currentInputFields[i].id == "de_" + id) return currentInputFields[i].value;
		i++;
	}
}

//converting DHIS2 operators to logical operators
function getOperator(text) {
	var operators = [];
	operators["equal_to"] = "==";
	operators["not_equal_to"] = "!=";
	operators["greater_than"] = ">";
	operators["greater_than_or_equal_to"] = ">=";
	operators["less_than"] = "<";
	operators["less_than_or_equal_to"] = "<=";
	operators["compulsory_pair"] = "===";

	return operators[text];
}
