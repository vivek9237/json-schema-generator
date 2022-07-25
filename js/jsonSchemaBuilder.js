var tab = '';
var attributeToTitleDescJson;
var sensitiveAttributes;
var schemaMapperAttributes;
var staticAttributes;
var renderSchema = true;

function readAttributeToTitleDesc(file) {
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", file, false);
	rawFile.onreadystatechange = function () {
		if (rawFile.readyState === 4) {
			if (rawFile.status === 200 || rawFile.status == 0) {
				attributeToTitleDescJson = JSON.parse(rawFile.responseText);
			}
		}
	}
	rawFile.send(null);
}
function readAttributeProperties(file) {
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", file, false);
	rawFile.onreadystatechange = function () {
		if (rawFile.readyState === 4) {
			if (rawFile.status === 200 || rawFile.status == 0) {
				var sensitiveAttributesProp = JSON.parse(rawFile.responseText)["sensitiveAttributes"];
				sensitiveAttributes = sensitiveAttributesProp.map(element => {
					return element.toLowerCase();
				});
				schemaMapperAttributes = JSON.parse(rawFile.responseText)["schemaMapperAttributes"];
				console.log(schemaMapperAttributes)
				staticAttributes = JSON.parse(rawFile.responseText)["staticAttributes"];
			}
		}
	}
	rawFile.send(null);
}
readAttributeToTitleDesc("properties/attributeToTitleDesc.json");
readAttributeProperties("properties/attributeProperties.json");

$(document).ready(function () {
	$('input#wordwrapCheckbox').change(
		function () {
			if ($(this).is(':checked')) {
				wrapJsons();
			} else {
				unwrapJsons();
			}
		}
	);
	$('input#minifyCheckbox').change(
		function () {
			if ($(this).is(':checked')) {
				beautifyJsons();
			} else {
				minifyJsons();
			}
		}
	);
});

var textareaHeight = 500;
var textareaWidth = 500;
var waiting;
var jsonSchemaEditor = CodeMirror.fromTextArea
	(document.getElementById('jsonSchemaArea'), {
		mode: "application/ld+json",
		theme: "dracula",
		lineNumbers: true,
		lineWrapping: true,
		scrollbarStyle: "simple",
		extraKeys: {
			"F11": function (cm) {
				cm.setOption("fullScreen", !cm.getOption("fullScreen"));
			},
			"Esc": function (cm) {
				if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
			}
		}
	});
jsonSchemaEditor.on('change', jsonSchemaEditor => {
	try {
		clearTimeout(waiting);
		waiting = setTimeout(updateHints, 500);
	} catch (err) {
		console.log("Invalid Json")
	}
});
setTimeout(updateHints, 100);
var widgets = [];
function updateHints() {
	jsonSchemaEditor.operation(function () {
		for (var i = 0; i < widgets.length; ++i)
			jsonSchemaEditor.removeLineWidget(widgets[i]);
		widgets.length = 0;

		JSHINT(jsonSchemaEditor.getValue());
		for (var i = 0; i < JSHINT.errors.length; ++i) {
			var err = JSHINT.errors[i];
			if (!err) continue;
			var msg = document.createElement("div");
			var icon = msg.appendChild(document.createElement("span"));
			icon.innerHTML = "⛔";
			icon.className = "lint-error-icon";
			msg.appendChild(document.createTextNode(err.reason));//Show detailed error
			msg.className = "lint-error";
			widgets.push(jsonSchemaEditor.addLineWidget(err.line - 1, msg, { coverGutter: false, noHScroll: true }));
			break;// added by vivek | it will only show one error
		}
	});
	var info = jsonSchemaEditor.getScrollInfo();
	var after = jsonSchemaEditor.charCoords({ line: jsonSchemaEditor.getCursor().line + 1, ch: 0 }, "local").top;
	if (info.top + info.clientHeight < after)
		jsonSchemaEditor.scrollTo(null, after - info.clientHeight + 3);
}

var inputJsonEditor = CodeMirror.fromTextArea
	(document.getElementById('inputJson'), {
		mode: "application/ld+json",
		theme: "dracula",
		lineNumbers: true,
		lineWrapping: true,
		scrollbarStyle: "simple",
		extraKeys: {
			"F11": function (cm) {
				cm.setOption("fullScreen", !cm.getOption("fullScreen"));
			},
			"Esc": function (cm) {
				if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
			}
		}
	});
