"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const vscode = require("vscode");
const path = require("path");
const Configuration = require("./Configuration");
const LessCompiler = require("./LessCompiler");
const StatusBarMessage = require("./StatusBarMessage");
const RANGE_EOL = 4096;
class CompileLessCommand {
    constructor(document, lessDiagnosticCollection) {
        this.document = document;
        this.lessDiagnosticCollection = lessDiagnosticCollection;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            StatusBarMessage.hideError();
            const globalOptions = Configuration.getGlobalOptions(this.document);
            const compilingMessage = StatusBarMessage.show("$(zap) Compiling less --> css", 1 /* INDEFINITE */);
            const startTime = Date.now();
            try {
                yield LessCompiler.compile(this.document.fileName, this.document.getText(), globalOptions);
                const elapsedTime = (Date.now() - startTime);
                compilingMessage.dispose();
                this.lessDiagnosticCollection.set(this.document.uri, []);
                StatusBarMessage.show(`$(check) Less compiled in ${elapsedTime}ms`, 0 /* SUCCESS */);
            }
            catch (error) {
                compilingMessage.dispose();
                let { message, range } = this.getErrorMessageAndRange(error);
                let affectedUri = this.getErrorAffectedUri(error);
                if (affectedUri === undefined || range === undefined) {
                    affectedUri = this.document.uri;
                    range = new vscode.Range(0, 0, 0, 0);
                }
                const diagnosis = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
                this.lessDiagnosticCollection.set(affectedUri, [diagnosis]);
                StatusBarMessage.show("$(alert) Error compiling less (more detail in Problems)", 2 /* ERROR */);
            }
        });
    }
    getErrorAffectedUri(error) {
        let affectedUri;
        if (error.filename) {
            affectedUri = vscode.Uri.file(error.filename);
            const isCurrentDocument = !error.filename.includes("/")
                && !error.filename.includes("\\")
                && error.filename === path.basename(this.document.fileName);
            if (isCurrentDocument) {
                affectedUri = this.document.uri;
            }
        }
        return affectedUri;
    }
    getErrorMessageAndRange(error) {
        if (error.code) {
            // fs errors
            const fileSystemError = error;
            switch (fileSystemError.code) {
                case 'EACCES':
                case 'ENOENT':
                    return {
                        message: `Cannot open file '${fileSystemError.path}'`,
                        range: new vscode.Range(0, 0, 0, RANGE_EOL),
                    };
            }
        }
        else if (error.line !== undefined && error.column !== undefined) {
            // less errors: try to highlight the affected range
            const lineIndex = error.line - 1;
            return {
                message: error.message,
                range: new vscode.Range(lineIndex, error.column, lineIndex, RANGE_EOL),
            };
        }
        return {
            message: error.message,
            range: new vscode.Range(0, 0, 0, RANGE_EOL),
        };
    }
}
module.exports = CompileLessCommand;
//# sourceMappingURL=CompileLessCommand.js.map