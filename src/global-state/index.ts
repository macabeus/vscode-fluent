import parser from './parser'

type GlobalState = {
  [ftlPath in string]: {
    idSpan: { [messageIdentifier in string]: { start: number, end: number } }
    valueSpan: { [messageIdentifier in string]: { start: number, end: number } }
    hover: { [messageIdentifier in string]: string }
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

export { updateGlobalState, getMessageIdSpan, getMessageValueSpan, getMessageHover }
