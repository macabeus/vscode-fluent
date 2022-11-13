import type { TextDocument } from 'vscode'

const { Range, Position } = vscode

jest.setTimeout(99999)

const exceptNoTextChange = async (doc: TextDocument) => {
  const text = await take.documentText(doc)

  try {
    const newText = await waitFor(async () => {
      const newText = await take.documentText(doc)
      expect(newText).not.toBe(text)
      return newText
    })

    throw new Error(`Text from document "${doc.fileName}" changed from "${text}" to "${newText}"`)
  } catch (e) {
    if ((e as Error)?.message === 'Timeout on waitFor') {
      return
    }

    throw e
  }
}

describe('#Code Action', () => {
  describe('when there is no ftl file', () => {
    it('does not have the option to extract string to fluent', () => {
      return using(
        {
          files: {
            'index.js': '"example";',
          },
        },
        async (mapFileToDoc) => {
          const codeActions = await take.codeActions(
            mapFileToDoc['index.js'],
            new Range(new Position(0, 0), new Position(0, 9))
          )

          expect(codeActions['Extract to Fluent files']).not.toBeDefined()
        }
      )
    })
  })

  describe('when has an ftl file', () => {
    it('have the option to extract string to fluent', () => {
      return using(
        {
          files: {
            'index.js': '"example";',
            'en.ftl': '',
          },
        },
        async (mapFileToDoc) => {
          const codeActions = await take.codeActions(
            mapFileToDoc['index.js'],
            new Range(new Position(0, 0), new Position(0, 9))
          )

          expect(codeActions['Extract to Fluent files']).toBeDefined()
        }
      )
    })

    it('list the groups', () => {
      return using(
        {
          files: {
            'index.js': '"example";',
            'en.ftl': dedent(`
              ## First Group

              first-id = example

              ## Second Group

              second-id = example
            `),
          },
          mocks: {
            'window.showQuickPick': jest.fn().mockImplementation(
              (items) => expect(items).toEqual(['* Add new group', 'First Group', 'Second Group'])
            ),
          },
        },
        async (mapFileToDoc) => {
          await new Promise(r => setTimeout(r, 1000))

          const codeActions = await take.codeActions(
            mapFileToDoc['index.js'],
            new Range(new Position(0, 0), new Position(0, 9))
          )

          await codeActions['Extract to Fluent files']()
        }
      )
    })

    describe('if select no group', () => {
      it('cancel the operation', () => {
        return using(
          {
            files: {
              'index.js': '"example";',
              'en.ftl': '',
            },
            mocks: {
              'window.showQuickPick': async () => undefined,
            },
          },
          async (mapFileToDoc) => {
            await new Promise(r => setTimeout(r, 1000))
            const codeActions = await take.codeActions(
              mapFileToDoc['index.js'],
              new Range(new Position(0, 0), new Position(0, 9))
            )

            await codeActions['Extract to Fluent files']()

            await exceptNoTextChange(mapFileToDoc['index.js'])

            const ftlText = await take.documentText(mapFileToDoc['en.ftl'])
            expect(ftlText).toBe('')
          }
        )
      })
    })

    describe('if select to create a new group', () => {
      describe('and cancel the input box to type the new group name', () => {
        it('cancel the operation', () => {
          return using(
            {
              files: {
                'index.js': '"example";',
                'en.ftl': '',
              },
              mocks: {
                'window.showQuickPick': async () => '* Add new group',
                'window.showInputBox': async () => undefined,
              },
            },
            async (mapFileToDoc) => {
              await new Promise(r => setTimeout(r, 1000))
              const codeActions = await take.codeActions(
                mapFileToDoc['index.js'],
                new Range(new Position(0, 0), new Position(0, 9))
              )

              await codeActions['Extract to Fluent files']()

              await exceptNoTextChange(mapFileToDoc['index.js'])

              const ftlText = await take.documentText(mapFileToDoc['en.ftl'])
              expect(ftlText).toBe('')
            }
          )
        })
      })

      describe('and fill the new group name', () => {
        describe('and cancel the input box to type the message id', () => {
          it('cancel the operation', () => {
            return using(
              {
                files: {
                  'index.js': '"example";',
                  'en.ftl': '',
                },
                mocks: {
                  'window.showQuickPick': async () => '* Add new group',
                  'window.showInputBox': jest.fn()
                    .mockResolvedValueOnce('My Group')
                    .mockResolvedValueOnce(undefined),
                },
              },
              async (mapFileToDoc) => {
                await new Promise(r => setTimeout(r, 1000))
                const codeActions = await take.codeActions(
                  mapFileToDoc['index.js'],
                  new Range(new Position(0, 0), new Position(0, 9))
                )

                await codeActions['Extract to Fluent files']()

                await exceptNoTextChange(mapFileToDoc['index.js'])

                const ftlText = await take.documentText(mapFileToDoc['en.ftl'])
                expect(ftlText).toBe('')
              }
            )
          })
        })

        describe('and fill an invalid message id', () => {
          it('cancel the operation', () => {
            return using(
              {
                files: {
                  'index.js': '"example";',
                  'en.ftl': '',
                },
                mocks: {
                  'window.showQuickPick': async () => '* Add new group',
                  'window.showInputBox': jest.fn()
                    .mockResolvedValueOnce('My Group')
                    .mockResolvedValueOnce(''),
                },
              },
              async (mapFileToDoc) => {
                await new Promise(r => setTimeout(r, 1000))
                const codeActions = await take.codeActions(
                  mapFileToDoc['index.js'],
                  new Range(new Position(0, 0), new Position(0, 9))
                )

                await codeActions['Extract to Fluent files']()

                await exceptNoTextChange(mapFileToDoc['index.js'])

                const ftlText = await take.documentText(mapFileToDoc['en.ftl'])
                expect(ftlText).toBe('')
              }
            )
          })
        })

        describe('and fill a valid message id', () => {
          it('move the message to ftl file', () => {
            const indexJsInitialText = '"example";'
            return using(
              {
                files: {
                  'index.js': indexJsInitialText,
                  'en.ftl': '',
                },
                mocks: {
                  'window.showQuickPick': async () => '* Add new group',
                  'window.showInputBox': jest.fn()
                    .mockResolvedValueOnce('My Group')
                    .mockResolvedValueOnce('my-message-id'),
                },
              },
              async (mapFileToDoc) => {
                await new Promise(r => setTimeout(r, 1000))
                const codeActions = await take.codeActions(
                  mapFileToDoc['index.js'],
                  new Range(new Position(0, 0), new Position(0, 9))
                )

                await codeActions['Extract to Fluent files']()

                const newText = await waitFor(async () => {
                  const newText = await take.documentText(mapFileToDoc['index.js'])
                  expect(newText).not.toBe(indexJsInitialText)
                  return newText
                })
                expect(newText).toBe("t('my-message-id');")
                // await exceptNoTextChange(mapFileToDoc['index.js'])

                const ftlText = await take.documentText(mapFileToDoc['en.ftl'])
                expect(ftlText).toBe(
                  dedent(`
                    ## My Group

                    my-message-id = example
                  `)
                )
              }
            )
          })
        })
      })
    })
  })
})

export {}
