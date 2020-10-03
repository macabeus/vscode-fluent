import * as vscode from 'vscode'
import { updateGlobalState } from './global-state'
import { updateDiagnosticCollection } from './diagnostic'
import registerCodeActionExtractStringToFluent from './providers/code-action-extract-string-to-fluent'
import definitionProvider from './providers/definition'
import hoverProvider from './providers/hover'
import { fileNameEndsWithFtl } from './utils'

const activate = (_context: vscode.ExtensionContext) => {
  vscode.workspace.findFiles('**/*.ftl')
    .then(uris =>
      uris.forEach(async (uri) => {
        const textDocument = await vscode.workspace.openTextDocument(uri)

        updateGlobalState({
          type: 'loadFtl',
          payload: { path: uri.path, content: textDocument.getText() },
        })

        updateDiagnosticCollection(uri.path)
      })
    )

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

  vscode.workspace.onDidChangeConfiguration(event => {
    updateGlobalState({ type: 'updateConfiguration' })
  })

  registerCodeActionExtractStringToFluent()
  vscode.languages.registerDefinitionProvider('fluent', definitionProvider)
  vscode.languages.registerHoverProvider('fluent', hoverProvider)
}

const deactivate = () => {
  // nothing to do when the extension is deactivated
}

export { activate, deactivate }
