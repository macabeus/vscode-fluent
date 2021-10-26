import { TextDocument, Position, workspace } from 'vscode'

const getIdentifierRangeAtPosition = (document: TextDocument, position: Position) =>
  document.getWordRangeAtPosition(position, /[a-zA-Z0-9-]+/)

const fileNameEndsWithFtl = (document: TextDocument) =>
  document.fileName.endsWith('.ftl')

const workspaceHasFtlFiles = async () => {
  const ftlFiles = await workspace.findFiles('**/*.ftl')
  const thereAreFtlFiles = ftlFiles.length > 0

  return thereAreFtlFiles
}

export {
  getIdentifierRangeAtPosition,
  fileNameEndsWithFtl,
  workspaceHasFtlFiles,
}
