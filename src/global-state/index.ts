import parser from './parser'

type GlobalState = {
  [ftlPath in string]: {
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

const getMessageHover = (path: string, messageIdentifier: string) =>
  globalState[path].hover[messageIdentifier]

export { updateGlobalState, getMessageHover }
