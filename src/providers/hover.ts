import { HoverProvider } from 'vscode'
import { getMessageHover, isMessageReference } from '../global-state'
import { getIdentifierRangeAtPosition } from '../utils'

const hoverProvider: HoverProvider = {
  provideHover(document, position) {
    const messageIdentifier = document.getText(getIdentifierRangeAtPosition(document, position))

    if (isMessageReference(document.uri.path, messageIdentifier, document.offsetAt(position)) === false) {
      return
    }

    const content = getMessageHover(document.uri.path, messageIdentifier)

    return {
      contents: [content],
    }
  },
}

export default hoverProvider
