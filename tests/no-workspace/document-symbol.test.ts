const { Position, SymbolKind, Range } = vscode

describe('#Document Symbol', () => {
  it('includes messages', () => {
    return using({
      files: {
        'en.ftl': 'basic = my message',
      },
    },
    async (mapFileToDoc) => {
      const symbols = await take.documentSymbols(mapFileToDoc['en.ftl'])

      expect(symbols).toHaveLength(1)
      expect(symbols[0]).toMatchObject({
        name: 'basic',
        detail: 'my message',
        kind: SymbolKind.String,
        location: { range: new Range(new Position(0, 0), new Position(0, 18)) },
      })
    })
  })

  it('includes multiline messages', () => {
    return using({
      files: {
        'en.ftl': dedent(`
          multiline =
            hey, it's
            my nice message!
        `),
      },
    },
    async (mapFileToDoc) => {
      const symbols = await take.documentSymbols(mapFileToDoc['en.ftl'])

      expect(symbols).toHaveLength(1)
      expect(symbols[0]).toMatchObject({
        name: 'multiline',
        detail: "hey, it's\nmy nice message!",
        kind: SymbolKind.String,
        location: { range: new Range(new Position(0, 0), new Position(2, 18)) },
      })
    })
  })

  it('includes terms', () => {
    return using({
      files: {
        'en.ftl': '-term = hey',
      },
    },
    async (mapFileToDoc) => {
      const symbols = await take.documentSymbols(mapFileToDoc['en.ftl'])

      expect(symbols).toHaveLength(1)
      expect(symbols[0]).toMatchObject({
        name: '-term',
        detail: 'hey',
        kind: SymbolKind.String,
        location: { range: new Range(new Position(0, 1), new Position(0, 11)) },
      })
    })
  })

  it('includes message with interpolation', () => {
    return using({
      files: {
        'en.ftl': 'message-interpolation = the { basic } interpolation',
      },
    },
    async (mapFileToDoc) => {
      const symbols = await take.documentSymbols(mapFileToDoc['en.ftl'])

      expect(symbols).toHaveLength(1)
      expect(symbols[0]).toMatchObject({
        name: 'message-interpolation',
        detail: 'the { basic } interpolation',
        kind: SymbolKind.String,
        location: { range: new Range(new Position(0, 0), new Position(0, 51)) },
      })
    })
  })

  it('includes term with interpolation', () => {
    return using({
      files: {
        'en.ftl': 'term-interpolation = the { -term } interpolation',
      },
    },
    async (mapFileToDoc) => {
      const symbols = await take.documentSymbols(mapFileToDoc['en.ftl'])

      expect(symbols).toHaveLength(1)
      expect(symbols[0]).toMatchObject({
        name: 'term-interpolation',
        detail: 'the { -term } interpolation',
        kind: SymbolKind.String,
        location: { range: new Range(new Position(0, 0), new Position(0, 48)) },
      })
    })
  })

  it('includes message with selector', () => {
    return using({
      files: {
        'en.ftl': dedent(`
          selector-interpolation =
            you are at { $position ->
              [1] the first
              [2] the second
             *[3] other
            } position
        `),
      },
    },
    async (mapFileToDoc) => {
      const symbols = await take.documentSymbols(mapFileToDoc['en.ftl'])

      expect(symbols).toHaveLength(1)
      expect(symbols[0]).toMatchObject({
        name: 'selector-interpolation',
        detail: "you are at { $position -> ... } position",
        kind: SymbolKind.String,
        location: { range: new Range(new Position(0, 0), new Position(5, 12)) },
      })
    })
  })

  it('includes sections', () => {
    return using({
      files: {
        'en.ftl': dedent(`
          outside = outside any group

          ## Section One

          inside-section-one = foo

          ## Section Two

          inside-section-two = bar
          also-inside-section-two = baz
        `),
      },
    },
    async (mapFileToDoc) => {
      const symbols = await take.documentSymbols(mapFileToDoc['en.ftl'])

      expect(symbols).toHaveLength(3)
      expect(symbols[0]).toMatchObject({
        name: 'outside',
        detail: 'outside any group',
        kind: SymbolKind.String,
        location: { range: new Range(new Position(0, 0), new Position(0, 27)) },
      })
      expect(symbols[1]).toMatchObject({
        name: 'Section One',
        detail: '',
        kind: SymbolKind.Namespace,
        location: { range: new Range(new Position(2, 0), new Position(5, 0)) },
        children: [
          {
            name: 'inside-section-one',
            detail: 'foo',
            kind: SymbolKind.String,
            location: { range: new Range(new Position(4, 0), new Position(4, 24)) },
          },
        ],
      })
      expect(symbols[2]).toMatchObject({
        name: 'Section Two',
        detail: '',
        kind: SymbolKind.Namespace,
        location: { range: new Range(new Position(6, 0), new Position(9, 29)) },
        children: [
          {
            name: 'inside-section-two',
            detail: 'bar',
            kind: SymbolKind.String,
            location: { range: new Range(new Position(8, 0), new Position(8, 24)) },
          },
          {
            name: 'also-inside-section-two',
            detail: 'baz',
            kind: SymbolKind.String,
            location: { range: new Range(new Position(9, 0), new Position(9, 29)) },
          },
        ],
      })
    })
  })
})

export {}
