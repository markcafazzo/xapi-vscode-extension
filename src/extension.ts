// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import validateStatement from 'xapi-validation';
import xapischema from './xapi-schema.json';
const Ajv = require('ajv');
const addFormats = require("ajv-formats");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Extension "xapi-tools" activated...');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposableV = vscode.commands.registerCommand('xapi-tools.xapivalidate', () => {
		// The code you place here will be executed every time your command is executed

		/*NOTES 
		file operations
		---------------
		vscode.window.activeTextEditor
		vscode.window.visibleTextEditors
		vscode.workspace.textDocuments

		for always-on validation by file type (package.json)
		----------------------------------------------------
		
			"jsonValidation": [
				{
					"fileMatch": "*.xst.json",
					"url": "./xapi-schema.json"
				}
			],

		*/

		const editor = vscode.window.activeTextEditor;
		const selectedText = editor?.document.getText(editor.selection);
		const ajv = new Ajv({ allErrors: false, formats: { sha1: true, sha2: true, mimetype: true, langtag: true } });
		addFormats(ajv, { mode: "fast" });

		const json = JSON.parse(selectedText ?? "");
		//const jsonSchema = JSON.stringify(xapischema);

		const testStatementSchema = {
			type: "object",
			properties: {
				statement: {
					$id: "#statement",
					type: "object",
					required: [
						"actor",
						"verb",
						"object"
					],
					properties: {
						$id: {},
						actor: {},
						verb: {},
						object: {
							$id: "#object",
							type: "object",
							required: [
								"activity"
							],
							properties: {
								activity: {
									required: [
										"$id"
									],
									properties: {
										$id: {}
									},
									additionalProperties: false
								}
							},
							additionalProperties: false
						},
						result: {},
						context: {},
						timestamp: {},
						stored: {},
						authority: {},
						version: {},
						attachments: {}
					},
					additionalProperties: false
				}
			},
			required: ["statement"]
		}

		//locally created JSON Schema (instead of DTD, due to Rustici's TinCanValidator choice):
		const statementSchema = {
			type: "object",
			properties: {
				account: {
					$id: "#account",
					type: "object",
					required: [
						"account"
					],
					properties: {
						account: {
							$id: "#account!core",
							type: "object",
							additionalProperties: false,
							required: [
								"homePage",
								"name"
							],
							properties: {
								homePage: {
									type: "string",
									format: "uri"
								},
								name: {
									type: "string"
								}
							}
						},
						mbox: {
							type: "null"
						},
						mbox_sha1sum: {
							type: "null"
						},
						openid: {
							type: "null"
						}
					}
				},
				activityid: {
					$id: "#activityid",
					type: "object",
					required: [
						"activityId"
					],
					properties: {
						activityId: {
							$id: "#activityid!core",
							type: "string",
							format: "uri"
						}
					}
				},
				activity_definition: {
					$id: "#activity_definition",
					type: "object",
					oneOf: [
						{
							properties: {
								interactionType: {
									type: "null"
								},
								correctResponsesPattern: {
									type: "null"
								},
								choices: {
									type: "null"
								},
								scale: {
									type: "null"
								},
								source: {
									type: "null"
								},
								target: {
									type: "null"
								},
								steps: {
									type: "null"
								}
							}
						},
						{
							$ref: "#interactionactivity"
						}
					],
					additionalProperties: false,
					properties: {
						name: {
							$ref: "#languagemap"
						},
						description: {
							$ref: "#languagemap"
						},
						type: {
							type: "string",
							format: "uri"
						},
						moreInfo: {
							type: "string",
							format: "uri"
						},
						interactionType: {},
						correctResponsesPattern: {},
						choices: {},
						scale: {},
						source: {},
						target: {},
						steps: {},
						extensions: {
							$ref: "#extensions"
						}
					}
				},
				activity: {
					$id: "#activity",
					type: "object",
					required: [
						"$id"
					],
					additionalProperties: false,
					properties: {
						objectType: {
							enum: [
								"Activity"
							]
						},
						$id: {
							$ref: "#activityid!core"
						},
						definition: {
							$ref: "#activity_definition"
						}
					}
				},
				extensions: {
					$id: "#extensions",
					patternProperties: {
						pattern: {}
					},
					additionalProperties: false
				},
				interactionactivity_base: {
					$id: "#interactionactivity_base",
					type: "object",
					properties: {
						correctResponsesPattern: {
							type: "array",
							items: {
								type: "string"
							}
						}
					}
				},
				interactionactivity_choices: {
					$id: "#interactionactivity_choices",
					type: "object",
					allOf: [
						{
							$ref: "#interactionactivity_base"
						}
					],
					required: [
						"choices",
						"interactionType"
					],
					properties: {
						choices: {
							$ref: "#interactioncomponent_list"
						},
						scale: {
							type: "null"
						},
						source: {
							type: "null"
						},
						target: {
							type: "null"
						},
						steps: {
							type: "null"
						},
						interactionType: {
							enum: [
								"choice",
								"sequencing"
							]
						}
					}
				},
				interactionactivity_scale: {
					$id: "#interactionactivity_scale",
					type: "object",
					allOf: [
						{
							$ref: "#interactionactivity_base"
						}
					],
					required: [
						"scale",
						"interactionType"
					],
					properties: {
						choices: {
							type: "null"
						},
						scale: {
							$ref: "#interactioncomponent_list"
						},
						source: {
							type: "null"
						},
						target: {
							type: "null"
						},
						steps: {
							type: "null"
						},
						interactionType: {
							enum: [
								"likert"
							]
						}
					}
				},
				interactionactivity_none: {
					$id: "#interactionactivity_none",
					type: "object",
					required: [
						"interactionType"
					],
					allOf: [
						{
							$ref: "#interactionactivity_base"
						},
						{
							oneOf: [
								{
									properties: {
										interactionType: {
											enum: [
												"true-false"
											]
										},
										correctResponsesPattern: {
											type: "array",
											items: {
												enum: [
													"true",
													"false"
												]
											}
										}
									}
								},
								{
									not: {
										properties: {
											interactionType: {
												enum: [
													"true-false"
												]
											}
										}
									}
								}
							]
						}
					],
					properties: {
						choices: {
							type: "null"
						},
						scale: {
							type: "null"
						},
						source: {
							type: "null"
						},
						target: {
							type: "null"
						},
						steps: {
							type: "null"
						},
						interactionType: {
							enum: [
								"true-false",
								"fill-in",
								"long-fill-in",
								"numeric",
								"other"
							]
						}
					}
				},
				interactionactivity_sourcetarget: {
					$id: "#interactionactivity_sourcetarget",
					type: "object",
					allOf: [
						{
							$ref: "#interactionactivity_base"
						}
					],
					required: [
						"source",
						"target",
						"interactionType"
					],
					properties: {
						choices: {
							type: "null"
						},
						scale: {
							type: "null"
						},
						source: {
							$ref: "#interactioncomponent_list"
						},
						target: {
							$ref: "#interactioncomponent_list"
						},
						steps: {
							type: "null"
						},
						interactionType: {
							enum: [
								"matching"
							]
						}
					}
				},
				interactionactivity_steps: {
					$id: "#interactionactivity_steps",
					type: "object",
					allOf: [
						{
							$ref: "#interactionactivity_base"
						}
					],
					required: [
						"steps",
						"interactionType"
					],
					properties: {
						choices: {
							type: "null"
						},
						scale: {
							type: "null"
						},
						source: {
							type: "null"
						},
						target: {
							type: "null"
						},
						steps: {
							$ref: "#interactioncomponent_list"
						},
						interactionType: {
							enum: [
								"performance"
							]
						}
					}
				},
				interactioncomponent: {
					$id: "#interactioncomponent",
					type: "object",
					required: [
						"$id"
					],
					properties: {
						$id: {
							type: "string",
							minLength: 1
						},
						description: {
							$ref: "#languagemap"
						}
					}
				},
				interactioncomponent_list: {
					$id: "#interactioncomponent_list",
					type: "array",
					items: {
						$ref: "#interactioncomponent"
					},
					minItems: 1
				},
				interactionactivity: {
					$id: "#interactionactivity",
					type: "object",
					oneOf: [
						{
							$ref: "#interactionactivity_choices"
						},
						{
							$ref: "#interactionactivity_scale"
						},
						{
							$ref: "#interactionactivity_sourcetarget"
						},
						{
							$ref: "#interactionactivity_steps"
						},
						{
							$ref: "#interactionactivity_none"
						}
					]
				},
				languagemap: {
					$id: "#languagemap",
					type: "object",
					patternProperties: {
						pattern: {
							type: "string"
						}
					},
					additionalProperties: false
				},
				statement: {
					$id: "#statement",
					type: "object",
					// allOf: [
					// 	{
					// 		$ref: "#statement_base"
					// 	}
					// ],
					properties: {
						objectType: {
							type: "null"
						},
						$id: {},
						actor: {},
						verb: {},
						object: {},
						result: {},
						context: {},
						timestamp: {},
						stored: {},
						authority: {},
						version: {},
						attachments: {}
					},
					additionalProperties: false
				},
				statement_base: {
					$id: "#statement_base",
					type: "object",
					required: [
						"actor",
						"verb",
						"object"
					],
					oneOf: [
						{
							required: [
								"object"
							],
							properties: {
								object: {
									$ref: "#activity"
								}
							}
						},
						{
							required: [
								"object"
							],
							properties: {
								object: {
									not: {
										$ref: "#activity"
									}
								},
								context: {
									properties: {
										revision: {
											type: "null"
										},
										platform: {
											type: "null"
										}
									}
								}
							}
						}
					],
					additionalProperties: false
				}
			},
			required: ["statement"]
		};

		const JSONSchemaWithQuotes = `{
			"type": "object",
			"properties": {
				"account": {
					"$id": "#account",
					"type": "object",
					"required": [
						"account"
					],
					"properties": {
						"account": {
							"$id": "#account!core",
							"type": "object",
							"additionalProperties": false,
							"required": [
								"homePage",
								"name"
							],
							"properties": {
								"homePage": {
									"type": "string",
									"format": "uri"
								},
								"name": {
									"type": "string"
								}
							}
						},
						"mbox": {
							"type": "null"
						},
						"mbox_sha1sum": {
							"type": "null"
						},
						"openid": {
							"type": "null"
						}
					}
				},
				"activityid": {
					"$id": "#activityid",
					"type": "object",
					"required": [
						"activityId"
					],
					"properties": {
						"activityId": {
							"$id": "#activityid!core",
							"type": "string",
							"format": "uri"
						}
					}
				},
				"activity": {
					"$id": "#activity",
					"type": "object",
					"required": [
						"$id"
					],
					"additionalProperties": false,
					"properties": {
						"objectType": {
							"enum": [
								"Activity"
							]
						},
						"$id": {
							"$ref": "#activityid!core"
						},
						"definition": {
							"$ref": "#activity_definition"
						}
					}
				},
				"about": {
					"$id": "#about",
					"type": "object",
					"required": [
						"version"
					],
					"additionalProperties": false,
					"properties": {
						"version": {
							"type": "string"
						},
						"extensions": {
							"$ref": "#extensions"
						}
					}
				},
				"activity_definition": {
					"$id": "#activity_definition",
					"type": "object",
					"oneOf": [
						{
							"properties": {
								"interactionType": {
									"type": "null"
								},
								"correctResponsesPattern": {
									"type": "null"
								},
								"choices": {
									"type": "null"
								},
								"scale": {
									"type": "null"
								},
								"source": {
									"type": "null"
								},
								"target": {
									"type": "null"
								},
								"steps": {
									"type": "null"
								}
							}
						},
						{
							"$ref": "#interactionactivity"
						}
					],
					"additionalProperties": false,
					"properties": {
						"name": {
							"$ref": "#languagemap"
						},
						"description": {
							"$ref": "#languagemap"
						},
						"type": {
							"type": "string",
							"format": "uri"
						},
						"moreInfo": {
							"type": "string",
							"format": "uri"
						},
						"interactionType": {},
						"correctResponsesPattern": {},
						"choices": {},
						"scale": {},
						"source": {},
						"target": {},
						"steps": {},
						"extensions": {
							"$ref": "#extensions"
						}
					}
				},
				"agent": {
					"$id": "#agent",
					"allOf": [
						{
							"$ref": "#inversefunctional"
						}
					],
					"properties": {
						"name": {
							"type": "string"
						},
						"objectType": {
							"enum": [
								"Agent"
							]
						},
						"mbox": {},
						"mbox_sha1sum": {},
						"account": {},
						"openid": {}
					},
					"additionalProperties": false
				},
				"activity_list_or_obj": {
					"$id": "#activity_list_or_obj",
					"oneOf": [
						{
							"type": "array",
							"items": {
								"$ref": "#activity"
							}
						},
						{
							"$ref": "#activity"
						}
					]
				},
				"attachment": {
					"$id": "#attachment",
					"type": "object",
					"additionalProperties": false,
					"required": [
						"usageType",
						"display",
						"contentType",
						"length",
						"sha2"
					],
					"properties": {
						"usageType": {
							"type": "string",
							"format": "uri"
						},
						"display": {
							"$ref": "#languagemap"
						},
						"description": {
							"$ref": "#languagemap"
						},
						"contentType": {
							"type": "string",
							"format": "mimetype"
						},
						"length": {
							"type": "number",
							"minimum": 0
						},
						"sha2": {
							"type": "string",
							"format": "sha2"
						},
						"fileUrl": {
							"type": "string",
							"format": "uri"
						}
					}
				},
				"anonymousgroup": {
					"$id": "#anonymousgroup",
					"allOf": [
						{
							"$ref": "#group_base"
						}
					],
					"required": [
						"member"
					],
					"properties": {
						"member": {},
						"name": {},
						"objectType": {}
					},
					"additionalProperties": false
				},
				"context": {
					"$id": "#context",
					"type": "object",
					"additionalProperties": false,
					"properties": {
						"registration": {
							"type": "string",
							"format": "uuid"
						},
						"instructor": {
							"oneOf": [
								{
									"$ref": "#agent"
								},
								{
									"$ref": "#group"
								}
							]
						},
						"team": {
							"allOf": [
								{
									"$ref": "#group"
								}
							]
						},
						"contextActivities": {
							"$ref": "#contextactivities"
						},
						"revision": {
							"type": "string"
						},
						"platform": {
							"type": "string"
						},
						"language": {
							"type": "string",
							"format": "langtag"
						},
						"statement": {
							"$ref": "#statementref"
						},
						"extensions": {
							"$ref": "#extensions"
						}
					}
				},
				"contextactivities": {
					"$id": "#contextactivities",
					"type": "object",
					"additionalProperties": false,
					"properties": {
						"parent": {
							"$ref": "#activity_list_or_obj"
						},
						"grouping": {
							"$ref": "#activity_list_or_obj"
						},
						"category": {
							"$ref": "#activity_list_or_obj"
						},
						"other": {
							"$ref": "#activity_list_or_obj"
						}
					}
				},
				"extensions": {
					"$id": "#extensions",
					"patternProperties": {
						"pattern": {}
					},
					"additionalProperties": false
				},
				"group": {
					"$id": "#group",
					"oneOf": [
						{
							"$ref": "#anonymousgroup"
						},
						{
							"$ref": "#identifiedgroup"
						}
					]
				},
				"identifiedgroup": {
					"$id": "#identifiedgroup",
					"allOf": [
						{
							"$ref": "#inversefunctional"
						},
						{
							"$ref": "#group_base"
						}
					],
					"properties": {
						"name": {},
						"objectType": {},
						"member": {},
						"mbox": {},
						"mbox_sha1sum": {},
						"account": {},
						"openid": {}
					},
					"additionalProperties": false
				},
				"interactionactivity": {
					"$id": "#interactionactivity",
					"type": "object",
					"oneOf": [
						{
							"$ref": "#interactionactivity_choices"
						},
						{
							"$ref": "#interactionactivity_scale"
						},
						{
							"$ref": "#interactionactivity_sourcetarget"
						},
						{
							"$ref": "#interactionactivity_steps"
						},
						{
							"$ref": "#interactionactivity_none"
						}
					]
				},
				"group_base": {
					"$id": "#group_base",
					"type": "object",
					"required": [
						"objectType"
					],
					"properties": {
						"name": {
							"type": "string"
						},
						"objectType": {
							"enum": [
								"Group"
							]
						},
						"member": {
							"type": "array",
							"items": {
								"$ref": "#agent"
							}
						}
					}
				},
				"interactionactivity_base": {
					"$id": "#interactionactivity_base",
					"type": "object",
					"properties": {
						"correctResponsesPattern": {
							"type": "array",
							"items": {
								"type": "string"
							}
						}
					}
				},
				"interactionactivity_choices": {
					"$id": "#interactionactivity_choices",
					"type": "object",
					"allOf": [
						{
							"$ref": "#interactionactivity_base"
						}
					],
					"required": [
						"choices",
						"interactionType"
					],
					"properties": {
						"choices": {
							"$ref": "#interactioncomponent_list"
						},
						"scale": {
							"type": "null"
						},
						"source": {
							"type": "null"
						},
						"target": {
							"type": "null"
						},
						"steps": {
							"type": "null"
						},
						"interactionType": {
							"enum": [
								"choice",
								"sequencing"
							]
						}
					}
				},
				"interactionactivity_scale": {
					"$id": "#interactionactivity_scale",
					"type": "object",
					"allOf": [
						{
							"$ref": "#interactionactivity_base"
						}
					],
					"required": [
						"scale",
						"interactionType"
					],
					"properties": {
						"choices": {
							"type": "null"
						},
						"scale": {
							"$ref": "#interactioncomponent_list"
						},
						"source": {
							"type": "null"
						},
						"target": {
							"type": "null"
						},
						"steps": {
							"type": "null"
						},
						"interactionType": {
							"enum": [
								"likert"
							]
						}
					}
				},
				"interactionactivity_none": {
					"$id": "#interactionactivity_none",
					"type": "object",
					"required": [
						"interactionType"
					],
					"allOf": [
						{
							"$ref": "#interactionactivity_base"
						},
						{
							"oneOf": [
								{
									"properties": {
										"interactionType": {
											"enum": [
												"true-false"
											]
										},
										"correctResponsesPattern": {
											"type": "array",
											"items": {
												"enum": [
													"true",
													"false"
												]
											}
										}
									}
								},
								{
									"not": {
										"properties": {
											"interactionType": {
												"enum": [
													"true-false"
												]
											}
										}
									}
								}
							]
						}
					],
					"properties": {
						"choices": {
							"type": "null"
						},
						"scale": {
							"type": "null"
						},
						"source": {
							"type": "null"
						},
						"target": {
							"type": "null"
						},
						"steps": {
							"type": "null"
						},
						"interactionType": {
							"enum": [
								"true-false",
								"fill-in",
								"long-fill-in",
								"numeric",
								"other"
							]
						}
					}
				},
				"interactionactivity_sourcetarget": {
					"$id": "#interactionactivity_sourcetarget",
					"type": "object",
					"allOf": [
						{
							"$ref": "#interactionactivity_base"
						}
					],
					"required": [
						"source",
						"target",
						"interactionType"
					],
					"properties": {
						"choices": {
							"type": "null"
						},
						"scale": {
							"type": "null"
						},
						"source": {
							"$ref": "#interactioncomponent_list"
						},
						"target": {
							"$ref": "#interactioncomponent_list"
						},
						"steps": {
							"type": "null"
						},
						"interactionType": {
							"enum": [
								"matching"
							]
						}
					}
				},
				"interactionactivity_steps": {
					"$id": "#interactionactivity_steps",
					"type": "object",
					"allOf": [
						{
							"$ref": "#interactionactivity_base"
						}
					],
					"required": [
						"steps",
						"interactionType"
					],
					"properties": {
						"choices": {
							"type": "null"
						},
						"scale": {
							"type": "null"
						},
						"source": {
							"type": "null"
						},
						"target": {
							"type": "null"
						},
						"steps": {
							"$ref": "#interactioncomponent_list"
						},
						"interactionType": {
							"enum": [
								"performance"
							]
						}
					}
				},
				"interactioncomponent": {
					"$id": "#interactioncomponent",
					"type": "object",
					"required": [
						"$id"
					],
					"properties": {
						"$id": {
							"type": "string",
							"minLength": 1
						},
						"description": {
							"$ref": "#languagemap"
						}
					}
				},
				"interactioncomponent_list": {
					"$id": "#interactioncomponent_list",
					"type": "array",
					"items": {
						"$ref": "#interactioncomponent"
					},
					"minItems": 1
				},
				"inversefunctional": {
					"$id": "#inversefunctional",
					"oneOf": [
						{
							"$ref": "#mbox"
						},
						{
							"$ref": "#mbox_sha1sum"
						},
						{
							"$ref": "#openid"
						},
						{
							"$ref": "#account"
						}
					]
				},
				"languagemap": {
					"$id": "#languagemap",
					"type": "object",
					"patternProperties": {
						"pattern": {
							"type": "string"
						}
					},
					"additionalProperties": false
				},
				"mbox": {
					"$id": "#mbox",
					"type": "object",
					"required": [
						"mbox"
					],
					"properties": {
						"mbox": {
							"$id": "#mbox!core",
							"type": "string",
							"format": "email"
						},
						"mbox_sha1sum": {
							"type": "null"
						},
						"openid": {
							"type": "null"
						},
						"account": {
							"type": "null"
						}
					}
				},
				"mbox_sha1sum": {
					"$id": "#mbox_sha1sum",
					"type": "object",
					"required": [
						"mbox_sha1sum"
					],
					"properties": {
						"mbox_sha1sum": {
							"$id": "#mbox_sha1sum!core",
							"type": "string",
							"format": "sha1"
						},
						"mbox": {
							"type": "null"
						},
						"openid": {
							"type": "null"
						},
						"account": {
							"type": "null"
						}
					}
				},
				"openid": {
					"$id": "#openid",
					"type": "object",
					"required": [
						"openid"
					],
					"properties": {
						"openid": {
							"$id": "#openid!core",
							"type": "string",
							"format": "uri"
						},
						"mbox": {
							"type": "null"
						},
						"mbox_sha1sum": {
							"type": "null"
						},
						"account": {
							"type": "null"
						}
					}
				},
				"result": {
					"$id": "#result",
					"type": "object",
					"properties": {
						"score": {
							"$ref": "#score"
						},
						"success": {
							"type": "boolean"
						},
						"completion": {
							"type": "boolean"
						},
						"response": {
							"type": "string"
						},
						"duration": {
							"type": "string",
							"format": "duration"
						},
						"extensions": {
							"$ref": "#extensions"
						}
					},
					"additionalProperties": false
				},
				"person": {
					"$id": "#person",
					"type": "object",
					"additionalProperties": false,
					"required": [
						"objectType"
					],
					"properties": {
						"objectType": {
							"enum": [
								"Person"
							]
						},
						"name": {
							"type": "array",
							"items": {
								"type": "string"
							}
						},
						"mbox": {
							"type": "array",
							"items": {
								"$ref": "#mbox!core"
							}
						},
						"mbox_sha1sum": {
							"type": "array",
							"items": {
								"$ref": "#mbox_sha1sum!core"
							}
						},
						"openid": {
							"type": "array",
							"items": {
								"$ref": "#openid!core"
							}
						},
						"account": {
							"type": "array",
							"items": {
								"$ref": "#account!core"
							}
						}
					}
				},
				"score": {
					"$id": "#score",
					"type": "object",
					"additionalProperties": false,
					"properties": {
						"scaled": {
							"type": "number",
							"minimum": -1,
							"maximum": 1
						},
						"raw": {
							"type": "number"
						},
						"min": {
							"type": "number"
						},
						"max": {
							"type": "number"
						}
					}
				},
				"statementresult": {
					"$id": "#statementresult",
					"type": "object",
					"additionalProperties": false,
					"required": [
						"statements"
					],
					"properties": {
						"statements": {
							"$ref": "#statement_list"
						},
						"more": {
							"type": "string",
							"format": "uri"
						}
					}
				},
				"statement_object": {
					"$id": "#statement_object",
					"type": "object",
					"oneOf": [
						{
							"$ref": "#activity"
						},
						{
							"required": [
								"objectType"
							],
							"oneOf": [
								{
									"$ref": "#agent"
								},
								{
									"$ref": "#group"
								},
								{
									"$ref": "#statementref"
								},
								{
									"$ref": "#substatement"
								}
							]
						}
					]
				},
				"statement": {
					"$id": "#statement",
					"type": "object",
					"allOf": [
						{
							"$ref": "#statement_base"
						}
					],
					"properties": {
						"objectType": {
							"type": "null"
						},
						"$id": {},
						"actor": {},
						"verb": {},
						"object": {},
						"result": {},
						"context": {},
						"timestamp": {},
						"stored": {},
						"authority": {},
						"version": {},
						"attachments": {}
					},
					"additionalProperties": false
				},
				"statementref": {
					"$id": "#statementref",
					"type": "object",
					"additionalProperties": false,
					"required": [
						"objectType",
						"$id"
					],
					"properties": {
						"objectType": {
							"enum": [
								"StatementRef"
							]
						},
						"$id": {
							"type": "string",
							"format": "uuid"
						}
					}
				},
				"statement_list": {
					"$id": "#statement_list",
					"type": "array",
					"items": {
						"$ref": "#statement"
					}
				},
				"statement_base": {
					"$id": "#statement_base",
					"type": "object",
					"required": [
						"actor",
						"verb",
						"object"
					],
					"oneOf": [
						{
							"required": [
								"object"
							],
							"properties": {
								"object": {
									"$ref": "#activity"
								}
							}
						},
						{
							"required": [
								"object"
							],
							"properties": {
								"object": {
									"not": {
										"$ref": "#activity"
									}
								},
								"context": {
									"properties": {
										"revision": {
											"type": "null"
										},
										"platform": {
											"type": "null"
										}
									}
								}
							}
						}
					],
					"additionalProperties": false,
					"properties": {
						"objectType": {},
						"$id": {
							"type": "string",
							"format": "uuid"
						},
						"actor": {
							"oneOf": [
								{
									"$ref": "#agent"
								},
								{
									"$ref": "#group"
								}
							]
						},
						"verb": {
							"$ref": "#verb"
						},
						"object": {
							"$ref": "#statement_object"
						},
						"result": {
							"$ref": "#result"
						},
						"context": {
							"$ref": "#context"
						},
						"timestamp": {
							"type": "string",
							"format": "date"
						},
						"stored": {
							"type": "string",
							"format": "date"
						},
						"authority": {
							"oneOf": [
								{
									"$ref": "#agent"
								},
								{
									"allOf": [
										{
											"$ref": "#anonymousgroup"
										}
									],
									"properties": {
										"member": {
											"type": "array",
											"items": {
												"$ref": "#agent"
											},
											"minItems": 2,
											"maxItems": 2
										}
									}
								}
							]
						},
						"attachments": {
							"type": "array",
							"items": {
								"$ref": "#attachment"
							}
						}
					}
				},
				"substatement": {
					"$id": "#substatement",
					"allOf": [
						{
							"$ref": "#statement_base"
						}
					],
					"required": [
						"objectType"
					],
					"additionalProperties": false,
					"properties": {
						"objectType": {
							"enum": [
								"SubStatement"
							]
						},
						"$id": {
							"type": "null"
						},
						"stored": {
							"type": "null"
						},
						"version": {},
						"authority": {
							"type": "null"
						},
						"object": {
							"not": {
								"required": [
									"objectType"
								],
								"properties": {
									"objectType": {
										"enum": [
											"SubStatement"
										]
									}
								}
							}
						},
						"actor": {},
						"verb": {},
						"result": {},
						"context": {},
						"timestamp": {},
						"attachments": {}
					}
				},
				"verb": {
					"$id": "#verb",
					"type": "object",
					"required": [
						"$id"
					],
					"properties": {
						"$id": {
							"type": "string",
							"format": "uri"
						},
						"display": {
							"$ref": "#languagemap"
						}
					},
					"additionalProperties": false
				}
			}
		}`;
		//const XAPISchema = JSON.parse(JSONSchemaWithQuotes);

		const validate = ajv.compile(statementSchema);
		const valid = validate(json);

		//let warnings = validateStatement(json);

		// for (let element of warnings) {
		// 	let warningMessage = `Error at ${element.path} - ${element.data}, ${element.name}`;
		// 	vscode.window.showWarningMessage(warningMessage);	
		// };
		let errorArray = validate.errors;
		if (!valid) {
			errorArray.forEach((error: { instancePath: any; message: any; params: any; }) => {
				vscode.window.showInformationMessage(`${error.instancePath}: ${error.message} \nFix the errors, select the JSON \nand re-run validation.`,
					{ modal: true, }, "OK").then((response) => {
						vscode.window.showInformationMessage(`${error.instancePath}: ${error.message}`, "Re-validate", "Not ready").then((response) => {
							if (response == 'Re-validate') {
								vscode.commands.executeCommand('xapi-tools.xapivalidate');
							}
						});
					});
			});
		} else {
			//const options = {title: "XAPI JSON is valid.", saveLabel: "OK!"};
			vscode.window.showInformationMessage("XAPI JSON is valid.", "OK");
		}

		// const documents = vscode.workspace.textDocuments;
		// documents.forEach(element => {
		// 	vscode.workspace.openTextDocument(element.uri).then((doc) => {
		// 		let txt = doc.getText();
		// 		let warnings = validateStatement(JSON.stringify(txt));
		// 		vscode.window.showInformationMessage(warnings[0].message);
		// 	});
		// });	
	});

	let disposableT = vscode.commands.registerCommand('xapi-tools.time', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const currentTime = new Date().toLocaleTimeString();
		const utcTime = new Date();
		const utcString = `${("0" + utcTime.getUTCHours()).slice(-2)}:
		${("0" + utcTime.getUTCMinutes()).slice(-2)}:
		${("0" + utcTime.getUTCSeconds()).slice(-2)}`

		vscode.window.showInformationMessage(`Current local time is ${currentTime}. (UTC: ${utcString})`);
	});

	context.subscriptions.push(disposableV, disposableT);
}

// this method is called when your extension is deactivated
export function deactivate() { }
