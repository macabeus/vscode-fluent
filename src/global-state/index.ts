import parser from './parser'

type GlobalState = {
  [ftlPath in string]: {
    idSpan: { [messageIdentifier in string]: { start: number, end: number } }
    valueSpan: { [messageIdentifier in string]: { start: number, end: number } }
    hover: { [messageIdentifier in string]: string }
    groupComments: Array<{ name: string, start: number, end: number }>
    messageReferenceSpan: { [messageIdentifier in string]: Array<{ start: number, end: number }> }
    junksAnnotations: Array<{ code: string, message: string, start: number, end: number }>
  }
}

const initialState = (): GlobalState => ({})

const globalState = initialState()

type UpdateGlobalStateParams = (
  { type: 'loadFtl', payload: { path: string, content: string } }
)
const updateGlobalState = (params: UpdateGlobalStateParams) => {
  if (params.type === 'loadFtl') {
    globalState[params.payload.path] = parser(params.payload.content)
  }
}

const getMessageIdSpan = (path: string, messageIdentifier: string) =>
  globalState[path].idSpan[messageIdentifier]

const getMessageValueSpan = (path: string, messageIdentifier: string) =>
  globalState[path].valueSpan[messageIdentifier]

const getMessageHover = (path: string, messageIdentifier: string) =>
  globalState[path].hover[messageIdentifier]

const isMessageReference = (path: string, messageIdentifier: string, position: number) => {
  const messageSpans = globalState[path].messageReferenceSpan[messageIdentifier]
  if (messageSpans === undefined) {
    return false
  }

  const isInMessageRange = ({ start, end }: { start: number, end: number }) =>
    ((position >= start) && (position <= end))

  return messageSpans.some(isInMessageRange)
}

const getGroupComments = () =>
  Object
    .keys(globalState)
    .map((ftlPath) => ({ path: ftlPath, groupComments: globalState[ftlPath].groupComments }))

const getJunksAnnotations = (path: string) =>
  globalState[path].junksAnnotations

export {
  updateGlobalState,
  getMessageIdSpan,
  getMessageValueSpan,
  getMessageHover,
  isMessageReference,
  getGroupComments,
  getJunksAnnotations,
}
