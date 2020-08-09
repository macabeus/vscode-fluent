import {
  Diagnostic,
  Range,
  TextDocument,
} from 'vscode'
import { getJunksAnnotations } from '../global-state'

const diagnosticsFromJunkAnnotations = (uri: string, textDocument: TextDocument) => {
  const junksAnnotations = getJunksAnnotations(uri)

  const diagnostics = junksAnnotations.map(annotation => {
    const start = textDocument.positionAt(annotation.start)
    const end = textDocument.positionAt(annotation.end)

    const diagnostic = new Diagnostic(new Range(start, end), annotation.message)
    diagnostic.code = annotation.code

    return diagnostic
  })

  return diagnostics
}

export default diagnosticsFromJunkAnnotations
