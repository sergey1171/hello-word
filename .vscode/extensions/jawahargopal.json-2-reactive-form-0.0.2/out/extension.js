"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const clipboardy_1 = require("clipboardy");
const fs = require("fs");
const vscode_1 = require("vscode");
const util_1 = require("./util");
/**
 * Callback method on extension activation
 *
 *
 * @export
 * @param {ExtensionContext} context
 */
function activate(context) {
    /**
     * Get the form name to be created. The name given by the user will be appended with 'Form'.
     * For example, if the user is entering 'user' as the form name, the 'userForm' will be assigned
     * as the name of the Form.
     *
     * @returns {Promise<string>}
     */
    function promptFormName() {
        return __awaiter(this, void 0, void 0, function* () {
            let formName = yield vscode_1.window.showInputBox({
                prompt: "Form name?"
            });
            return formName || 'sample';
        });
    }
    /**
     * Generate reactive form from the clipboard and replace the current document content with the generated code.
     *
     */
    function createFromFromClipboard(textEditor) {
        return __awaiter(this, void 0, void 0, function* () {
            let json = yield clipboardy_1.read();
            if (!util_1.jsonIsValid(json)) {
                util_1.showErrorMessage(new Error('Clipboard does not contain valid JSON.'));
                return;
            }
            const parsedJson = JSON.parse(json);
            let code = yield getGeneratedSourceCode(parsedJson);
            textEditor.edit((editBuilder) => {
                editBuilder.replace(new vscode_1.Range(0, 0, 1, 0), code);
                util_1.formatDocument();
            });
        });
    }
    /**
     * Generate reactive form from the clipboard and paste it to the current cursor position.
     *
     */
    function createFormHereFromClipboard(textEditor) {
        return __awaiter(this, void 0, void 0, function* () {
            let json = yield clipboardy_1.read();
            if (!util_1.jsonIsValid(json)) {
                util_1.showErrorMessage(new Error('Clipboard does not contain valid JSON.'));
                return;
            }
            const currentPosition = textEditor.selection.active;
            const parsedJson = JSON.parse(json);
            let code = yield getGeneratedFormCode(parsedJson);
            textEditor.edit((editBuilder) => {
                editBuilder.insert(currentPosition, code);
                util_1.formatDocument();
            });
        });
    }
    /**
     * Generate reactive form from the selection. The selection content should be a valid JSON.
     *
     */
    function createFromFromSelection() {
        return __awaiter(this, void 0, void 0, function* () {
            const tmpFilePath = util_1.getTempFilePath();
            const tmpFileUri = vscode_1.Uri.file(tmpFilePath);
            util_1.getSelectedText()
                .then(util_1.checkSelectionLength)
                .then(util_1.getParsedJson)
                .then((json) => {
                return getGeneratedSourceCode(json);
            })
                .then((sourceCode) => {
                fs.writeFileSync(tmpFilePath, sourceCode);
            })
                .then(() => {
                vscode_1.commands.executeCommand('vscode.open', tmpFileUri, util_1.getViewColumn());
            })
                .then(util_1.formatDocument)
                .catch(util_1.showErrorMessage);
        });
    }
    /**
     * Generate reactive form from JSON file.
     *
     */
    function createFromFromFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const tmpFilePath = util_1.getTempFilePath();
            const tmpFileUri = vscode_1.Uri.file(tmpFilePath);
            util_1.getDocumentText()
                .then(util_1.checkSelectionLength)
                .then(util_1.getParsedJson)
                .then((json) => {
                return getGeneratedSourceCode(json);
            })
                .then((sourceCode) => {
                fs.writeFileSync(tmpFilePath, sourceCode);
            })
                .then(() => {
                vscode_1.commands.executeCommand('vscode.open', tmpFileUri, util_1.getViewColumn());
            })
                .then(util_1.formatDocument)
                .catch(util_1.showErrorMessage);
        });
    }
    context.subscriptions.push(vscode_1.commands.registerCommand('json2ReactiveForm.fromClipboard', () => {
        createFromFromClipboard(vscode_1.window.activeTextEditor || {});
    }), vscode_1.commands.registerCommand('json2ReactiveForm.fromSelection', (uri) => {
        createFromFromSelection();
    }), vscode_1.commands.registerCommand('json2ReactiveForm.fromFile', () => {
        createFromFromFile();
    }), vscode_1.commands.registerCommand('json2ReactiveForm.pasteFormHere', () => {
        createFormHereFromClipboard(vscode_1.window.activeTextEditor);
    }));
    /**
     * Get the generated source code snippets.
     *
     * @param {*} parsedJson
     * @param {string} [componentName]
     * @returns
     */
    function getGeneratedSourceCode(parsedJson, componentName) {
        return __awaiter(this, void 0, void 0, function* () {
            let formName = yield promptFormName();
            let code = `
// TODO : Copy the imports to the top of the file.
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
			
// TODO : Copy the below declarations inside the component class.
public ${formName}Form: FormGroup;
public submitted = false;

// TODO : Make sure that the \`FormBuilder\` is injected in the constructor.
constructor(private formBuilder: FormBuilder) { 

}
			
// TODO : Copy the form builder code to the \`ngOnInit\` callback.
ngOnInit() {
	this.${formName}Form = this.formBuilder.group({
	`;
            for (const key of Object.keys(parsedJson)) {
                code += key + ` :` + ` ['', Validators.required],
					`;
            }
            code = code.slice(0, -1);
            code += `
	});
}

/**
 * Get the form controls.
 */
get ${formName}FormControls() { return this.${formName}Form.controls; }

/**
 * TODO : Update the documentation
 */
onSubmit () {
	this.submitted = true;
	// Check whether the form is valid
	if (this.${formName}Form.valid) {
		// TODO : Do your stuff for ${componentName}
	}
}`;
            return code;
        });
    }
    /**
     * Generate the source code for the form builder form JSON.
     * This will not generate the associated imports and variable declarations.
     *
     * @param {*} parsedJson
     * @returns
     */
    function getGeneratedFormCode(parsedJson) {
        return __awaiter(this, void 0, void 0, function* () {
            let formName = yield promptFormName();
            let code = `
			
				this.${formName}Form = this.formBuilder.group({
				`;
            for (const key of Object.keys(parsedJson)) {
                code += key + ` :` + ` ['', Validators.required],
					`;
            }
            code = code.slice(0, -1);
            code += `
				});`;
            return code;
        });
    }
}
exports.activate = activate;
/**
 * Callback method to handle extension deactivation.
 *
 * @export
 */
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map