// inputJsonEditor.on('change', jsonSchemaEditor => {console.log("write code here")});
//inputJsonEditor.setSize(textareaWidth, textareaHeight);
var where = 'bottom';
var numPanels = 0;
var panels = {};
function makePanel(where, editorName) {
	var node = document.createElement("div");
	var id = ++numPanels;
	var label;
	node.id = "panel-" + id;
	node.className = "panel " + where;
	var buttonNode = document.createElement("button");
	buttonNode.className = "controls__button controls__button--minify";
	buttonNode.onclick = function () {
		copyJson(editorName);
	};
	label = node.appendChild(buttonNode);
	label.innerHTML = "Copy " + editorName;
	return node;
}
function addPanel(where) {
	var node1 = makePanel(where, "Input JSON");
	var node2 = makePanel(where, "JSON Schema");
	panels[node1.id] = inputJsonEditor.addPanel(node1, { position: where, stable: true });
	panels[node2.id] = jsonSchemaEditor.addPanel(node2, { position: where, stable: true });
}
//addPanel(where);
inputJsonEditor.setSize("100%", "100%");
jsonSchemaEditor.setSize("100%", "100%");

function isNumeric(str) {
	return false;
	if (typeof str != "string") return false // we only process strings!  
	return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
		!isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function clearJsons() {
	jsonSchemaEditor.getDoc().setValue("");
	inputJsonEditor.getDoc().setValue("");
}
function wrapJsons() {
	jsonSchemaEditor.setOption("lineWrapping", true);
	inputJsonEditor.setOption("lineWrapping", true);
}
function unwrapJsons() {
	jsonSchemaEditor.setOption("lineWrapping", false);
	inputJsonEditor.setOption("lineWrapping", false);
}
function minifyJsons() {
	try {
		var temp1 = inputJsonEditor.getDoc().getValue();
		var minifiedTemp1 = JSON.stringify(JSON.parse(temp1));
		inputJsonEditor.getDoc().setValue(minifiedTemp1);
	} catch (err) {
		console.log("Unable to parse inputJSON Editor");
	} try {
		var temp2 = jsonSchemaEditor.getDoc().getValue();
		var minifiedTemp2 = JSON.stringify(JSON.parse(temp2));
		jsonSchemaEditor.getDoc().setValue(minifiedTemp2);
	} catch (err) {
		console.log("Unable to parse inputJSON Editor");
	}
}

function beautifyJsons() {
	try {
		var temp1 = inputJsonEditor.getDoc().getValue();
		var minifiedTemp1 = JSON.stringify(JSON.parse(temp1), null, 2);
		inputJsonEditor.getDoc().setValue(minifiedTemp1);
	} catch (err) {
		console.log("Unable to parse inputJSON Editor");
	}
	try {
		var temp2 = jsonSchemaEditor.getDoc().getValue();
		var minifiedTemp2 = JSON.stringify(JSON.parse(temp2), null, 2);
		jsonSchemaEditor.getDoc().setValue(minifiedTemp2);
	} catch (err) {
		console.log("Unable to parse jsonSchema Editor");
	}
}

function getAttributeTitle(attribute) {
	var connectionType = document.getElementById("connectiontype").value;
	console.log(attributeToTitleDescJson[connectionType]);
	if (connectionType == "NONE") {
		return attribute;
	} else if (attributeToTitleDescJson[connectionType] != undefined) {
		if (attributeToTitleDescJson[connectionType][attribute] != undefined) {
			if (attributeToTitleDescJson[connectionType][attribute]["title"] != undefined) {
				console.log(attributeToTitleDescJson[connectionType][attribute]["title"]);
				return attributeToTitleDescJson[connectionType][attribute]["title"];
			} else {
				return attribute;
			}
		} else {
			return attribute;
		}
	} else {
		return attribute;
	}

}
function getAttributeDescription(attribute) {
	var connectionType = document.getElementById("connectiontype").value;
	console.log(attributeToTitleDescJson[connectionType]);
	if (connectionType == "NONE") {
		return "";
	} else if (attributeToTitleDescJson[connectionType] != undefined) {
		if (attributeToTitleDescJson[connectionType][attribute] != undefined) {
			if (attributeToTitleDescJson[connectionType][attribute]["description"] != undefined) {
				console.log(attributeToTitleDescJson[connectionType][attribute]["description"]);
				return attributeToTitleDescJson[connectionType][attribute]["description"];
			} else {
				return "";
			}
		} else {
			return "";
		}
	} else {
		return "";
	}
}

function getKeyObjectTypes(obj, tab) {
	var isStatic = document.getElementById("isStatic").value;
	//console.log("calling getKeyObjectTypes")
	var propertyname = "";
	var jsonSchemaArray = []
	var propertyArray = []
	for (var attributename in obj) {
		var jsonSchema = {}
		//console.log("Entered for loop")
		propertyname = attributename;

		key = obj[attributename]
		//console.log(tab+"attributename = "+attributename)
		var objectType = typeof key
		if (objectType == 'object') {
			if (Array.isArray(key)) {
				var returnValues = getKeyObjectTypes(key, tab + "	")
				var tempPropArray = returnValues[0]
				var tempJsonArray = returnValues[1]
				for (let i = 0; i < tempJsonArray.length; i++) {
					if (tempJsonArray[i]['type'] == 'string') {
						jsonSchema['type'] = "string"
						jsonSchema['title'] = getAttributeTitle(attributename);
						jsonSchema['description'] = getAttributeDescription(attributename);
						jsonSchema['multiValued'] = "true"
						jsonSchema['value'] = ""
						if (sensitiveAttributes.includes(attributename.toLowerCase())) {
							jsonSchema['sensitive'] = "true"
						}
					} else if (tempJsonArray[i]['type'] == 'number') {
						jsonSchema['type'] = "number"
						jsonSchema['title'] = getAttributeTitle(attributename);
						jsonSchema['description'] = getAttributeDescription(attributename);
						jsonSchema['multiValued'] = "true"
						jsonSchema['value'] = ""
						if (sensitiveAttributes.includes(attributename.toLowerCase())) {
							jsonSchema['sensitive'] = "true"
						}
					} else if (tempJsonArray[i]['type'] == 'boolean') {
						jsonSchema['type'] = "boolean"
						jsonSchema['title'] = getAttributeTitle(attributename);
						jsonSchema['description'] = getAttributeDescription(attributename);
						jsonSchema['multiValued'] = "true"
						jsonSchema['value'] = ""
						if (sensitiveAttributes.includes(attributename.toLowerCase())) {
							jsonSchema['sensitive'] = "true"
						}
					} else {
						jsonSchema['type'] = "json array"
						jsonSchema['title'] = getAttributeTitle(attributename);
						jsonSchema['description'] = getAttributeDescription(attributename);
						if (isStatic == "STATIC") {
							jsonSchema['schemaType'] = "static"
						}
						jsonSchema['multiValued'] = "false"
						jsonSchema['value'] = ""
						if (jsonSchema['properties'] == undefined) {
							jsonSchema['properties'] = {}
							jsonSchema['properties'] = tempJsonArray[i]['properties']
						} else {
							//resolved https://github.com/vivek9237/json-schema-generator/issues/1
							resultantProperties = getMergedSchema(jsonSchema['properties'], tempJsonArray[i]['properties']);
							jsonSchema['properties'] = resultantProperties;
						}
					}
					jsonSchemaArray.push(jsonSchema)
					//propertyArray.push(tempPropArray[i])
					propertyArray.push(attributename)

				}

				//return [attributename,jsonSchema]
			} else {
				if (schemaMapperAttributes.includes(attributename)) {
					console.log("inside schema mapper")
					jsonSchema['type'] = "Schema Mapper";
					jsonSchema['title'] = "Attribute Mapping";
					jsonSchema['description'] = "Map the properties between the target application and Saviynt";
					jsonSchema['multiValued'] = "false";
					jsonSchema['value'] = "";
					jsonSchema['default'] = [];
					jsonSchema['saviyntObject'] = "<account/entitlement>";
					jsonSchema['ApplicationObject'] = "<Users/<EntitlementType>>";
					jsonSchema['allowedValueTypes'] = ["char", "date", "bool", "listAsString", "boolList", "json", "ufjson", "ufchar", "epochdate"];
					jsonSchemaArray.push(jsonSchema);
					propertyArray.push(attributename)
				} else {
					jsonSchema['type'] = "json object"
					jsonSchema['title'] = getAttributeTitle(attributename);
					jsonSchema['description'] = getAttributeDescription(attributename);
					if (isStatic == "STATIC") {
						jsonSchema['schemaType'] = "static"
					}
					jsonSchema['multiValued'] = "false"
					jsonSchema['value'] = ""

					var returnValues = getKeyObjectTypes(key, tab + "	")
					var tempPropArray = returnValues[0]
					var tempJsonArray = returnValues[1]
					for (let i = 0; i < tempJsonArray.length; i++) {
						if (jsonSchema['properties'] == null) {
							jsonSchema['properties'] = {}
						}
						jsonSchema['properties'][tempPropArray[i]] = tempJsonArray[i]
						//return [attributename,jsonSchema]
						if (!isNumeric(attributename)) {
							jsonSchemaArray.push(jsonSchema)
							propertyArray.push(attributename)
						}
					}
				}
			}
		} else if (objectType == 'string') {
			jsonSchema['type'] = "string"
			jsonSchema['title'] = getAttributeTitle(attributename);
			jsonSchema['description'] = getAttributeDescription(attributename);
			jsonSchema['multiValued'] = "false"
			jsonSchema['value'] = ""
			if (sensitiveAttributes.includes(attributename.toLowerCase())) {
				jsonSchema['sensitive'] = "true"
			}
			if (!isNumeric(attributename)) {
				jsonSchemaArray.push(jsonSchema)
				propertyArray.push(attributename)
			}
			//return [attributename,jsonSchema]
		} else if (objectType == 'number') {
			jsonSchema['type'] = "number"
			jsonSchema['title'] = getAttributeTitle(attributename);
			jsonSchema['description'] = getAttributeDescription(attributename);
			jsonSchema['multiValued'] = "false"
			jsonSchema['value'] = ""
			if (sensitiveAttributes.includes(attributename.toLowerCase())) {
				jsonSchema['sensitive'] = "true"
			}
			if (!isNumeric(attributename)) {
				jsonSchemaArray.push(jsonSchema)
				propertyArray.push(attributename)
			}
			//return [attributename,jsonSchema]
		} else if (objectType == 'boolean') {
			jsonSchema['type'] = "boolean"
			jsonSchema['title'] = getAttributeTitle(attributename);
			jsonSchema['description'] = getAttributeDescription(attributename);
			jsonSchema['multiValued'] = "false"
			jsonSchema['value'] = ""
			if (sensitiveAttributes.includes(attributename.toLowerCase())) {
				jsonSchema['sensitive'] = "true"
			}
			if (!isNumeric(attributename)) {
				jsonSchemaArray.push(jsonSchema)
				propertyArray.push(attributename)
			}
		} else {
		}

	}
	return [propertyArray, jsonSchemaArray]
}

function copyJSONSchema() {
	/* Get the text field */

	var copyText = jsonSchemaEditor.getDoc().getValue();
	navigator.clipboard.writeText(copyText);
}
function copyJson(editorName) {
	/* Get the text field */
	if (editorName == "JSON Schema") {
		var copyText = jsonSchemaEditor.getDoc().getValue();
		navigator.clipboard.writeText(copyText);
	} else if (editorName == "Input JSON") {
		var copyText = inputJsonEditor.getDoc().getValue();
		navigator.clipboard.writeText(copyText);
	}

}
function generateJsonSchema() {
	console.log("generate");
	renderSchema = true;
	var inputJson = inputJsonEditor.getDoc().getValue();
	console.log(inputJson);
	const obj = JSON.parse(inputJson);

	var jsonSchemaBuilder = {}
	jsonSchemaBuilder['title'] = "<Enter title here>"
	jsonSchemaBuilder['description'] = "<Enter description here>"
	jsonSchemaBuilder['type'] = "object"
	var isStatic = document.getElementById("isStatic").value;
	if (isStatic == "STATIC") {
		jsonSchemaBuilder['schemaType'] = "static"
	}
	jsonSchemaBuilder['required'] = []
	jsonSchemaBuilder['domainObjects'] = ["user"]
	jsonSchemaBuilder['properties'] = {}
	var returnValues = getKeyObjectTypes(obj, tab);
	var tempPropArray = returnValues[0]
	var tempJsonArray = returnValues[1]
	for (let i = 0; i < tempJsonArray.length; i++) {
		jsonSchemaBuilder['properties'][tempPropArray[i]] = tempJsonArray[i]
	}
	var generatedJsonSchema = JSON.stringify(jsonSchemaBuilder, null, 2);
	//document.getElementById("jsonSchemaArea").value=generatedJsonSchema;
	if (renderSchema) {
		jsonSchemaEditor.getDoc().setValue(generatedJsonSchema);
	}
}

function getMergedSchema(exisitingProperties, incomingProperties) {
	console.log("exisitingProperties = ")
	console.log(exisitingProperties)
	console.log("incomingProperties = ")
	console.log(incomingProperties)
	var resultantProperties = {};
	for (var temp in exisitingProperties) {
		resultantProperties[temp] = exisitingProperties[temp];
	}
	for (var temp in incomingProperties) {
		if (resultantProperties[temp] == undefined) {
			resultantProperties[temp] = incomingProperties[temp];
		}
		else {
			if (!_.isEqual(resultantProperties[temp], incomingProperties[temp])) {
				if (resultantProperties[temp]['type'] != incomingProperties[temp]['type']) {
					alert("Encountered inconsistency in the data type of attribute - '" + resultantProperties[temp]['title'] + "'\nJson Schema will not be generated!");
					renderSchema = false;
				} else {
					resultantProperties[temp] = getMergedSchema(resultantProperties[temp], incomingProperties[temp])
				}
			}
		}
	}
	return resultantProperties;
}



//##########
//###################
//##############################
//dropdown js					###########
//##############################
//###################
//##########

var x, i, j, l, ll, selElmnt, a, b, c;
/*look for any elements with the class "custom-select":*/
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
	selElmnt = x[i].getElementsByTagName("select")[0];
	ll = selElmnt.length;
	/*for each element, create a new DIV that will act as the selected item:*/
	a = document.createElement("DIV");
	a.setAttribute("class", "select-selected");
	a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
	x[i].appendChild(a);
	/*for each element, create a new DIV that will contain the option list:*/
	b = document.createElement("DIV");
	b.setAttribute("class", "select-items select-hide");
	for (j = 0; j < ll; j++) {
		/*for each option in the original select element,
		create a new DIV that will act as an option item:*/
		c = document.createElement("DIV");
		c.innerHTML = selElmnt.options[j].innerHTML;
		c.addEventListener("click", function (e) {
			/*when an item is clicked, update the original select box,
			and the selected item:*/
			var y, i, k, s, h, sl, yl;
			s = this.parentNode.parentNode.getElementsByTagName("select")[0];
			sl = s.length;
			h = this.parentNode.previousSibling;
			for (i = 0; i < sl; i++) {
				if (s.options[i].innerHTML == this.innerHTML) {
					s.selectedIndex = i;
					h.innerHTML = this.innerHTML;
					y = this.parentNode.getElementsByClassName("same-as-selected");
					yl = y.length;
					for (k = 0; k < yl; k++) {
						y[k].removeAttribute("class");
					}
					this.setAttribute("class", "same-as-selected");
					break;
				}
			}
			h.click();
		});
		b.appendChild(c);
	}
	x[i].appendChild(b);
	a.addEventListener("click", function (e) {
		/*when the select box is clicked, close any other select boxes,
		and open/close the current select box:*/
		e.stopPropagation();
		closeAllSelect(this);
		this.nextSibling.classList.toggle("select-hide");
		this.classList.toggle("select-arrow-active");
	});
}
function closeAllSelect(elmnt) {
	/*a function that will close all select boxes in the document,
	except the current select box:*/
	var x, y, i, xl, yl, arrNo = [];
	x = document.getElementsByClassName("select-items");
	y = document.getElementsByClassName("select-selected");
	xl = x.length;
	yl = y.length;
	for (i = 0; i < yl; i++) {
		if (elmnt == y[i]) {
			arrNo.push(i)
		} else {
			y[i].classList.remove("select-arrow-active");
		}
	}
	for (i = 0; i < xl; i++) {
		if (arrNo.indexOf(i)) {
			x[i].classList.add("select-hide");
		}
	}
}
/*if the user clicks anywhere outside the select box,
then close all select boxes:*/
document.addEventListener("click", closeAllSelect);
console.log(attributeToTitleDescJson);

getAttributeDescription("Accept");