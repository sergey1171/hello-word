"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const path = require("path");
const vscode_1 = require("vscode");
/**
 * Get the temporary file path.
 *
 * @export
 * @returns
 */
function getTempFilePath() {
    const tmpFilePath = path.join(os.tmpdir(), 'json-to-reactive-form.ts');
    return tmpFilePath;
}
exports.getTempFilePath = getTempFilePath;
/**
 * Show the error message.
 *
 * @export
 * @param {Error} error
 */
function showErrorMessage(error) {
    vscode_1.window.showErrorMessage(error.message);
}
exports.showErrorMessage = showErrorMessage;
/**
 * Check whether the JSON is valid.
 *
 * @export
 * @param {string} json
 * @returns
 */
function jsonIsValid(json) {
    try {
        JSON.parse(json);
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.jsonIsValid = jsonIsValid;
/**
 * Get the selected text from the editor.
 *
 * @export
 * @returns {Promise<string>}
 */
function getSelectedText() {
    const { selection, document } = vscode_1.window.activeTextEditor || {};
    return Promise.resolve(document.getText(selection).trim());
}
exports.getSelectedText = getSelectedText;
/**
 * Get the complete text content from the current document.
 *
 * @export
 * @returns {Promise<string>}
 */
function getDocumentText() {
    const { document } = vscode_1.window.activeTextEditor || {};
    return Promise.resolve(document.getText().trim());
}
exports.getDocumentText = getDocumentText;
/**
 * Get the view column
 *
 * @export
 * @returns {ViewColumn}
 */
function getViewColumn() {
    const activeEditor = vscode_1.window.activeTextEditor || {};
    if (!activeEditor) {
        return vscode_1.ViewColumn.One;
    }
    switch (activeEditor.viewColumn) {
        case vscode_1.ViewColumn.One:
            return vscode_1.ViewColumn.Two;
        case vscode_1.ViewColumn.Two:
            return vscode_1.ViewColumn.Three;
        case vscode_1.ViewColumn.Three:
            return vscode_1.ViewColumn.Four;
        case vscode_1.ViewColumn.Four:
            return vscode_1.ViewColumn.Five;
        case vscode_1.ViewColumn.Five:
            return vscode_1.ViewColumn.Six;
        case vscode_1.ViewColumn.Six:
            return vscode_1.ViewColumn.Seven;
        case vscode_1.ViewColumn.Seven:
            return vscode_1.ViewColumn.Eight;
        case vscode_1.ViewColumn.Eight:
            return vscode_1.ViewColumn.Nine;
        case vscode_1.ViewColumn.Nine:
            return vscode_1.ViewColumn.Nine;
    }
    return activeEditor.viewColumn || vscode_1.ViewColumn.One;
}
exports.getViewColumn = getViewColumn;
exports.checkSelectionLength = (selectedContent) => {
    if (selectedContent.length === 0) {
        return Promise.reject(new Error('Selection does not contain valid JSON'));
    }
    else {
        return Promise.resolve(selectedContent);
    }
};
/**
 * Get parsed JSON object from string.
 *
 * @export
 * @param {string} json
 * @returns {Promise<object>}
 */
function getParsedJson(json) {
    const tryEval = (jsonStr) => eval(`const a = ${jsonStr}; a`);
    try {
        return Promise.resolve(JSON.parse(json));
    }
    catch (exception) {
        // Do nothing
    }
    try {
        return Promise.resolve(tryEval(json));
    }
    catch (error) {
        return Promise.reject(new Error('Not a valid JSON'));
    }
}
exports.getParsedJson = getParsedJson;
/**
 * Get the current directory path.
 *
 * @export
 * @param {string} formName
 * @param {Uri} fileUri
 * @returns {string}
 */
function getDirPath(formName, fileUri) {
    //const dirPath = path.dirname(fileUri.fsPath);
    //const tmpFilePath = path.join(dirPath, formName + 'Component.ts');
    const tmpFilePath = 'untitled:' + formName + 'Component.ts';
    return tmpFilePath;
}
exports.getDirPath = getDirPath;
/**
 * Format the document.
 *
 * @export
 * @returns
 */
function formatDocument() {
    vscode_1.commands.executeCommand("editor.action.formatDocument");
    return Promise.resolve(true);
}
exports.formatDocument = formatDocument;
//# sourceMappingURL=util.js.map