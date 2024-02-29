const { Position, Range } = vscode

describe('#Definition', () => {
  it('on message reference', () => {
    return using(
      {
        files: {
          'en.ftl': dedent(`
            message = foo
            message-interpolation = the { message } interpolation
          `),
        },
      },
      async (mapFileToDoc) => {
        const definitions = await take.definitions(mapFileToDoc['en.ftl'], new Position(1, 32))

        expect(definitions).toHaveLength(1)
        expect(definitions[0]).toMatchObject({
          originSelectionRange: new Range(new Position(1, 30), new Position(1, 37)),
          targetRange: new Range(new Position(0, 0), new Position(0, 13)),
          targetSelectionRange: new Range(new Position(0, 0), new Position(0, 7)),
        })
      }
    )
  })

  it('on term reference', () => {
    return using(
      {
        files: {
          'en.ftl': dedent(`
            -term = foo
            term-interpolation = the { -term } interpolation
          `),
        },
      },
      async (mapFileToDoc) => {
        const definitions = await take.definitions(mapFileToDoc['en.ftl'], new Position(1, 32))

        expect(definitions).toHaveLength(1)
        expect(definitions[0]).toMatchObject({
          originSelectionRange: new Range(new Position(1, 27), new Position(1, 32)),
          targetRange: new Range(new Position(0, 1), new Position(0, 11)),
          targetSelectionRange: new Range(new Position(0, 1), new Position(0, 5)),
        })
      }
    )
  })

  it('on variable', () => {
    return using(
      {
        files: {
          'en.ftl': dedent(`
            variable-interpolation = the { $var } interpolation
          `),
        },
      },
      async (mapFileToDoc) => {
        const definitions = await take.definitions(mapFileToDoc['en.ftl'], new Position(0, 3))

        expect(definitions).toHaveLength(0)
      }
    )
  })
})

export {}
