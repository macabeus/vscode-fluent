import { workspace } from 'vscode'
import parser from './parser'

/**
 * Global to store the state of all FTLs files on the workspace
 */

type GlobalState = {
  [ftlPath in string]: {
    idSpan: { [messageIdentifier in string]: { start: number, end: number } }
    valueSpan: { [messageIdentifier in string]: { start: number, end: number } }
    termSpan: { [messageIdentifier in string]: { start: number, end: number } }
    hover: { [messageIdentifier in string]: string }
    groupComments: Array<{ name: string, start: number, end: number }>
    referenceSpan: { [messageIdentifier in string]: Array<{ start: number, end: number }> }
    junksAnnotations: Array<{ code: string, message: string, start: number, end: number }>
    variables: { [messageIdentifier in string]: Array<string> }
  }
}

const initialGlobalState = (): GlobalState => ({})
const globalState = initialGlobalState()

/**
 * Global to associate a project path to its FTLs
 */

type ProjectFtls = {
  isMultipleProjectWorkspace: boolean
  associations: {
    [projectPath in string]: string[]
  }
}

let globalProjectsFtls: ProjectFtls

const updateGlobalProjectsFtls = async (): Promise<void> => {
  const projects = workspace.getConfiguration('vscodeFluent').get('projects') as string[]
  const associationsEntries = await Promise.all(
    projects.map(async path => [
      path,
      await workspace.findFiles(`${path}/**/*.ftl`).then(uris => uris.map(uri => uri.path)),
    ])
  )

  globalProjectsFtls = {
    isMultipleProjectWorkspace: projects.length > 1,
    associations: Object.fromEntries(associationsEntries),
  }
}

updateGlobalProjectsFtls()

/**
 * Action/Reducers
 */

type UpdateGlobalStateParams = (
  { type: 'loadFtl', payload: { path: string, content: string } } |
  { type: 'updateConfiguration' }
)
const updateGlobalState = (params: UpdateGlobalStateParams) => {
  if (params.type === 'loadFtl') {
    globalState[params.payload.path] = parser(params.payload.content)
    return
  }

  if (params.type === 'updateConfiguration') {
    updateGlobalProjectsFtls()
    return
  }
}

/**
 * Helpers
 */

const getMessagesIdSpan = (path: string) =>
  globalState[path].idSpan

const getMessageIdSpan = (path: string, messageIdentifier: string) =>
  globalState[path].idSpan[messageIdentifier]

const getTermsSpan = (path: string) =>
  globalState[path].termSpan

const getTermSpan = (path: string, termIdentifier: string) =>
  globalState[path].termSpan[termIdentifier]

const getMessageValueSpan = (path: string, messageIdentifier: string) =>
  globalState[path].valueSpan[messageIdentifier]

const getMessageHover = (path: string, messageIdentifier: string) =>
  globalState[path].hover[messageIdentifier]

const isTermOrMessageReference = (path: string, identifier: string, position: number) => {
  const identifierSpan = globalState[path].referenceSpan[identifier]
  if (identifierSpan === undefined) {
    return false
  }

  const isInMessageRange = ({ start, end }: { start: number, end: number }) =>
    ((position >= start) && (position <= end))

  return identifierSpan.some(isInMessageRange)
}

const isMessageSpan = (path: string, identifier: string, position: number) => {
  const idSpan = globalState[path].idSpan[identifier]
  if (idSpan === undefined) {
    return false
  }

  return (position >= idSpan.start) && (position <= idSpan.end)
}

const getGroupComments = (path: string) =>
  globalState[path]?.groupComments

const getAllGroupComments = () =>
  Object
    .keys(globalState)
    .map((ftlPath) => ({ path: ftlPath, groupComments: globalState[ftlPath].groupComments }))

const getJunksAnnotations = (path: string) =>
  globalState[path].junksAnnotations

const getDeclaredVariables = (path: string, message: string) =>
  globalState[path].variables[message]

const getAssociatedFluentFilesByFilePath = (path: string) => {
  if (globalProjectsFtls.isMultipleProjectWorkspace === false) {
    return Object.keys(globalState)
  }

  const projectsPath = Object
    .keys(globalProjectsFtls.associations)
    .filter(associatePath => path.includes(associatePath))

  if (projectsPath.length === 0) {
    return { error: `There is no project associated to the path "${path}". Check the config "vscodeFluent.projects"` }
  }

  if (projectsPath.length > 1) {
    return { error: `Multiple projects associated to the path "${path}". Check the config "vscodeFluent.projects"` }
  }

  return globalProjectsFtls.associations[projectsPath[0]]
}

export {
  updateGlobalState,
  getMessagesIdSpan,
  getMessageIdSpan,
  getTermsSpan,
  getTermSpan,
  getMessageValueSpan,
  getMessageHover,
  isTermOrMessageReference,
  isMessageSpan,
  getGroupComments,
  getAllGroupComments,
  getJunksAnnotations,
  getDeclaredVariables,
  getAssociatedFluentFilesByFilePath,
}
