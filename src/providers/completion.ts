import { CompletionItem, CompletionItemKind, CompletionItemProvider, Position } from 'vscode'
import { getIdentifierRangeAtPosition } from '../utils'
import { getDeclaredVariables, isMessageSpan } from '../global-state'

const completionProvider: CompletionItemProvider = {
  provideCompletionItems(document, position, token, context) {
    const comment = document.lineAt(position.line).text
    if (comment.trimEnd() !== '#') {
      return
    }

    // Find message on the next line.
    const messagePosition = new Position(position.line + 1, 0)
    const identifier = document.getText(getIdentifierRangeAtPosition(document, messagePosition))
    if (isMessageSpan(document.uri.path, identifier, document.offsetAt(messagePosition)) === false) {
      return
    }

    const initialSpace = comment.endsWith(' ') ? '' : ' '
    const variableDocs = getDeclaredVariables(document.uri.path, identifier)
      .map(variable => `${variable}: `)
      .sort((a, b) => a.localeCompare(b))
      .join('\n# ')

    const item = new CompletionItem('Message comment', CompletionItemKind.Text)
    item.sortText = '\0'
    item.insertText = initialSpace + variableDocs

    return [item]
  },
}

export default completionProvider
