// import chai, { expect } from 'chai'
// import chaiShallowDeepEqual from 'chai-shallow-deep-equal'
// import {
//   commands,
//   Hover,
//   Position,
//   Uri,
//   window,
//   workspace,
// } from 'vscode'
// import { getFixtureUri } from '../utils'

// chai.use(chaiShallowDeepEqual)

// const getHoverAt = async (uri: Uri, position: Position) =>
//   await commands.executeCommand('vscode.executeHoverProvider', uri, position) as Hover[]

// suite('Hover', () => {
//   window.showInformationMessage('Start all tests.')

//   test('Match snapshot', async () => {
//     const uri = getFixtureUri('hover.ftl')
//     const doc = await workspace.openTextDocument(uri)
//     await window.showTextDocument(doc)

//     const hovers = await Promise.all([
//       getHoverAt(uri, new Position(3, 32)),
//       getHoverAt(uri, new Position(4, 32)),
//       getHoverAt(uri, new Position(5, 33)),
//       getHoverAt(uri, new Position(10, 33)),
//     ])

//     expect(hovers.map(hover => hover.length))
//       .eql([1, 1, 0, 1])

//     expect(hovers.flatMap(hover => hover.length ? hover[0].contents[0] : []))
//       .shallowDeepEqual([{ value: 'foo' }, { value: 'hey' }, { value: 'let\'s { $foo -> ... }' }])
//   })
// })
