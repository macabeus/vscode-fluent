const { Position } = vscode

describe('#Hover', () => {
  it('on message interpolation', () => {
    return using({
      files: {
        'en.ftl': dedent(`
          message = foo
          message-interpolation = the { message } interpolation
        `),
      }},
      async (mapFileToUri) => {
        const hovers = await take.hovers(mapFileToUri['en.ftl'], new Position(1, 32))

        expect(hovers).toEqual(['foo'])
      })
  })

  it('on term interpolation', () => {
    return using({
      files: {
        'en.ftl': dedent(`
          -term = foo
          term-interpolation = the { -term } interpolation
        `),
      }},
      async (mapFileToUri) => {
        const hovers = await take.hovers(mapFileToUri['en.ftl'], new Position(1, 32))

        expect(hovers).toEqual(['foo'])
      })
  })

  it('on selector interpolation', () => {
    return using({
      files: {
        'en.ftl': dedent(`
          selector =
            you are at { $position ->
              [1] the first
              [2] the second
             *[3] other
            } position
          selector-interpolation = the { selector } interpolation
        `),
      }},
      async (mapFileToUri) => {
        const hovers = await take.hovers(mapFileToUri['en.ftl'], new Position(6, 32))

        expect(hovers).toEqual(['you are at { $position -> ... } position'])
      })
  })

  it('on variable interpolation', () => {
    return using({
      files: {
        'en.ftl': dedent(`
          variable-interpolation = the { $var } interpolation
        `),
      }},
      async (mapFileToUri) => {
        const hovers = await take.hovers(mapFileToUri['en.ftl'], new Position(0, 3))

        expect(hovers).toHaveLength(0)
      })
  })
})

export {}
