import path from 'path'
import Mocha from 'mocha'
import glob from 'glob'

export function run(): Promise<void> {
  const mocha = new Mocha({
    color: true,
    ui: 'tdd',
    timeout: '30s',
  })

  const testsRoot = path.resolve(__dirname, '..')

  return new Promise((c, e) => {
    glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
      if (err) {
        return e(err)
      }

      files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)))

      try {
        mocha.run(failures => {
          if (failures > 0) {
            e(new Error(`${failures} tests failed.`))
          } else {
            c()
          }
        })
      } catch (err) {
        console.error(err)
        e(err)
      }
    })
  })
}
