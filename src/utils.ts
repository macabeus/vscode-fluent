import { TextDocument, Position } from 'vscode'

const getIdentifierRangeAtPosition = (document: TextDocument, position: Position) =>
  document.getWordRangeAtPosition(position, /[a-zA-Z0-9-]+/)

export { getIdentifierRangeAtPosition }
