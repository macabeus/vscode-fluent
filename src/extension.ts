import * as vscode from 'vscode'
import { updateGlobalState, getMessageHover } from './global-state'

const activate = (_context: vscode.ExtensionContext) => {
  vscode.workspace.textDocuments
    .filter(textDocument =>
      textDocument.fileName.endsWith('.ftl'))
    .forEach(textDocument =>
      updateGlobalState({
        type: 'loadFtl',
        payload: { path: textDocument.fileName, content: textDocument.getText() },
      }))

  vscode.workspace.onDidOpenTextDocument(event =>
    updateGlobalState({
      type: 'loadFtl',
      payload: { path: event.fileName, content: event.getText() },
    })
  )

  vscode.workspace.onDidChangeTextDocument(event =>
    updateGlobalState({
      type: 'loadFtl',
      payload: { path: event.document.fileName, content: event.document.getText() },
    })
  )

  vscode.languages.registerHoverProvider('fluent', {
    provideHover(document, position, _token) {
      const messageIdentifier = document.getText(document.getWordRangeAtPosition(position, /[a-zA-Z0-9-]+/))
      const content = getMessageHover(document.fileName, messageIdentifier)

      return {
        contents: [content],
      }
    },
  })
}

const deactivate = () => {
  // nothing to do when the extension is deactivated
}

export { activate, deactivate }
