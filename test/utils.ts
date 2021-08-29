import type { Uri as TUri } from 'vscode'
import * as path from 'path'

const {
  Position,
  Uri,
  workspace,
  WorkspaceEdit,
} = vscode

// const getFixturePath = (filename: string) =>
//   path.resolve(__dirname, path.join('..', '..', 'test', 'fixtures', filename))

const workspacePath = path.resolve(__dirname, path.join('..', '..', 'test', 'workspace'))

// const getFixtureUri = (filename: string) =>
//   Uri.file(getFixturePath(filename))

type Files = {
  [filename: string]: string
}
type MapFilenameToUri = {
  [filename: string]: TUri
}
const withTheFiles = async (files: Files, closure: (mapFilenameToUri: MapFilenameToUri) => Promise<void>) => {
  const mapFilenameToUri = Object
    .keys(files)
    .reduce(
      (acc, filename) => {
        acc[filename] = Uri.file(path.join(workspacePath, filename))
        return acc
      },
      {} as MapFilenameToUri
    )

  // create the files
  const weCreateFiles = new WorkspaceEdit()
  Object.entries(files).forEach(([filename, content]) => {
    const fileUri = mapFilenameToUri[filename]
    weCreateFiles.createFile(fileUri)
    weCreateFiles.insert(fileUri, new Position(0, 0), content)
  })

  await workspace.applyEdit(weCreateFiles)
  await workspace.saveAll()

  // call closure
  closure(mapFilenameToUri)

  // delete the files created
  const weDeleteFiles = new WorkspaceEdit()
  Object.values(mapFilenameToUri).forEach((uri) => {
    weDeleteFiles.deleteFile(uri)
  })

  await workspace.applyEdit(weDeleteFiles)
}

export {
  // getFixtureUri,
  withTheFiles,
}
