const { Range, Position } = vscode

jest.setTimeout(99999)

describe('#Code Action', () => {
  describe('when there is no ftl file', () => {
    it('does not have the option to extract string to fluent', () => {
      return using(
        {
          files: {
            'index.js': '"example";',
          },
        },
        async (mapFilenameToUri) => {
          const codeActions = await take.codeActions(
            mapFilenameToUri['index.js'],
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
        async (mapFilenameToUri) => {
          const codeActions = await take.codeActions(
            mapFilenameToUri['index.js'],
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
        async (mapFilenameToUri) => {
          const codeActions = await take.codeActions(
            mapFilenameToUri['index.js'],
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
          async (mapFilenameToUri) => {
            const codeActions = await take.codeActions(
              mapFilenameToUri['index.js'],
              new Range(new Position(0, 0), new Position(0, 9))
            )

            await codeActions['Extract to Fluent files']()

            const currentText = await waitFor.not.documentChange(mapFilenameToUri['index.js'])
            expect(currentText).toBe('"example";')

            const ftlText = await take.documentText(mapFilenameToUri['en.ftl'])
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
            async (mapFilenameToUri) => {
              const codeActions = await take.codeActions(
                mapFilenameToUri['index.js'],
                new Range(new Position(0, 0), new Position(0, 9))
              )

              await codeActions['Extract to Fluent files']()

              const currentText = await waitFor.not.documentChange(mapFilenameToUri['index.js'])
              expect(currentText).toBe('"example";')

              const ftlText = await take.documentText(mapFilenameToUri['en.ftl'])
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
              async (mapFilenameToUri) => {
                const codeActions = await take.codeActions(
                  mapFilenameToUri['index.js'],
                  new Range(new Position(0, 0), new Position(0, 9))
                )

                await codeActions['Extract to Fluent files']()

                const currentText = await waitFor.not.documentChange(mapFilenameToUri['index.js'])
                expect(currentText).toBe('"example";')

                const ftlText = await take.documentText(mapFilenameToUri['en.ftl'])
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
              async (mapFilenameToUri) => {
                const codeActions = await take.codeActions(
                  mapFilenameToUri['index.js'],
                  new Range(new Position(0, 0), new Position(0, 9))
                )

                await codeActions['Extract to Fluent files']()

                const currentText = await waitFor.not.documentChange(mapFilenameToUri['index.js'])
                expect(currentText).toBe('"example";')

                const ftlText = await take.documentText(mapFilenameToUri['en.ftl'])
                expect(ftlText).toBe('')
              }
            )
          })
        })

        describe('and fill a valid message id', () => {
          it('move the message to ftl file', () => {
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
                    .mockResolvedValueOnce('my-message-id'),
                },
              },
              async (mapFilenameToUri) => {
                const codeActions = await take.codeActions(
                  mapFilenameToUri['index.js'],
                  new Range(new Position(0, 0), new Position(0, 9))
                )

                await codeActions['Extract to Fluent files']()

                const newText = await waitFor.documentChange(mapFilenameToUri['index.js'])
                expect(newText).toBe("t('my-message-id');")

                const ftlText = await take.documentText(mapFilenameToUri['en.ftl'])
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
