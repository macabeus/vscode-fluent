import * as vscode from 'vscode'
import { updateGlobalState, getMessageIdSpan, getMessageValueSpan, getMessageHover } from './global-state'
import { getIdentifierRangeAtPosition } from './utils'

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

  vscode.languages.registerDefinitionProvider('fluent', {
    provideDefinition(document, position, _cancellationToken) {
      const originSelectionRange = getIdentifierRangeAtPosition(document, position)
      const messageIdentifier = document.getText(originSelectionRange)

      const messageIdSpan = getMessageIdSpan(document.fileName, messageIdentifier)
      const messageIdPosition = document.positionAt(messageIdSpan.start)

      const messageValueSpan = getMessageValueSpan(document.fileName, messageIdentifier)
      const messageValuePosition = document.positionAt(messageValueSpan.end)

      return [
        {
          originSelectionRange,
          targetUri: vscode.Uri.file(document.fileName),
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
