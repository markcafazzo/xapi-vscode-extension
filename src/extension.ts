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
		const ajv = new Ajv({allErrors: false});
		addFormats(ajv);

		const json = JSON.parse(selectedText ?? "");
		//const jsonSchema = JSON.stringify(xapischema);

		//locally created JSON Schema (instead of DTD, due to Rustici's TinCanValidator choice):
		const JSONSchema = {
			type: "object",
			properties: {
				statement: {
					type: "object",
					allOf: [
						{
							$ref: "#statement_base"
						}
					] 
				},
				statement_base: {
					$id: "#statement_base",
					type: "object",
					required: [
						"actor",
						"verb",
						"object"
					]
				}
			},
			required: ["statement"]
		};

		const validate = ajv.compile(JSONSchema);
		const valid = validate(json);

		//let warnings = validateStatement(json);

		// for (let element of warnings) {
		// 	let warningMessage = `Error at ${element.path} - ${element.data}, ${element.name}`;
		// 	vscode.window.showWarningMessage(warningMessage);	
		// };
		let errorArray = validate.errors;
		
		if (!valid) {
			errorArray.forEach((error: { instancePath: any; message: any; }) => {
				vscode.window.showWarningMessage(`${error.instancePath}: ${error.message}`);
			});
			
		} else {
			vscode.window.showInformationMessage("XAPI JSON is valid.");
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
export function deactivate() {}
