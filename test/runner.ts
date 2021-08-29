import * as Jest from 'jest'
import glob from 'glob'

const runner = (testsRoot: string): Promise<void> => {
  return new Promise((resolve, error) => {
    glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
      if (err) {
        return error(err)
      }

      const config = {
        _: [],
        $0: '/Users/macabeus/ApenasMeu/vscode-fluent/out/test/with-workspace/',
        env: 'vscode',
        json: true,
        outputFile: '/Users/macabeus/ApenasMeu/vscode-fluent/output.json',
        testMatch: ['./**/code-action.test.js'],
        extraGlobals: ['vscode'],
      }

      try {
        Jest.runCLI(config, ['/Users/macabeus/ApenasMeu/vscode-fluent/out/test/with-workspace/'])
          .catch((error) => {
            debugger
            console.log('Error:')
            console.log(error)
          })
          .then((result) => {
            console.log('Done')
          })
      } catch (err) {
        console.error(err)
        error(err)
      }
    })
  })
}

export default runner
