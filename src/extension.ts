/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import { TextEncoder } from 'util';
import * as vscode from 'vscode';

const CREATE_FILE_COMMAND = 'eslint-refactor-br.createFile';
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand(CREATE_FILE_COMMAND, async (...args: any[]) => {
			const folder = vscode.workspace?.workspaceFolders != null ?
				vscode.workspace?.workspaceFolders[0].uri : (await vscode.window.showWorkspaceFolderPick())?.uri;
			if (folder) {
				const fileName = args[0];
				const name = args[1];
				vscode.workspace.fs.writeFile(vscode.Uri.joinPath(folder, fileName),
					new TextEncoder().encode(`function ${name}(){\n\t\n}\nmodule.exports = {\n\t${name}\n}`));
				
				const edit = vscode.window.activeTextEditor?.edit((editBuilder: vscode.TextEditorEdit) => {
					editBuilder.insert(new vscode.Position(0, 0), `const {${name}} = require('./${name}');\n`);
				});
			}

		})
	);

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('javascript', new Emojinfo(), {
			providedCodeActionKinds: Emojinfo.providedCodeActionKinds
		})
	);
}

export class Emojinfo implements vscode.CodeActionProvider {

	public static readonly providedCodeActionKinds = [
		vscode.CodeActionKind.QuickFix
	];

	provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.CodeAction[] {
		const actions: vscode.CodeAction[]=[];
		const diagnostics = context.diagnostics
			.filter(diagnostic => diagnostic.code as { value: string | number, target: vscode.Uri } !== undefined
				&& (diagnostic.code as { value: string | number, target: vscode.Uri }).value === 'no-undef');
		
		for (let i = 0; i < diagnostics.length; i++) {
			actions.push(createActions(diagnostics[i]));
		}
		
		return actions;
	}
}

function createActions(diagnostic: vscode.Diagnostic): vscode.CodeAction {
	const nomeDoArquivo = vscode.window.activeTextEditor?.document.getText(diagnostic.range);
	const extensao = 'js';
	const nomeCompleto = `${nomeDoArquivo}.${extensao}`;
	const action = new vscode.CodeAction(`Create "${nomeCompleto}"`, vscode.CodeActionKind.QuickFix);
	action.isPreferred = true;
	action.command = { title: `Create "${nomeCompleto}"`, command: CREATE_FILE_COMMAND, arguments: [nomeCompleto, nomeDoArquivo]};
	// action.command?.arguments?.push(nomeCompleto);
	// action.command!.command = CREATE_FILE_COMMAND;
	action.diagnostics = [diagnostic];

	return action;
}
