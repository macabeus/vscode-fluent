import {
  DocumentSymbol,
  DocumentSymbolProvider,
  Range,
  SymbolKind,
} from 'vscode'
import {
  getGroupComments,
  getMessageHover,
  getMessagesIdSpan,
  getMessageValueSpan,
  getTermsSpan,
} from '../global-state'

const documentSymbolProvider: DocumentSymbolProvider = {
  provideDocumentSymbols(document) {
    // Symbols that aren't inside in a group
    const rootSymbols: DocumentSymbol[] = []

    // Create symbols of groups and a helper function to build the hierarchy
    const groups = getGroupComments(document.uri.path).slice().reverse()
    const groupSymbols = groups.map((currentGroup, index) => {
      const rangeStart = document.positionAt(currentGroup.start)

      const rangeEnd = (index === 0
        ? document.lineAt(document.lineCount - 1).range.end
        : document.positionAt(groups[index - 1].start - 1)
      )

      return new DocumentSymbol(
        currentGroup.name,
        '',
        SymbolKind.Namespace,
        new Range(rangeStart, rangeEnd),
        new Range(rangeStart, rangeEnd)
      )
    })

    const groupsEnd = groups.map(group => group.end)
    const groupIndexAtLine = (offset: number) =>
      groupsEnd.findIndex(currentOffset => currentOffset < offset)

    const addSymbol = (symbol: DocumentSymbol, spanStart: number) => {
      const insideOnGroupIndex = groupIndexAtLine(spanStart)
      if (insideOnGroupIndex === -1) {
        rootSymbols.push(symbol)
        return
      }
      groupSymbols[insideOnGroupIndex].children.push(symbol)
    }

    // Create symbols of messages
    const messagesIdSpan = getMessagesIdSpan(document.uri.path)
    Object.keys(messagesIdSpan).forEach(id => {
      const span = messagesIdSpan[id]
      const valueSpan = getMessageValueSpan(document.uri.path, id)

      const positionRange = new Range(
        document.positionAt(span.start),
        document.positionAt(valueSpan.end)
      )

      const messageSymbol = new DocumentSymbol(
        id,
        getMessageHover(document.uri.path, id),
        SymbolKind.String,
        positionRange,
        positionRange
      )

      addSymbol(messageSymbol, span.start)
    })

    // Create symbols of terms
    const termsSpan = getTermsSpan(document.uri.path)
    Object.keys(termsSpan).forEach(id => {
      const span = termsSpan[id]
      const valueSpan = getMessageValueSpan(document.uri.path, id)

      const positionRange = new Range(
        document.positionAt(span.start),
        document.positionAt(valueSpan.end)
      )

      const termSymbol = new DocumentSymbol(
        id,
        getMessageHover(document.uri.path, id),
        SymbolKind.String,
        positionRange,
        positionRange
      )

      addSymbol(termSymbol, span.start)
    })

    //
    return [...rootSymbols, ...groupSymbols]
  },
}

export default documentSymbolProvider
