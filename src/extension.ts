import * as vscode from 'vscode'
import {
  updateGlobalState,
  getMessageIdSpan,
  getMessageValueSpan,
  getMessageHover,
  isMessageReference,
} from './global-state'
import { getIdentifierRangeAtPosition } from './utils'
import { updateDiagnosticCollection } from './diagnostic'

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

  vscode.languages.registerDefinitionProvider('fluent', {
    provideDefinition(document, position, _cancellationToken) {
      const originSelectionRange = getIdentifierRangeAtPosition(document, position)
      const messageIdentifier = document.getText(originSelectionRange)

      if (isMessageReference(document.uri.path, messageIdentifier, document.offsetAt(position)) === false) {
        return
      }

      const messageIdSpan = getMessageIdSpan(document.uri.path, messageIdentifier)
      const messageIdPosition = document.positionAt(messageIdSpan.start)

      const messageValueSpan = getMessageValueSpan(document.uri.path, messageIdentifier)
      const messageValuePosition = document.positionAt(messageValueSpan.end)

      return [
        {
          originSelectionRange,
          targetUri: vscode.Uri.file(document.uri.path),
          targetRange: new vscode.Range(
            messageIdPosition,
            messageValuePosition
          ),
          targetSelectionRange: new vscode.Range(
            messageIdPosition,
            new vscode.Position(messageIdPosition.line, messageIdentifier.length)
          ),
        },
      ]
    },
  })

  vscode.languages.registerHoverProvider('fluent', {
    provideHover(document, position, _token) {
      const messageIdentifier = document.getText(getIdentifierRangeAtPosition(document, position))

      if (isMessageReference(document.uri.path, messageIdentifier, document.offsetAt(position)) === false) {
        return
      }

      const content = getMessageHover(document.uri.path, messageIdentifier)

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
