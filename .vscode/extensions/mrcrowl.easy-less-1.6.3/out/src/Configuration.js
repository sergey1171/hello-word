"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const extend = require("extend");
function getGlobalOptions(document) {
    const lessFilenamePath = path.parse(document.fileName);
    const defaultOptions = {
        plugins: [],
        rootFileInfo: getRootFileInfo(lessFilenamePath),
        relativeUrls: false
    };
    const configuredOptions = vscode.workspace.getConfiguration("less", document.uri).get("compile");
    return extend({}, defaultOptions, configuredOptions || {});
}
exports.getGlobalOptions = getGlobalOptions;
function getRootFileInfo(parsedPath) {
    parsedPath.ext = ".less";
    parsedPath.base = parsedPath.name + ".less";
    return {
        filename: parsedPath.base,
        currentDirectory: parsedPath.dir,
        relativeUrls: false,
        entryPath: parsedPath.dir + "/",
        rootpath: null,
        rootFilename: null
    };
}
exports.getRootFileInfo = getRootFileInfo;
//# sourceMappingURL=Configuration.js.map