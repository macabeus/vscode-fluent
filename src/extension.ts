import * as vscode from 'vscode'
import { updateGlobalState } from './global-state'
import { updateDiagnosticCollection } from './diagnostic'
import definitionProvider from './providers/definition'
import hoverProvider from './providers/hover'
import { fileNameEndsWithFtl } from './utils'

const activate = (_context: vscode.ExtensionContext) => {
  vscode.workspace.textDocuments
    .filter(fileNameEndsWithFtl)
    .forEach(textDocument => {
      updateGlobalState({
        type: 'loadFtl',
        payload: { path: textDocument.uri.path, content: textDocument.getText() },
      })

      updateDiagnosticCollection(textDocument.uri.path)
    })

  vscode.workspace.onDidOpenTextDocument(textDocument => {
    if (fileNameEndsWithFtl(textDocument) === false) {
      return
    }

    updateGlobalState({
      type: 'loadFtl',
      payload: { path: textDocument.uri.path, content: textDocument.getText() },
    })

    updateDiagnosticCollection(textDocument.uri.path)
  })

  vscode.workspace.onDidChangeTextDocument(event => {
    if (fileNameEndsWithFtl(event.document) === false) {
      return
    }

    updateGlobalState({
      type: 'loadFtl',
      payload: { path: event.document.uri.path, content: event.document.getText() },
    })

    updateDiagnosticCollection(event.document.uri.path)
  })

  vscode.languages.registerDefinitionProvider('fluent', definitionProvider)
  vscode.languages.registerHoverProvider('fluent', hoverProvider)
}

const deactivate = () => {
  // nothing to do when the extension is deactivated
}

export { activate, deactivate }
