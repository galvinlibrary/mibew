/*!
 * This file is a part of Mibew Messenger.
 *
 * Copyright 2005-2015 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function MibewAPI(n){if(this.protocolVersion="1.0","object"!=typeof n||!(n instanceof MibewAPIInteraction))throw new Error("Wrong interaction type");this.interaction=n}function MibewAPIInteraction(){this.mandatoryArguments=function(){return{}},this.getReservedFunctionsNames=function(){return[]}}function MibewAPIExecutionContext(){this.returnValues={},this.functionsResults=[]}MibewAPI.prototype.checkFunction=function(n,t){if(t=t||!1,"undefined"==typeof n["function"]||""==n["function"])throw new Error("Cannot call for function with no name");if(t)for(var e=this.interaction.getReservedFunctionsNames(),r=0;r<e.length;r++)if(n["function"]==e[r])throw new Error("'"+n["function"]+"' is reserved function name");if("object"!=typeof n.arguments)throw new Error("There are no arguments in '"+n["function"]+"' function");var o=0,i=this.interaction.getMandatoryArguments(n["function"]);n:for(var s in n.arguments)for(var r=0;r<i.length;r++)if(s==i[r]){o++;continue n}if(o!=i.length)throw new Error("Not all mandatory arguments are set in '"+n["function"]+"' function")},MibewAPI.prototype.checkRequest=function(n){if("string"!=typeof n.token)throw new Error("undefined"==typeof n.token?"Empty token":"Wrong token type");if(""==n.token)throw new Error("Empty token");if("object"!=typeof n.functions||!(n.functions instanceof Array)||0==n.functions.length)throw new Error("Empty functions set");for(var t=0;t<n.functions.length;t++)this.checkFunction(n.functions[t])},MibewAPI.prototype.checkPackage=function(n){if("undefined"==typeof n.signature)throw new Error("Missed package signature");if("undefined"==typeof n.proto)throw new Error("Missed protocol version");if(n.proto!=this.protocolVersion)throw new Error("Wrong protocol version");if("undefined"==typeof n.async)throw new Error("'async' flag is missed");if("boolean"!=typeof n.async)throw new Error("Wrong 'async' flag value");if("object"!=typeof n.requests||!(n.requests instanceof Array)||0==n.requests.length)throw new Error("Empty requests set");for(var t=0;t<n.requests.length;t++)this.checkRequest(n.requests[t])},MibewAPI.prototype.getResultFunction=function(n,t){"undefined"==typeof t&&(t=null);var e=null;for(var r in n)if(n.hasOwnProperty(r)&&"result"==n[r]["function"]){if(null!==e)throw new Error("Function 'result' already exists in functions list");e=n[r]}if(t===!0&&null===e)throw new Error("There is no 'result' function in functions list");if(t===!1&&null!==e)throw new Error("There is 'result' function in functions list");return e},MibewAPI.prototype.buildResult=function(n,t){var e=n,r=this.interaction.getMandatoryArgumentsDefaults("result");for(var o in r)r.hasOwnProperty(o)&&(e[o]=r[o]);return{token:t,functions:[{"function":"result",arguments:e}]}},MibewAPI.prototype.encodePackage=function(n){var t={};return t.signature="",t.proto=this.protocolVersion,t.async=!0,t.requests=n,encodeURIComponent(JSON.stringify(t)).replace(/\%20/gi,"+")},MibewAPI.prototype.decodePackage=function(n){var t=JSON.parse(decodeURIComponent(n.replace(/\+/gi," ")));return this.checkPackage(t),t},MibewAPIInteraction.prototype.getMandatoryArguments=function(n){var t=this.mandatoryArguments(),e=[];if("object"==typeof t["*"])for(var r in t["*"])t["*"].hasOwnProperty(r)&&e.push(r);if("object"==typeof t[n])for(var r in t[n])t[n].hasOwnProperty(r)&&e.push(r);return e},MibewAPIInteraction.prototype.getMandatoryArgumentsDefaults=function(n){var t=this.mandatoryArguments(),e={};if("object"==typeof t["*"])for(var r in t["*"])t["*"].hasOwnProperty(r)&&(e[r]=t["*"][r]);if("object"==typeof t[n])for(var r in t[n])t[n].hasOwnProperty(r)&&(e[r]=t[n][r]);return e},MibewAPIExecutionContext.prototype.getArgumentsList=function(n){var t,e,r=n.arguments,o=n.arguments.references;for(var i in o)if(o.hasOwnProperty(i)){if(t=null,e=o[i],"undefined"==typeof this.functionsResults[e-1])throw new Error("Wrong reference in '"+n["function"]+"' function. Function #"+e+" does not call yet.");if("undefined"==typeof r[i]||""==r[i])throw new Error("Wrong reference in '"+n["function"]+"' function. Empty '"+i+"' argument.");if(t=r[i],"undefined"==typeof this.functionsResults[e-1][t])throw new Error("Wrong reference in '"+n["function"]+"' function. There is no '"+t+"' argument in #"+e+" function results");r[i]=this.functionsResults[e-1][t]}return r},MibewAPIExecutionContext.prototype.getResults=function(){return this.returnValues},MibewAPIExecutionContext.prototype.storeFunctionResults=function(n,t){var e;if(t.errorCode)this.returnValues.errorCode=t.errorCode,this.returnValues.errorMessage=t.errorMessage||"";else for(var r in n.arguments["return"])if(n.arguments["return"].hasOwnProperty(r)){if(e=n.arguments["return"][r],"undefined"==typeof t[r])throw new Error("Variable with name '"+r+"' is undefined in the results of the '"+n["function"]+"' function");this.returnValues[e]=t[r]}this.functionsResults.push(t)};