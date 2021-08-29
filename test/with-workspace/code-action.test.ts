import type { Command, Uri, Range as TRange } from 'vscode'

const {
  commands,
  Range,
  Position,
  window,
  workspace,
  WorkspaceEdit,
} = vscode
import { withTheFiles } from '../utils'

const getCodeAction = async (uri: Uri, range: TRange) => {
  const doc = await workspace.openTextDocument(uri)
  await window.showTextDocument(doc)
  const codeActions = await commands.executeCommand('vscode.executeCodeActionProvider', uri, range) as Command[]

  return codeActions
}

describe('Code Action', () => {
  window.showInformationMessage('Start all tests.')

  describe('when there is no ftl file', () => {
    it('not have the option to extract string to fluent', async () =>
      withTheFiles(
        { 'index.js': '"example";' },
        async (mapFilenameToUri) => {
          const codeActions = await getCodeAction(
            mapFilenameToUri['index.js'],
            new Range(new Position(0, 0), new Position(0, 9))
          )

          expect(codeActions)
            .not
            .toContainEqual(
              expect.objectContaining({
                title: 'Extract to Fluent files',
                kind: { value: 'quickfix' },
                // command: {
                //   command: 'extractStringToFluent',
                //   title: 'Extract string to Fluent files',
                // },
              })
            )
        }
      )
    )
  })

  describe('when have a ftl file', () => {
    it('show the extract string to fluent', async () =>
      withTheFiles(
        {
          'index.js': '"example";',
          'en.ftl': '',
        },
        async (mapFilenameToUri) => {
          const codeActions = await getCodeAction(
            mapFilenameToUri['index.js'],
            new Range(new Position(0, 0), new Position(0, 9))
          )

          expect(codeActions)
            .toContainEqual(
              expect.objectContaining({
                title: 'Extract to Fluent files',
                kind: { value: 'quickfix' },
                // command: {
                //   command: 'extractStringToFluent',
                //   title: 'Extract string to Fluent files',
                // },
              })
            )
        }
      )
    )

    it.only('can extract a string to Fluent file', async () =>
      withTheFiles(
        {
          'index.js': '"example";',
          'en.ftl': '',
        },
        async (mapFilenameToUri) => {
          const codeActions = await getCodeAction(
            mapFilenameToUri['index.js'],
            new Range(new Position(0, 0), new Position(0, 9))
          )

          const extractToFluentFilesAction = codeActions.find(codeAction => codeAction.title === 'Extract to Fluent files')

          // @ts-expect-error: can't find correctly the command properties
          const result = await commands.executeCommand(extractToFluentFilesAction?.command.command, extractToFluentFilesAction?.command.arguments[0], extractToFluentFilesAction?.command.arguments[1], extractToFluentFilesAction?.command.arguments[2])

          debugger
          console.log(result)

          await commands.executeCommand('workbench.action.focusQuickOpen')
          await commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem')
        }
      )

      // const uriIndex = getFixtureUri('workspace/with-ftl/index.js')
      // const doc = await workspace.openTextDocument(uriIndex)
      // await window.showTextDocument(doc)

      // const codeActions = await getCodeAction(uriIndex, new Range(new Position(0, 0), new Position(0, 9)))

      // // parei enquanto melhorava o teste para não depender só do chai
      // // refatorar para usar o jest

      // // @ts-expect-error: fdfdfd
      // expect(codeActions)
      //   .contains({
      //     title: 'Extract to Fluent files',
      //     kind: { value: 'quickfix' },
      //     command: {
      //       command: 'extractStringToFluent',
      //       title: 'Extract string to Fluent files',
      //     },
      //   })

      // debugger

      // // @ts-expect-error: can't find correctly the command properties
      // const result = await commands.executeCommand(codeActions[0].command.command, codeActions[0].command.arguments[0], codeActions[0].command.arguments[1], codeActions[0].command.arguments[2])
      // console.log(result)

      // await commands.executeCommand('workbench.action.focusQuickOpen')
      // await commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem')
    )
  })
})
