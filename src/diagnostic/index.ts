import {
  DiagnosticCollection,
  languages,
  Uri,
  workspace,
} from 'vscode'
import diagnosticsFromJunkAnnotations from './diagnostics-from-junk-annotations'

const diagnosticCollections: {
  [path in string]: DiagnosticCollection
} = {}

const updateDiagnosticCollection = async (uri: string) => {
  const textDocument = await workspace.openTextDocument(uri)

  if (diagnosticCollections[uri] === undefined) {
    diagnosticCollections[uri] = languages.createDiagnosticCollection(uri)
  }
  diagnosticCollections[uri].clear()

  const diagnostics = [
    ...diagnosticsFromJunkAnnotations(uri, textDocument),
  ]

  diagnosticCollections[uri].set(Uri.file(uri), diagnostics)
}

export { updateDiagnosticCollection }
