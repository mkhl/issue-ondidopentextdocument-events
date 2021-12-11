# Issue: `onDidOpenTextDocument` events

During extension development I noticed that
opening files with `openTextDocument`
didn't always fire the `didOpenTextDocument` events I was expecting.

This test suite is there to explore and reproduce the problem.

## Reproduction

- `npm ci`
- `npm test`

## Expected results

All tests in the suite succeed.

## Actual results

The test for events fired by `openTextDocument`
followed by `showTextDocument`
for an existing file fails.

It seems like closing the editor with the text document
doesn't actually close the document
(and doesn't fire `onDidCloseTextDocument`),
so subsequent attempts to open the document
don't fire `onDidOpenTextDocument`.

The same sequence of events works for nonexistent files
(with the `untitled` uri scheme),
as does opening the file with the `vscode.open` command.

Other commands for closing editors (like `workbench.action.closeAllEditors`)
don't improve the situation,
and the API doesn't seem to provide any other method to close documents.

For more details, see the test suite in `src/test/suite/extension.test.ts`.
