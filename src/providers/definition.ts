import {
  DefinitionProvider,
  Position,
  Range,
  Uri,
} from 'vscode'
import {
  getMessageIdSpan,
  getMessageValueSpan,
  isMessageReference,
} from '../global-state'
import { getIdentifierRangeAtPosition } from '../utils'

const definitionProvider: DefinitionProvider = {
  provideDefinition(document, position) {
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
        targetUri: Uri.file(document.uri.path),
        targetRange: new Range(
          messageIdPosition,
          messageValuePosition
        ),
        targetSelectionRange: new Range(
          messageIdPosition,
          new Position(messageIdPosition.line, messageIdentifier.length)
        ),
      },
    ]
  },
}

export default definitionProvider
