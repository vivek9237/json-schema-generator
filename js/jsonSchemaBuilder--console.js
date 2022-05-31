
const fs = require('fs');

try {
  const data = fs.readFileSync("C:\\Users\\vivek.mohanty\\Desktop\\UPDATEACCOUNTJSON.json", 'utf8');
  var inputJson = data
} catch (err) {
  //console.error(err);
}
var tab = '';
function isNumeric(str) { return false;
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
function getKeyObjectTypes(obj,tab){
	//console.log("calling getKeyObjectTypes")
	var propertyname = "";
	var jsonSchemaArray = []
	var propertyArray = []
	for(var attributename in obj) {
		var jsonSchema = {}
		//console.log("Entered for loop")
		propertyname = attributename;
		
		key = obj[attributename]
		//console.log(tab+"attributename = "+attributename)
		var objectType = typeof key
		if(objectType=='object'){
			if(Array.isArray(key)){
				var returnValues = getKeyObjectTypes(key,tab+"	")
				var tempPropArray = returnValues[0]
				var tempJsonArray=returnValues[1]
				for (let i = 0; i < tempJsonArray.length; i++) {
					if(tempJsonArray[i]['type']=='string'){
						jsonSchema['type'] ="string"
						jsonSchema['title']=attributename
						jsonSchema['multiValued']="true"
						jsonSchema['value']=""
					} else if(tempJsonArray[i]['type']=='number'){
						jsonSchema['type'] ="number"
						jsonSchema['title']=attributename
						jsonSchema['multiValued']="true"
						jsonSchema['value']=""
					}else{
						jsonSchema['type'] ="json array"
						jsonSchema['title']=attributename
						jsonSchema['multiValued']="false"
						jsonSchema['value']=""
						if(jsonSchema['properties']== null){
							jsonSchema['properties']={}
						}
						jsonSchema['properties']=tempJsonArray[i]['properties']
						console.log(tempJsonArray[i]['properties'])
					}
						jsonSchemaArray.push(jsonSchema)
						//propertyArray.push(tempPropArray[i])
						propertyArray.push(attributename)
					
				}
				
				//return [attributename,jsonSchema]
			} else{
				jsonSchema['type'] ="json object"
				jsonSchema['title']=attributename
				jsonSchema['multiValued']="false"
				jsonSchema['value']=""
				
				var returnValues = getKeyObjectTypes(key,tab+"	")
				var tempPropArray = returnValues[0]
				var tempJsonArray=returnValues[1]
				for (let i = 0; i < tempJsonArray.length; i++) {
					if(jsonSchema['properties']== null){
						jsonSchema['properties']={}
					}
					jsonSchema['properties'][tempPropArray[i]]=tempJsonArray[i]
					//return [attributename,jsonSchema]
					if(!isNumeric(attributename)){
						jsonSchemaArray.push(jsonSchema)
						propertyArray.push(attributename)
					}
				}
			}
		} else if (objectType=='string'){
			jsonSchema['type'] ="string"
			jsonSchema['title']=attributename
			jsonSchema['multiValued']="false"
			jsonSchema['value']=""
			if(!isNumeric(attributename)){
				jsonSchemaArray.push(jsonSchema)
				propertyArray.push(attributename)
			}
			//return [attributename,jsonSchema]
		} else if (objectType=='number'){
			jsonSchema['type'] ="number"
			jsonSchema['title']=attributename
			jsonSchema['multiValued']="false"
			jsonSchema['value']=""
			if(!isNumeric(attributename)){
				jsonSchemaArray.push(jsonSchema)
				propertyArray.push(attributename)
			}
			//return [attributename,jsonSchema]
		} else if (objectType=='boolean'){
			jsonSchema['type'] ="boolean"
			jsonSchema['title']=attributename
			jsonSchema['multiValued']="false"
			jsonSchema['value']=""
			if(!isNumeric(attributename)){
				jsonSchemaArray.push(jsonSchema)
				propertyArray.push(attributename)
			}
			//return [attributename,jsonSchema]
		} else {
			////console.log(tab+"objectType")
		}
		
		//jsonSchemaArray.push(jsonSchema)
	}
	console.log("----->"+propertyArray)
	//console.log("=====>"+JSON.stringify(jsonSchemaArray))
	return [propertyArray,jsonSchemaArray]
}

const obj = JSON.parse(inputJson);
////console.log(obj);

var jsonSchemaBuilder = {}
jsonSchemaBuilder['title'] ="Update Account Policy"
jsonSchemaBuilder['description']="Specify attributes to update accounts in the Active Directory"
jsonSchemaBuilder['type']="object"
jsonSchemaBuilder['schemaType']="static"
jsonSchemaBuilder['required']=[]
jsonSchemaBuilder['domainObjects']=["user"]
jsonSchemaBuilder['properties'] = {}
var returnValues = getKeyObjectTypes(obj,tab);
var tempPropArray = returnValues[0]
var tempJsonArray=returnValues[1]
for (let i = 0; i < tempJsonArray.length; i++) {
	jsonSchemaBuilder['properties'][tempPropArray[i]]=tempJsonArray[i]
}

console.log('#####################################################')
console.log(JSON.stringify(jsonSchemaBuilder, null, 2))

function generateJsonSchema(){
	console.log("generate");
}