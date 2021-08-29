// import chai, { expect } from 'chai'
// import chaiShallowDeepEqual from 'chai-shallow-deep-equal'
// import {
//   commands,
//   Position,
//   Range,
//   SymbolInformation,
//   SymbolKind,
//   Uri,
//   window,
//   workspace,
// } from 'vscode'
// import { getFixtureUri } from '../utils'

// chai.use(chaiShallowDeepEqual)

// const getDocumentSymbol = async (uri: Uri) =>
//   await commands.executeCommand('vscode.executeDocumentSymbolProvider', uri) as SymbolInformation[]

// suite('Document Symbol', () => {
//   window.showInformationMessage('Start all tests.')

//   test('Match snapshot', async () => {
//     const uri = getFixtureUri('document-symbol.ftl')
//     const doc = await workspace.openTextDocument(uri)
//     await window.showTextDocument(doc)

//     const rootSymbols = await getDocumentSymbol(uri)

//     expect(rootSymbols.length)
//       .equal(3)

//     expect(rootSymbols)
//       .shallowDeepEqual([
//         {
//           name: '-term',
//           detail: 'hey',
//           kind: SymbolKind.String,
//           location: { range: new Range(new Position(0, 1), new Position(0, 11)) },
//         },
//         {
//           name: 'Section One',
//           detail: '',
//           kind: SymbolKind.Namespace,
//           location: { range: new Range(new Position(2, 0), new Position(6, 0)) },
//           children: [
//             {
//               name: 'basic',
//               detail: 'foo',
//               kind: SymbolKind.String,
//               location: { range: new Range(new Position(4, 0), new Position(4, 11)) },
//             },
//             {
//               name: 'message-interpolation',
//               detail: 'the { basic } interpolation',
//               kind: SymbolKind.String,
//               location: { range: new Range(new Position(5, 0), new Position(5, 51)) },
//             },
//           ],
//         },
//         {
//           name: 'Section Two',
//           detail: '',
//           kind: SymbolKind.Namespace,
//           location: { range: new Range(new Position(7, 0), new Position(18, 0)) },
//           children: [
//             {
//               name: 'term-interpolation',
//               detail: 'hey, it\'s the\n{ -term } interpolation',
//               kind: SymbolKind.String,
//               location: { range: new Range(new Position(9, 0), new Position(11, 25)) },
//             },
//             {
//               name: 'variable-interpolation',
//               detail: 'the { $var } interpolation',
//               kind: SymbolKind.String,
//               location: { range: new Range(new Position(12, 0), new Position(12, 51)) },
//             },
//             {
//               name: 'selector',
//               detail: 'let\'s { $foo -> ... }',
//               kind: SymbolKind.String,
//               location: { range: new Range(new Position(13, 0), new Position(16, 1)) },
//             },
//             {
//               name: 'selector-interpolation',
//               detail: 'hey { selector }',
//               kind: SymbolKind.String,
//               location: { range: new Range(new Position(17, 0), new Position(17, 41)) },
//             },
//           ],
//         },
//       ])
//   })
// })
