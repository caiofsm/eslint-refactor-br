"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emojinfo = exports.activate = void 0;
const util_1 = require("util");
const vscode = require("vscode");
const CREATE_FILE_COMMAND = 'eslint-refactor-br.createFile';
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand(CREATE_FILE_COMMAND, async (...args) => {
        const folder = vscode.workspace?.workspaceFolders != null ?
            vscode.workspace?.workspaceFolders[0].uri : (await vscode.window.showWorkspaceFolderPick())?.uri;
        if (folder) {
            const fileName = args[0];
            const name = args[1];
            vscode.workspace.fs.writeFile(vscode.Uri.joinPath(folder, fileName), new util_1.TextEncoder().encode(`function ${name}(){\n\t\n}\nmodule.exports = {\n\t${name}\n}`));
            const edit = vscode.window.activeTextEditor?.edit((editBuilder) => {
                editBuilder.insert(new vscode.Position(0, 0), `const {${name}} = require('./${name}');\n`);
            });
        }
    }));
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider('javascript', new Emojinfo(), {
        providedCodeActionKinds: Emojinfo.providedCodeActionKinds
    }));
}
exports.activate = activate;
class Emojinfo {
    provideCodeActions(document, range, context, token) {
        const actions = [];
        const diagnostics = context.diagnostics
            .filter(diagnostic => diagnostic.code !== undefined
            && diagnostic.code.value === 'no-undef');
        for (let i = 0; i < diagnostics.length; i++) {
            actions.push(createActions(diagnostics[i]));
        }
        return actions;
    }
}
exports.Emojinfo = Emojinfo;
Emojinfo.providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
];
function createActions(diagnostic) {
    const nomeDoArquivo = vscode.window.activeTextEditor?.document.getText(diagnostic.range);
    const extensao = 'js';
    const nomeCompleto = `${nomeDoArquivo}.${extensao}`;
    const action = new vscode.CodeAction(`Create "${nomeCompleto}"`, vscode.CodeActionKind.QuickFix);
    action.isPreferred = true;
    action.command = { title: `Create "${nomeCompleto}"`, command: CREATE_FILE_COMMAND, arguments: [nomeCompleto, nomeDoArquivo] };
    // action.command?.arguments?.push(nomeCompleto);
    // action.command!.command = CREATE_FILE_COMMAND;
    action.diagnostics = [diagnostic];
    return action;
}
//# sourceMappingURL=extension.js.map