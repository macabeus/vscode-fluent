import * as vscode from 'vscode'
import { updateGlobalState } from './global-state'
import { updateDiagnosticCollection } from './diagnostic'
import definitionProvider from './providers/definition'
import hoverProvider from './providers/hover'

const activate = (_context: vscode.ExtensionContext) => {
  vscode.workspace.textDocuments
    .filter(textDocument =>
      textDocument.fileName.endsWith('.ftl'))
    .forEach(textDocument => {
      updateGlobalState({
        type: 'loadFtl',
        payload: { path: textDocument.uri.path, content: textDocument.getText() },
      })

      updateDiagnosticCollection(textDocument.uri.path)
    })

  vscode.workspace.onDidOpenTextDocument(event => {
    updateGlobalState({
      type: 'loadFtl',
      payload: { path: event.uri.path, content: event.getText() },
    })

    updateDiagnosticCollection(event.uri.path)
  })

  vscode.workspace.onDidChangeTextDocument(event => {
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
