import chai, { expect } from 'chai'
import chaiShallowDeepEqual from 'chai-shallow-deep-equal'
import {
  Command,
  commands,
  Hover,
  Position,
  Range,
  SymbolInformation,
  SymbolKind,
  Uri,
  window,
  workspace,
} from 'vscode'
import * as path from 'path'

chai.use(chaiShallowDeepEqual)

const getFixturePath = (filename: string): string =>
  path.resolve(__dirname, path.join('..', '..', 'test', 'fixtures', filename))

const getUri = (filename: string): Uri =>
  Uri.file(getFixturePath(filename))

const getHoverAt = async (uri: Uri, position: Position) =>
  await commands.executeCommand('vscode.executeHoverProvider', uri, position) as Hover[]

const getDocumentSymbol = async (uri: Uri) =>
  await commands.executeCommand('vscode.executeDocumentSymbolProvider', uri) as SymbolInformation[]

const runCodeAction = async (uri: Uri, range: Range) =>
  await commands.executeCommand('vscode.executeCodeActionProvider', uri, range) as Command[]

suite('Extension Test Suite', () => {
  window.showInformationMessage('Start all tests.')

  test('Test hover', async () => {
    const uri = getUri('hover.ftl')
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc)

    const hovers = await Promise.all([
      getHoverAt(uri, new Position(3, 32)),
      getHoverAt(uri, new Position(4, 32)),
      getHoverAt(uri, new Position(5, 33)),
      getHoverAt(uri, new Position(10, 33)),
    ])

    expect(hovers.map(hover => hover.length))
      .eql([1, 1, 0, 1])

    expect(hovers.flatMap(hover => hover.length ? hover[0].contents[0] : []))
      .shallowDeepEqual([{ value: 'foo' }, { value: 'hey' }, { value: 'let\'s { $foo -> ... }' }])
  })

  test('Document symbol', async () => {
    const uri = getUri('document-symbol.ftl')
    const doc = await workspace.openTextDocument(uri)
    await window.showTextDocument(doc)

    const rootSymbols = await getDocumentSymbol(uri)

    expect(rootSymbols.length)
      .equal(3)

    expect(rootSymbols)
      .shallowDeepEqual([
        {
          name: '-term',
          detail: 'hey',
          kind: SymbolKind.String,
          location: { range: new Range(new Position(0, 1), new Position(0, 11)) },
        },
        {
          name: 'Section One',
          detail: '',
          kind: SymbolKind.Namespace,
          location: { range: new Range(new Position(2, 0), new Position(6, 0)) },
          children: [
            {
              name: 'basic',
              detail: 'foo',
              kind: SymbolKind.String,
              location: { range: new Range(new Position(4, 0), new Position(4, 11)) },
            },
            {
              name: 'message-interpolation',
              detail: 'the { basic } interpolation',
              kind: SymbolKind.String,
              location: { range: new Range(new Position(5, 0), new Position(5, 51)) },
            },
          ],
        },
        {
          name: 'Section Two',
          detail: '',
          kind: SymbolKind.Namespace,
          location: { range: new Range(new Position(7, 0), new Position(18, 0)) },
          children: [
            {
              name: 'term-interpolation',
              detail: 'hey, it\'s the\n{ -term } interpolation',
              kind: SymbolKind.String,
              location: { range: new Range(new Position(9, 0), new Position(11, 25)) },
            },
            {
              name: 'variable-interpolation',
              detail: 'the { $var } interpolation',
              kind: SymbolKind.String,
              location: { range: new Range(new Position(12, 0), new Position(12, 51)) },
            },
            {
              name: 'selector',
              detail: 'let\'s { $foo -> ... }',
              kind: SymbolKind.String,
              location: { range: new Range(new Position(13, 0), new Position(16, 1)) },
            },
            {
              name: 'selector-interpolation',
              detail: 'hey { selector }',
              kind: SymbolKind.String,
              location: { range: new Range(new Position(17, 0), new Position(17, 41)) },
            },
          ],
        },
      ])
  })

  test.only('Code Action - Extract string to Fluent file', async () => {
    // parei enquanto tentava automatizar os testes do code action

    const uriIndex = getUri('workspace/index.js')
    const doc = await workspace.openTextDocument(uriIndex)
    await window.showTextDocument(doc)

    const codeActions = await runCodeAction(uriIndex, new Range(new Position(0, 12), new Position(0, 21)))

    expect(codeActions)
      .shallowDeepEqual([
        {
          title: 'Extract to Fluent files',
          kind: { value: 'quickfix' },
          command: {
            command: 'extractStringToFluent',
            title: 'Extract string to Fluent files',
          },
        },
      ])

    // @ts-expect-error: can't find correctly the command properties
    const result = await commands.executeCommand(codeActions[0].command.command, codeActions[0].command.arguments[0], codeActions[0].command.arguments[1], codeActions[0].command.arguments[2])
    console.log(result)

    await commands.executeCommand('workbench.action.focusQuickOpen')
    await commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem')
  })
})
