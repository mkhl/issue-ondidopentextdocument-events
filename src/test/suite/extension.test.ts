import { strict as assert } from 'assert';
import * as crypto from 'crypto';
import path = require('path');

import * as vscode from 'vscode';

suite('onDidOpenTextDocument', () => {
	const disposables = new Set<vscode.Disposable>();
	const opened = new Set<string>();

	async function reset() {
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
		opened.clear();
	}

	suiteSetup(() => {
		disposables.add(vscode.workspace.onDidOpenTextDocument((e) => {
			opened.add(e.fileName);
		}));
		disposables.add(vscode.workspace.onDidCloseTextDocument((e) => {
			opened.delete(e.fileName);
		}));
	});

	suiteTeardown(() => {
		disposables.forEach(d => d.dispose());
	});

	suite('for an existing file', () => {
		async function create() {
			const name = crypto.randomBytes(32).toString('hex');
			const file = path.resolve(__dirname, '../../../tmp', name);
			const uri = vscode.Uri.file(file);
			await vscode.workspace.fs.writeFile(uri, Uint8Array.of());
			return uri;
		}

		setup(reset);

		test('command:vscode.open fires the event', async () => {
			const uri = await create();
			const file = uri.fsPath;
			await vscode.commands.executeCommand('vscode.open', uri);
			assert(opened.has(file), `'${file}' should be opened: {${[...opened].join(', ')}}`);
			await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
			assert(!opened.has(file), `'${file}' should not be opened: {${[...opened].join(', ')}}`);
			await vscode.commands.executeCommand('vscode.open', uri);
			assert(opened.has(file), `'${file}' should be opened again: {${[...opened].join(', ')}}`);
		});

		test('openTextDocument fires the event', async () => {
			const uri = await create();
			const file = uri.fsPath;
			let doc = await vscode.workspace.openTextDocument(uri);
			await vscode.window.showTextDocument(doc);
			assert(opened.has(file), `'${file}' should be opened: {${[...opened].join(', ')}}`);
			await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
			assert(!opened.has(file), `'${file}' should not be opened: {${[...opened].join(', ')}}`);
			doc = await vscode.workspace.openTextDocument(uri);
			await vscode.window.showTextDocument(doc);
			assert(opened.has(file), `'${file}' should be opened again: {${[...opened].join(', ')}}`);
		});
	});

	suite('for a new file', () => {
		function create() {
			const name = crypto.randomBytes(32).toString('hex');
			const file = path.resolve(__dirname, '../../../tmp', name);
			return vscode.Uri.file(file).with({ scheme: 'untitled' });
		}

		setup(reset);

		test('command:vscode.open fires the event', async () => {
			const uri = create();
			const file = uri.fsPath;
			await vscode.commands.executeCommand('vscode.open', uri);
			assert(opened.has(file), `'${file}' should be opened: {${[...opened].join(', ')}}`);
			await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
			assert(!opened.has(file), `'${file}' should not be opened: {${[...opened].join(', ')}}`);
			await vscode.commands.executeCommand('vscode.open', uri);
			assert(opened.has(file), `'${file}' should be opened again: {${[...opened].join(', ')}}`);
		});

		test('openTextDocument fires the event', async () => {
			const uri = create();
			const file = uri.fsPath;
			let doc = await vscode.workspace.openTextDocument(uri);
			await vscode.window.showTextDocument(doc);
			assert(opened.has(file), `'${file}' should be opened: {${[...opened].join(', ')}}`);
			await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
			assert(!opened.has(file), `'${file}' should not be opened: {${[...opened].join(', ')}}`);
			doc = await vscode.workspace.openTextDocument(uri);
			await vscode.window.showTextDocument(doc);
			assert(opened.has(file), `'${file}' should be opened again: {${[...opened].join(', ')}}`);
		});
	});
});
