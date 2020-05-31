"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const CompileLessCommand = require("./CompileLessCommand");
const LESS_EXT = ".less";
const COMPILE_COMMAND = "easyLess.compile";
let lessDiagnosticCollection;
function activate(context) {
    lessDiagnosticCollection = vscode.languages.createDiagnosticCollection();
    // compile less command
    const compileLessSub = vscode.commands.registerCommand(COMPILE_COMMAND, () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            const document = activeEditor.document;
            if (document.fileName.endsWith(LESS_EXT)) {
                document.save();
                new CompileLessCommand(document, lessDiagnosticCollection).execute();
            }
            else {
                vscode.window.showWarningMessage("This command only works for .less files.");
            }
        }
        else {
            vscode.window.showInformationMessage("This command is only available when a .less editor is open.");
        }
    });
    // compile less on save when file is dirty
    const didSaveEvent = vscode.workspace.onDidSaveTextDocument(document => {
        if (document.fileName.endsWith(LESS_EXT)) {
            new CompileLessCommand(document, lessDiagnosticCollection).execute();
        }
    });
    // compile less on save when file is clean (clean saves don't trigger onDidSaveTextDocument, so use this as fallback)
    const willSaveEvent = vscode.workspace.onWillSaveTextDocument(e => {
        if (e.document.fileName.endsWith(LESS_EXT) && !e.document.isDirty) {
            new CompileLessCommand(e.document, lessDiagnosticCollection).execute();
        }
    });
    // dismiss less errors on file close
    const didCloseEvent = vscode.workspace.onDidCloseTextDocument((doc) => {
        if (doc.fileName.endsWith(LESS_EXT)) {
            lessDiagnosticCollection.delete(doc.uri);
        }
    });
    context.subscriptions.push(compileLessSub);
    context.subscriptions.push(willSaveEvent);
    context.subscriptions.push(didSaveEvent);
    context.subscriptions.push(didCloseEvent);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    if (lessDiagnosticCollection) {
        lessDiagnosticCollection.dispose();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=easyLess.js.map