import { HoverProvider } from 'vscode'
import { getMessageHover, isTermOrMessageReference } from '../global-state'
import { getIdentifierRangeAtPosition } from '../utils'

const hoverProvider: HoverProvider = {
  provideHover(document, position) {
    const identifier = document.getText(getIdentifierRangeAtPosition(document, position))

    if (isTermOrMessageReference(document.uri.path, identifier, document.offsetAt(position)) === false) {
      return
    }

    const content = getMessageHover(document.uri.path, identifier)

    return {
      contents: [content],
    }
  },
}

export default hoverProvider
